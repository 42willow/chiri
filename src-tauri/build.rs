#[cfg(target_os = "macos")]
#[path = "build/liquid_glass_icon.rs"]
mod liquid_glass_icon;

#[cfg(target_os = "macos")]
#[path = "build/objc_bridge.rs"]
mod objc_bridge;

fn main() {
    // compile macOS liquid glass icon first: tauri_build::build() checks for
    // gen/Assets.car as a resource and will panic if it doesn't exist yet.
    #[cfg(target_os = "macos")]
    {
        liquid_glass_icon::compile();
        objc_bridge::compile();
    }

    tauri_build::build();
}
