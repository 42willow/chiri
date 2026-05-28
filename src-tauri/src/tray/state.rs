use std::sync::Mutex;

use tauri::menu::MenuItem;

use super::AppRuntime;

type MenuUpdater = Box<dyn Fn(String) + Send>;

pub struct TrayState {
    menu_updater: Mutex<Option<MenuUpdater>>,
    sync_item: Mutex<Option<MenuItem<AppRuntime>>>,
    enabled: Mutex<bool>,
}

impl Default for TrayState {
    fn default() -> Self {
        Self {
            menu_updater: Mutex::new(None),
            sync_item: Mutex::new(None),
            enabled: Mutex::new(true),
        }
    }
}

impl TrayState {
    pub fn is_enabled(&self) -> Result<bool, String> {
        self.enabled
            .lock()
            .map(|enabled| *enabled)
            .map_err(|e| format!("Failed to lock tray enabled state: {e}"))
    }

    pub(in crate::tray) fn set_enabled(&self, enabled: bool) -> Result<(), String> {
        *self
            .enabled
            .lock()
            .map_err(|e| format!("Failed to lock tray enabled state: {e}"))? = enabled;
        Ok(())
    }

    pub(in crate::tray) fn set_menu_updater(&self, updater: MenuUpdater) -> Result<(), String> {
        *self
            .menu_updater
            .lock()
            .map_err(|e| format!("Failed to lock tray menu updater: {e}"))? = Some(updater);
        Ok(())
    }

    pub(in crate::tray) fn set_sync_item(
        &self,
        sync_item: MenuItem<AppRuntime>,
    ) -> Result<(), String> {
        *self
            .sync_item
            .lock()
            .map_err(|e| format!("Failed to lock tray sync item: {e}"))? = Some(sync_item);
        Ok(())
    }

    pub(in crate::tray) fn update_sync_time(&self, time_str: String) -> Result<(), String> {
        if let Some(updater) = self
            .menu_updater
            .lock()
            .map_err(|e| format!("Failed to lock tray menu updater: {e}"))?
            .as_ref()
        {
            updater(time_str);
        }
        Ok(())
    }

    pub(in crate::tray) fn update_sync_enabled(&self, enabled: bool) -> Result<(), String> {
        if let Some(sync_item) = self
            .sync_item
            .lock()
            .map_err(|e| format!("Failed to lock tray sync item: {e}"))?
            .as_ref()
        {
            sync_item.set_enabled(enabled).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}
