use std::path::{Path, PathBuf};
use tauri::Manager;

use crate::utils::fs::{copy_dir_recursive, is_dir_empty};

/// Derive the legacy source path by substituting `old_id` for `new_id` in
/// the Tauri-resolved path. Using rfind means we target the rightmost
/// occurrence, the identifier segment, without touching any parent dirs
/// that happen to contain a matching substring.
///
/// Returns `None` if `new_id` does not appear in the path.
fn legacy_path_for(new: &Path, old_id: &str, new_id: &str) -> Option<PathBuf> {
    let s = new.to_str()?;
    let pos = s.rfind(new_id)?;
    Some(PathBuf::from(format!(
        "{}{}{}",
        &s[..pos],
        old_id,
        &s[pos + new_id.len()..]
    )))
}

/// Copy `old` to `new` when old exists and new is absent or empty.
/// Non-destructive: old is left in place as an implicit backup.
/// Idempotent: a populated target is always skipped.
fn migrate_path_pair(label: &str, old: &Path, new: &Path) {
    if !old.exists() {
        return;
    }
    if new.exists() && !is_dir_empty(new).unwrap_or(true) {
        log::debug!(
            "[Legacy] Skipping {label}: target already populated ({})",
            new.display()
        );
        return;
    }
    log::info!(
        "[Legacy] Migrating {label}: {} -> {}",
        old.display(),
        new.display()
    );
    if let Err(e) = std::fs::create_dir_all(new) {
        log::warn!("[Legacy] Failed to create target for {label}: {e}");
        return;
    }
    if let Err(e) = copy_dir_recursive(old, new) {
        log::warn!("[Legacy] Failed to copy {label}: {e}");
    } else {
        log::info!("[Legacy] {label} migrated successfully");
    }
}

/// Migrate app data from the old `moe.sapphic.Chiri` identifier to the
/// current identifier introduced in 0.9.0.
///
/// Scopes migrated:
/// - `app_local_data_dir`: chiri.db and WebView data
/// - `app_config_dir`: roaming config on Windows; ~/.config/<id> on Linux
/// - `app_log_dir`: log files
/// - `~/Library/WebKit`: WebKit storage on macOS only
///
/// Migration is non-destructive and runs at most once, gated by a marker file.
pub fn migrate_identifier<R: tauri::Runtime>(app: &tauri::App<R>) {
    const OLD_IDENTIFIER: &str = "moe.sapphic.Chiri";
    const MARKER_FILE: &str = ".legacy_migration_v1_done";

    let new_identifier = app.config().identifier.clone();

    let marker_path = app
        .path()
        .app_local_data_dir()
        .ok()
        .map(|d| d.join(MARKER_FILE));
    if marker_path.as_deref().map(|p| p.exists()).unwrap_or(false) {
        return;
    }

    log::info!("[Legacy] Checking for old {OLD_IDENTIFIER} data...");

    let path = app.path();

    let scopes: &[(&str, Result<PathBuf, _>)] = &[
        ("app data", path.app_local_data_dir()),
        ("app config", path.app_config_dir()),
        ("app logs", path.app_log_dir()),
    ];

    for (label, resolved) in scopes {
        match resolved {
            Ok(new_path) => match legacy_path_for(new_path, OLD_IDENTIFIER, &new_identifier) {
                Some(old_path) if old_path != *new_path => {
                    migrate_path_pair(label, &old_path, new_path);
                }
                _ => {}
            },
            Err(e) => {
                log::warn!("[Legacy] Could not resolve {label} path: {e}");
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Some(home) = dirs::home_dir() {
            let webkit_base = home.join("Library/WebKit");
            let old_webkit = webkit_base.join(OLD_IDENTIFIER);
            let new_webkit = webkit_base.join(&new_identifier);

            for subdir in &["WebsiteData/LocalStorage", "WebsiteData/IndexedDB"] {
                let old_sub = old_webkit.join(subdir);
                let new_sub = new_webkit.join(subdir);
                if old_sub.exists() {
                    migrate_path_pair(&format!("WebKit/{subdir}"), &old_sub, &new_sub);
                }
            }
        }
    }

    if let Some(marker) = marker_path {
        if let Err(e) = std::fs::create_dir_all(marker.parent().unwrap_or(&marker)) {
            log::warn!("[Legacy] Could not create data dir for marker: {e}");
        } else if let Err(e) = std::fs::write(&marker, "") {
            log::warn!("[Legacy] Could not write migration marker: {e}");
        }
    }

    log::info!("[Legacy] Identifier migration done.");
}
