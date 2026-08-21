use std::fs;
use std::path::PathBuf;

use serde_json::Value;
use tauri::{AppHandle, Manager};

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

#[tauri::command]
pub fn write_report_file(path: String, data: Vec<u8>) -> Result<(), String> {
    fs::write(PathBuf::from(path), data).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn read_report_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(PathBuf::from(path)).map_err(|error| error.to_string())
}
