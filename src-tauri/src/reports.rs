use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::str::FromStr;

use serde_json::Value;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_fs::{FilePath, FsExt, OpenOptions};

fn reports_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("reports");
    fs::create_dir_all(&base).map_err(|error| error.to_string())?;
    Ok(base)
}

fn check_id(id: &str) -> Result<String, String> {
    if id.is_empty() || !id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
        return Err("report id is not valid".to_string());
    }
    Ok(id.to_string())
}

fn report_id(value: &Value) -> Result<String, String> {
    let id = value
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "report is missing an id".to_string())?;
    check_id(id)
}

fn read_report(path: &PathBuf) -> Result<Value, String> {
    let text = fs::read_to_string(path).map_err(|error| error.to_string())?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_reports(app: AppHandle) -> Result<Vec<Value>, String> {
    let dir = reports_dir(&app)?;
    let mut reports = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|error| error.to_string())? {
        let path = entry.map_err(|error| error.to_string())?.path();
        if path.extension().and_then(|value| value.to_str()) != Some("json") {
            continue;
        }
        if let Ok(value) = read_report(&path) {
            reports.push(value);
        }
    }
    reports.sort_by(|left, right| {
        let key = |value: &Value| {
            value
                .get("createdAt")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string()
        };
        key(right).cmp(&key(left))
    });
    Ok(reports)
}

#[tauri::command]
pub fn save_report(app: AppHandle, report: Value) -> Result<String, String> {
    let id = report_id(&report)?;
    let path = reports_dir(&app)?.join(format!("{id}.json"));
    let text = serde_json::to_string_pretty(&report).map_err(|error| error.to_string())?;
    fs::write(&path, text).map_err(|error| error.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn delete_report(app: AppHandle, id: String) -> Result<(), String> {
    let checked = check_id(&id)?;
    let path = reports_dir(&app)?.join(format!("{checked}.json"));
    if path.exists() {
        fs::remove_file(&path).map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn picked_file(path: String) -> FilePath {
    // FromStr cannot fail: anything that is not a URL is taken as a path
    FilePath::from_str(&path).unwrap_or_else(|_| FilePath::Path(PathBuf::from(path)))
}

#[tauri::command]
pub fn write_report_file<R: Runtime>(
    app: AppHandle<R>,
    path: String,
    data: Vec<u8>,
) -> Result<(), String> {
    let mut options = OpenOptions::new();
    options.write(true).create(true).truncate(true);
    let mut file = app
        .fs()
        .open(picked_file(path), options)
        .map_err(|error| error.to_string())?;
    file.write_all(&data).map_err(|error| error.to_string())?;
    file.flush().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn read_report_file<R: Runtime>(app: AppHandle<R>, path: String) -> Result<Vec<u8>, String> {
    let mut options = OpenOptions::new();
    options.read(true);
    let mut file = app
        .fs()
        .open(picked_file(path), options)
        .map_err(|error| error.to_string())?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|error| error.to_string())?;
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::Path;

    use super::{picked_file, read_report_file, write_report_file};
    use tauri_plugin_fs::FilePath;

    // the dialog hands back whatever shape the platform uses, and only android
    // sends a URI: a windows drive letter must not be read as a URL scheme
    #[test]
    fn desktop_paths_stay_paths() {
        for path in [
            "/home/me/kana-runs-2026-08-21-3.kt-report",
            "/Users/me/Documents/runs.kt-report",
            "C:\\Users\\me\\runs.kt-report",
            "C:/Users/me/runs.kt-report",
        ] {
            assert!(
                matches!(picked_file(path.to_string()), FilePath::Path(value) if value == Path::new(path)),
                "{path} should be taken as a plain path"
            );
        }
    }

    // the desktop half of the same story: a picked path must come back with the
    // bytes that were written to it, through the same commands the app calls
    #[test]
    fn a_written_file_reads_back_byte_for_byte() {
        let app = tauri::test::mock_builder()
            .plugin(tauri_plugin_fs::init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .expect("the mock app should build");

        let target = std::env::temp_dir().join("kana-trainer-roundtrip.kt-report");
        let _ = fs::remove_file(&target);
        let path = target.to_string_lossy().to_string();
        let bytes = b"KTREPORT\x01\x00\x00\x00 not really a report".to_vec();

        write_report_file(app.handle().clone(), path.clone(), bytes.clone())
            .expect("the write should land");
        assert_eq!(
            fs::metadata(&target).expect("the file should exist").len(),
            bytes.len() as u64,
            "the file should hold the bytes, not be left empty"
        );
        assert_eq!(
            read_report_file(app.handle().clone(), path.clone()).expect("the read should work"),
            bytes
        );

        // a second export over the same name must not leave a tail behind
        let shorter = b"KTREPORT".to_vec();
        write_report_file(app.handle().clone(), path.clone(), shorter.clone())
            .expect("the overwrite should land");
        assert_eq!(
            read_report_file(app.handle().clone(), path).expect("the read should work"),
            shorter
        );

        let _ = fs::remove_file(&target);
    }

    #[test]
    fn android_content_uris_stay_uris() {
        let uri = "content://com.android.externalstorage.documents/document/primary%3ADownload%2Fruns.kt-report";
        assert!(
            matches!(picked_file(uri.to_string()), FilePath::Url(value) if value.as_str() == uri),
            "a content URI should be handed to the fs plugin as a URL"
        );
    }
}
