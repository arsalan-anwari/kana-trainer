import type { Report } from "./core/report";

const REPORT_KEY = "kana-trainer-reports";

function inTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function call<T>(command: string, args: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

function localReports(): Report[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    return raw === null ? [] : (JSON.parse(raw) as Report[]);
  } catch {
    return [];
  }
}

function writeLocal(reports: Report[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
}

export async function listReports(): Promise<Report[]> {
  if (inTauri()) return call<Report[]>("list_reports", {});
  return localReports().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveReport(report: Report): Promise<void> {
  if (inTauri()) {
    await call<string>("save_report", { report });
    return;
  }
  const reports = localReports().filter((item) => item.id !== report.id);
  reports.push(report);
  writeLocal(reports);
}

export async function deleteReport(id: string): Promise<void> {
  if (inTauri()) {
    await call<null>("delete_report", { id });
    return;
  }
  writeLocal(localReports().filter((item) => item.id !== id));
}

export async function exportReport(report: Report): Promise<string | null> {
  if (inTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({
      defaultPath: `kana-report-${report.id}.json`,
      filters: [{ name: "Report", extensions: ["json"] }]
    });
    if (path === null) return null;
    await call<null>("export_report", { id: report.id, path });
    return path;
  }
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kana-report-${report.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return link.download;
}

function readFileFromBrowser(): Promise<Report | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(await file.text()) as Report);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}

export async function importReport(): Promise<Report | null> {
  if (inTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const path = await open({
      multiple: false,
      filters: [{ name: "Report", extensions: ["json"] }]
    });
    if (path === null || Array.isArray(path)) return null;
    return call<Report>("import_report", { path });
  }
  const report = await readFileFromBrowser();
  if (report === null) return null;
  await saveReport(report);
  return report;
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function storeJson(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
