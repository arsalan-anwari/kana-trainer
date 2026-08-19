mod reports;

// Android and iOS enter through this function instead of `main`, so the app
// setup lives in the library and `main.rs` is only a thin desktop wrapper.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
