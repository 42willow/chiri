mod actions;
pub mod commands;
pub mod permission;
mod setup;
mod state;
mod types;

#[cfg(target_os = "linux")]
mod linux;

#[cfg(target_os = "macos")]
mod macos;

#[cfg(target_os = "windows")]
mod windows;

pub use setup::initialize;
pub use state::NotificationManagerState;
