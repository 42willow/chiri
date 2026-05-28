use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tauri::{AppHandle, State};
use tokio::sync::oneshot;
use zbus::Connection;

use super::connector::UnifiedPushConnector;

const CONNECTOR_PATH: &str = "/org/unifiedpush/Connector";

pub(super) type PendingEndpoints = Arc<Mutex<HashMap<String, oneshot::Sender<String>>>>;

pub(super) struct UnifiedPushRuntime {
    pub(super) connection: Connection,
    pub(super) service_name: String,
}

pub struct UnifiedPushState {
    runtime: tokio::sync::Mutex<Option<UnifiedPushRuntime>>,
    pending_endpoints: PendingEndpoints,
}

impl Default for UnifiedPushState {
    fn default() -> Self {
        Self {
            runtime: tokio::sync::Mutex::new(None),
            pending_endpoints: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl UnifiedPushState {
    pub(super) fn insert_pending_endpoint(
        &self,
        token: String,
        sender: oneshot::Sender<String>,
    ) -> Result<(), String> {
        let mut pending = self
            .pending_endpoints
            .lock()
            .map_err(|_| "UnifiedPush endpoint state lock poisoned".to_string())?;
        pending.insert(token, sender);
        Ok(())
    }

    pub(super) fn remove_pending_endpoint(&self, token: &str) {
        if let Ok(mut pending) = self.pending_endpoints.lock() {
            pending.remove(token);
        }
    }
}

pub(super) async fn ensure_runtime(
    app: &AppHandle,
    state: &State<'_, UnifiedPushState>,
) -> Result<UnifiedPushRuntime, String> {
    let mut runtime = state.runtime.lock().await;
    if let Some(runtime) = runtime.as_ref() {
        return Ok(UnifiedPushRuntime {
            connection: runtime.connection.clone(),
            service_name: runtime.service_name.clone(),
        });
    }

    let connection = Connection::session().await.map_err(|e| e.to_string())?;
    let service_name = app.config().identifier.clone();
    let connector = UnifiedPushConnector::new(app.clone(), state.pending_endpoints.clone());

    connection
        .object_server()
        .at(CONNECTOR_PATH, connector)
        .await
        .map_err(|e| e.to_string())?;
    connection
        .request_name(service_name.as_str())
        .await
        .map_err(|e| e.to_string())?;

    let created = UnifiedPushRuntime {
        connection: connection.clone(),
        service_name,
    };

    *runtime = Some(UnifiedPushRuntime {
        connection,
        service_name: created.service_name.clone(),
    });

    Ok(created)
}
