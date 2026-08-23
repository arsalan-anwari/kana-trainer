#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// WebKitGTK's DMA-BUF renderer trips a Wayland protocol error ("Gdk-Message:
// Error 71") on Nvidia's driver, see tauri-apps/tauri#10702. Mesa (Intel, AMD)
// handles it fine, so only opt out when we are actually on Wayland with the
// Nvidia kernel driver loaded.

// an explicit GDK_BACKEND detected
#[cfg(target_os = "linux")]
fn prefers_wayland(backend: Option<&str>) -> bool {
    match backend {
        Some(list) => matches!(
            list.split(',').next().map(str::trim),
            Some("wayland") | Some("*") | Some("")
        ),
        None => true,
    }
}

#[cfg(target_os = "linux")]
fn nvidia_on_wayland() -> bool {
    // WAYLAND_DISPLAY is missing when the process did not inherit the session
    // environment (systemd unit, sudo, .desktop with a scrubbed env), so fall
    // back to what logind recorded for the session.
    let on_wayland = (std::env::var_os("WAYLAND_DISPLAY").is_some()
        || std::env::var_os("WAYLAND_SOCKET").is_some()
        || std::env::var("XDG_SESSION_TYPE").as_deref() == Ok("wayland"))
        && prefers_wayland(std::env::var("GDK_BACKEND").ok().as_deref());

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
        eprintln!("kana-trainer: Nvidia on Wayland, disabling WebKit DMA-BUF renderer");
    }

    kana_trainer_lib::run();
}

#[cfg(all(test, target_os = "linux"))]
mod tests {
    use super::prefers_wayland;

    #[test]
    fn gdk_backend_ordering() {
        assert!(prefers_wayland(None));
        assert!(prefers_wayland(Some("wayland")));
        assert!(prefers_wayland(Some("wayland,x11")));
        assert!(prefers_wayland(Some(" wayland , x11")));
        assert!(prefers_wayland(Some("*")));
        assert!(!prefers_wayland(Some("x11")));
        assert!(!prefers_wayland(Some("x11,wayland")));
    }
}

#[cfg(all(test, target_os = "linux"))]
mod probe {
    // cargo test --bin kana-trainer -- --ignored --nocapture probe
    #[test]
    #[ignore = "machine-specific probe, not a pass/fail assertion"]
    fn nvidia_on_wayland_here() {
        println!("nvidia_on_wayland() = {}", super::nvidia_on_wayland());
    }
}
