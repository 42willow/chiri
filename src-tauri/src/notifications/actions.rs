use tauri::{AppHandle, Emitter, Manager};

use super::types::NotificationActionEvent;

pub const COMPLETE: &str = "complete";
pub const SNOOZE_15MIN: &str = "snooze-15min";
pub const SNOOZE_1HR: &str = "snooze-1hr";
pub const VIEW: &str = "view";

#[cfg(target_os = "macos")]
pub const MACOS_COMPLETE: &str = "garden.chiri.Chiri.action.complete";
#[cfg(target_os = "macos")]
pub const MACOS_SNOOZE_15MIN: &str = "garden.chiri.Chiri.action.snooze.15min";
#[cfg(target_os = "macos")]
pub const MACOS_SNOOZE_1HR: &str = "garden.chiri.Chiri.action.snooze.1hr";
#[cfg(target_os = "macos")]
pub const MACOS_VIEW: &str = "garden.chiri.Chiri.action.view";

#[cfg(any(target_os = "linux", target_os = "windows"))]
pub fn plain_action_name(action_id: &str) -> Option<&'static str> {
    match action_id {
        COMPLETE => Some(COMPLETE),
        SNOOZE_15MIN => Some(SNOOZE_15MIN),
        SNOOZE_1HR => Some(SNOOZE_1HR),
        VIEW | "__default" => Some(VIEW),
        _ => None,
    }
}

#[cfg(target_os = "macos")]
pub fn macos_action_name(action_id: &str) -> Option<&'static str> {
    match action_id {
        MACOS_COMPLETE => Some(COMPLETE),
        MACOS_SNOOZE_15MIN => Some(SNOOZE_15MIN),
        MACOS_SNOOZE_1HR => Some(SNOOZE_1HR),
        MACOS_VIEW => Some(VIEW),
        _ => None,
    }
}

pub fn show_main_window<R: tauri::Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();

        #[cfg(target_os = "macos")]
        crate::window::show_dock_icon(app);
    }
}

pub fn emit_action<R: tauri::Runtime>(
    app: &AppHandle<R>,
    action: &str,
    task_id: String,
    notification_type: String,
) {
    let _ = app.emit(
        "notification-action",
        NotificationActionEvent {
            action: action.to_string(),
            task_id,
            notification_type,
        },
    );
}
