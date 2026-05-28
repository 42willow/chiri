/// Exits the process directly via the OS, bypassing Tauri's RunEvent::ExitRequested.
/// Must be used instead of tauri-plugin-process's exit(), which calls AppHandle::exit()
/// and re-triggers ExitRequested, causing an infinite prevent/exit loop.
#[tauri::command]
pub fn force_quit() {
    std::process::exit(0);
}
