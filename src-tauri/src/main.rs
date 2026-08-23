#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // WebKitGTK's DMA-BUF renderer trips a Wayland protocol error on some
    // driver stacks (Nvidia proprietary: "Gdk-Message: Error 71"), so opt out
    // unless the user asked for it. Set WEBKIT_DISABLE_DMABUF_RENDERER=0 to
    // keep the GPU path.
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    kana_trainer_lib::run();
}
