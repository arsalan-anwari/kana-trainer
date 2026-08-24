//! Workaround for "Gdk-Message: Error 71" on Wayland + Nvidia
//! (tauri-apps/tauri#10702): WebKitGTK creates the window's EGL surface mid
//! frame, so GTK3 finishes that frame by attaching an SHM buffer to a surface
//! egl-wayland has already armed with explicit sync, and the compositor kills
//! us. Forcing the paint GL context first makes every frame a GL frame.

use gtk::prelude::*;

/// Runs before the first frame either way: Tauri's setup hook is already past
/// realize, and the main loop has not started.
pub fn force_paint_gl_context(window: &gtk::ApplicationWindow) {
    if !affected() {
        eprintln!("kana-trainer: not on Nvidia/Wayland, the workaround is inactive");
        return;
    }
    if window.is_realized() {
        create_gl_context(window);
    } else {
        // "realize" is G_SIGNAL_RUN_FIRST, so the GdkWindow exists here
        window.connect_realize(create_gl_context);
    }
}

fn create_gl_context(window: &gtk::ApplicationWindow) {
    let Some(gdk_window) = window.window() else {
        return;
    };
    // only the paint context this forces GDK to create is wanted
    if let Err(error) = gdk_window.create_gl_context() {
        eprintln!("kana-trainer: no GL context for the window, the Wayland/Nvidia workaround is inactive: {error}");
    }
}

/// `WEBKIT_DISABLE_DMABUF_RENDERER=1` already takes WebKit off the GL path.
fn affected() -> bool {
    std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").as_deref() != Ok("1") && nvidia_on_wayland()
}

fn nvidia_on_wayland() -> bool {
    // WAYLAND_DISPLAY is missing without the session environment (systemd unit,
    // sudo), so fall back to what logind recorded
    let on_wayland = (std::env::var_os("WAYLAND_DISPLAY").is_some()
        || std::env::var_os("WAYLAND_SOCKET").is_some()
        || std::env::var("XDG_SESSION_TYPE").as_deref() == Ok("wayland"))
        && prefers_wayland(std::env::var("GDK_BACKEND").ok().as_deref());

    // proprietary and open kernel modules both load nvidia_drm, nouveau does not
    on_wayland && std::path::Path::new("/sys/module/nvidia_drm").exists()
}

// an explicit GDK_BACKEND outranks the session type
fn prefers_wayland(backend: Option<&str>) -> bool {
    backend
        .and_then(|list| list.split(',').next())
        .map(str::trim)
        .map_or(true, |item| {
            item == "wayland" || item == "*" || item.is_empty()
        })
}

#[cfg(test)]
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

#[cfg(test)]
mod probe {
    // cargo test -- --ignored --nocapture probe
    #[test]
    #[ignore = "machine-specific probe, not a pass/fail assertion"]
    fn nvidia_on_wayland_here() {
        println!("nvidia_on_wayland() = {}", super::nvidia_on_wayland());
    }
}
