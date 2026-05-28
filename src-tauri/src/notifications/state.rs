use std::sync::Arc;

use user_notify::{get_notification_manager, NotificationManager};

#[derive(Debug, Clone)]
pub struct NotificationManagerState {
    pub(crate) manager: Arc<dyn NotificationManager>,
}

impl NotificationManagerState {
    pub fn new(app_id: String) -> Self {
        Self {
            manager: get_notification_manager(app_id, None),
        }
    }
}
