pub mod commands;
mod icon;
mod menu;
mod state;

pub use state::TrayState;

type AppRuntime = tauri::Wry;
