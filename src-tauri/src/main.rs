#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod reports;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            reports::list_reports,
            reports::save_report,
            reports::delete_report,
            reports::export_report,
            reports::import_report
        ])
        .run(tauri::generate_context!())
        .expect("failed to start kana trainer");
}
