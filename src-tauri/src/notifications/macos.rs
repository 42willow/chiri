use tauri::AppHandle;
use user_notify::{
    NotificationCategory, NotificationCategoryAction, NotificationResponse,
    NotificationResponseAction,
};

use super::{
    actions::{
        emit_action, macos_action_name, show_main_window, MACOS_COMPLETE, MACOS_SNOOZE_15MIN,
        MACOS_SNOOZE_1HR, MACOS_VIEW, VIEW,
    },
    state::NotificationManagerState,
    types::{
        TASK_OVERDUE_CATEGORY, TASK_REMINDER_CATEGORY, USER_INFO_NOTIFICATION_TYPE,
        USER_INFO_TASK_ID,
    },
};

impl NotificationManagerState {
    pub fn register_categories_and_handler(&self, app: AppHandle<impl tauri::Runtime>) {
        let categories = vec![
            NotificationCategory {
                identifier: TASK_OVERDUE_CATEGORY.to_string(),
                actions: vec![
                    NotificationCategoryAction::Action {
                        identifier: MACOS_COMPLETE.to_string(),
                        title: "Complete".to_string(),
                    },
                    NotificationCategoryAction::Action {
                        identifier: MACOS_SNOOZE_1HR.to_string(),
                        title: "Snooze 1hr".to_string(),
                    },
                    NotificationCategoryAction::Action {
                        identifier: MACOS_VIEW.to_string(),
                        title: "View Task".to_string(),
                    },
                ],
            },
            NotificationCategory {
                identifier: TASK_REMINDER_CATEGORY.to_string(),
                actions: vec![
                    NotificationCategoryAction::Action {
                        identifier: MACOS_COMPLETE.to_string(),
                        title: "Complete".to_string(),
                    },
                    NotificationCategoryAction::Action {
                        identifier: MACOS_SNOOZE_15MIN.to_string(),
                        title: "Snooze 15min".to_string(),
                    },
                    NotificationCategoryAction::Action {
                        identifier: MACOS_VIEW.to_string(),
                        title: "View Task".to_string(),
                    },
                ],
            },
        ];

        self.manager
            .register(
                Box::new(move |response| {
                    let app = app.clone();
                    tauri::async_runtime::spawn(async move {
                        handle_response(&app, response).await;
                    });
                }),
                categories,
            )
            .unwrap_or_else(|err| {
                log::warn!("[Notifications] Failed to register notification categories: {err:?}");
            });
    }
}

async fn handle_response(app: &AppHandle<impl tauri::Runtime>, response: NotificationResponse) {
    log::debug!("[Notifications] Received response: {response:?}");

    let task_id = match response.user_info.get(USER_INFO_TASK_ID) {
        Some(id) => id.clone(),
        None => {
            log::warn!("[Notifications] No task ID in notification response");
            return;
        }
    };

    let notification_type = response
        .user_info
        .get(USER_INFO_NOTIFICATION_TYPE)
        .cloned()
        .unwrap_or_else(|| "\"overdue\"".to_string());

    match response.action {
        NotificationResponseAction::Default => {
            show_main_window(app);
            emit_action(app, VIEW, task_id, notification_type);
        }
        NotificationResponseAction::Dismiss => {
            log::debug!("[Notifications] Notification dismissed");
        }
        NotificationResponseAction::Other(action_id) => {
            let Some(action_name) = macos_action_name(&action_id) else {
                log::warn!("[Notifications] Unknown action: {action_id}");
                return;
            };

            emit_action(app, action_name, task_id, notification_type);

            if action_name == VIEW {
                show_main_window(app);
            }
        }
    }
}
