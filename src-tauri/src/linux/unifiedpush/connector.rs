use serde::Serialize;
use tauri::{AppHandle, Emitter};
use zbus::interface;

use super::{
    state::PendingEndpoints,
    values::{get_bytes, get_string, owned_value, VariantDict},
};

const MESSAGE_EVENT: &str = "unifiedpush://message";

#[derive(Debug, Clone, Serialize)]
struct LinuxUnifiedPushMessageEvent {
    token: String,
    message: String,
}

#[derive(Clone)]
pub(super) struct UnifiedPushConnector {
    app: AppHandle,
    pending_endpoints: PendingEndpoints,
}

impl UnifiedPushConnector {
    pub(super) fn new(app: AppHandle, pending_endpoints: PendingEndpoints) -> Self {
        Self {
            app,
            pending_endpoints,
        }
    }
}

#[interface(name = "org.unifiedpush.Connector2")]
impl UnifiedPushConnector {
    #[zbus(name = "Message")]
    async fn message(&self, args: VariantDict) -> zbus::fdo::Result<VariantDict> {
        let Some(token) = get_string(&args, "token") else {
            return Ok(VariantDict::new());
        };

        let message_len = get_bytes(&args, "message")
            .map(|bytes| bytes.len())
            .unwrap_or(0);
        let message = format!("Linux UnifiedPush message ({message_len} bytes)");

        let _ = self.app.emit(
            MESSAGE_EVENT,
            LinuxUnifiedPushMessageEvent { token, message },
        );

        let mut response = VariantDict::new();
        if let Some(id) = get_string(&args, "id") {
            response.insert("id".into(), owned_value(id)?);
        }

        Ok(response)
    }

    #[zbus(name = "NewEndpoint")]
    async fn new_endpoint(&self, args: VariantDict) -> zbus::fdo::Result<VariantDict> {
        let Some(token) = get_string(&args, "token") else {
            return Ok(VariantDict::new());
        };
        let Some(endpoint) = get_string(&args, "endpoint") else {
            return Ok(VariantDict::new());
        };

        if let Ok(mut pending) = self.pending_endpoints.lock() {
            if let Some(sender) = pending.remove(&token) {
                let _ = sender.send(endpoint);
            }
        }

        Ok(VariantDict::new())
    }

    #[zbus(name = "Unregistered")]
    async fn unregistered(&self, args: VariantDict) -> zbus::fdo::Result<VariantDict> {
        if let Some(token) = get_string(&args, "token") {
            if let Ok(mut pending) = self.pending_endpoints.lock() {
                pending.remove(&token);
            }
        }

        Ok(VariantDict::new())
    }
}
