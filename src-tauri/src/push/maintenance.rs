use std::{
    sync::{
        mpsc::{self, RecvTimeoutError, Sender},
        Mutex,
    },
    thread::{self, JoinHandle},
    time::Duration,
};

use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

const MAINTENANCE_EVENT: &str = "webdav-push://maintenance";
const MIN_INTERVAL_SECONDS: u64 = 60;

#[derive(Default)]
pub struct PushMaintenanceState {
    worker: Mutex<Option<PushMaintenanceWorker>>,
}

struct PushMaintenanceWorker {
    stop: Sender<()>,
    handle: Option<JoinHandle<()>>,
}

impl Drop for PushMaintenanceWorker {
    fn drop(&mut self) {
        let _ = self.stop.send(());
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct PushMaintenanceEvent {
    interval_seconds: u64,
    reason: &'static str,
}

#[tauri::command]
pub fn start_webdav_push_maintenance(
    app: AppHandle,
    state: State<'_, PushMaintenanceState>,
    enabled: bool,
    interval_seconds: u64,
) -> Result<(), String> {
    if !enabled {
        return stop_worker(&state);
    }

    let interval_seconds = interval_seconds.max(MIN_INTERVAL_SECONDS);
    let mut worker = state
        .worker
        .lock()
        .map_err(|_| "Push maintenance state lock poisoned".to_string())?;

    if worker.is_some() {
        worker.take();
    }

    let (stop, stop_rx) = mpsc::channel();
    let handle = thread::Builder::new()
        .name("webdav-push-maintenance".into())
        .spawn(move || loop {
            match stop_rx.recv_timeout(Duration::from_secs(interval_seconds)) {
                Ok(()) | Err(RecvTimeoutError::Disconnected) => break,
                Err(RecvTimeoutError::Timeout) => {
                    let _ = app.emit(
                        MAINTENANCE_EVENT,
                        PushMaintenanceEvent {
                            interval_seconds,
                            reason: "periodic push maintenance",
                        },
                    );
                }
            }
        })
        .map_err(|error| error.to_string())?;

    *worker = Some(PushMaintenanceWorker {
        stop,
        handle: Some(handle),
    });

    Ok(())
}

#[tauri::command]
pub fn stop_webdav_push_maintenance(state: State<'_, PushMaintenanceState>) -> Result<(), String> {
    stop_worker(&state)
}

fn stop_worker(state: &PushMaintenanceState) -> Result<(), String> {
    let mut worker = state
        .worker
        .lock()
        .map_err(|_| "Push maintenance state lock poisoned".to_string())?;
    worker.take();
    Ok(())
}
