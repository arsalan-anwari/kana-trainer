#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// WebKitGTK's DMA-BUF renderer trips a Wayland protocol error ("Gdk-Message:
// Error 71") on Nvidia's driver, see tauri-apps/tauri#10702. Mesa (Intel, AMD)
// handles it fine, so only opt out when we are actually on Wayland with the
// Nvidia kernel driver loaded.
#[cfg(target_os = "linux")]
fn nvidia_on_wayland() -> bool {
    let on_wayland = std::env::var_os("WAYLAND_DISPLAY").is_some()
        // an explicit GDK_BACKEND wins, and it may list a preference order
        && std::env::var("GDK_BACKEND")
            .map_or(true, |backends| backends.split(',').next() == Some("wayland"));

    // both the proprietary and the open kernel modules load nvidia_drm and
    // share the bug, nouveau does not create this directory
    on_wayland && std::path::Path::new("/sys/module/nvidia_drm").exists()
}

fn main() {
    // WEBKIT_DISABLE_DMABUF_RENDERER=0 keeps the GPU path, =1 forces the
    // workaround on stacks we did not detect.
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() && nvidia_on_wayland() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    kana_trainer_lib::run();
}
