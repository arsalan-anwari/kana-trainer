mod reports;

use tauri::{window::Color, Manager, Theme};

const LIGHT_BACKGROUND: Color = Color(0xf7, 0xf2, 0xe7, 0xff);
const DARK_BACKGROUND: Color = Color(0x16, 0x15, 0x0f, 0xff);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // gives the window its GL context before the first frame
        .plugin(tauri_plugin_wayland_nvidia_quirk::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let dark = matches!(window.theme(), Ok(Theme::Dark));
                let background = if dark {
                    DARK_BACKGROUND
                } else {
                    LIGHT_BACKGROUND
                };
                // an unsupported platform keeps the config colour
                let _ = window.set_background_color(Some(background));
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            reports::list_reports,
            reports::save_report,
            reports::delete_report,
            reports::write_report_file,
            reports::read_report_file
        ])
        .run(tauri::generate_context!())
        .expect("failed to start kana trainer");
}
