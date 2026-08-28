import { decodeReportFile, encodeReportFile, FILE_EXTENSION } from "./core/ktreport";
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

function suggestedName(count: number): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `kana-runs-${stamp}-${count}.${FILE_EXTENSION}`;
}

const fileFilters = [{ name: "Kana Trainer runs", extensions: [FILE_EXTENSION] }];

export function fileLabel(path: string): string {
  if (!path.startsWith("content://")) return path;
  try {
    const tail = decodeURIComponent(path).split(/[/:]/).pop();
    return tail === undefined || tail === "" ? path : tail;
  } catch {
    return path;
  }
}

export async function exportReports(reports: Report[]): Promise<string | null> {
  const bytes = encodeReportFile(reports);
  if (inTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({
      defaultPath: suggestedName(reports.length),
      filters: fileFilters
    });
    if (path === null) return null;
    await call<null>("write_report_file", { path, data: [...bytes] });
    return path;
  }
  const name = suggestedName(reports.length);
  const blob = new Blob([bytes as BlobPart], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
  return name;
}

function pickFileInBrowser(): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `.${FILE_EXTENSION}`;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      resolve(new Uint8Array(await file.arrayBuffer()));
    };
    input.click();
  });
}

export type ImportResult = {
  // runs written
  added: number;
  // runs already held under the same id
  skipped: number;
};

// Reads a .kt-report file and merges its runs into the ones already held.
export async function importReports(): Promise<ImportResult | null> {
  let bytes: Uint8Array | null;
  if (inTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const path = await open({ multiple: false, filters: fileFilters });
    if (path === null || Array.isArray(path)) return null;
    const data = await call<number[]>("read_report_file", { path });
    bytes = Uint8Array.from(data);
  } else {
    bytes = await pickFileInBrowser();
  }
  if (bytes === null) return null;

  const incoming = decodeReportFile(bytes);
  const held = new Set((await listReports()).map((report) => report.id));
  let added = 0;
  let skipped = 0;
  for (const report of incoming) {
    if (held.has(report.id)) {
      skipped += 1;
      continue;
    }
    await saveReport(report);
    held.add(report.id);
    added += 1;
  }
  return { added, skipped };
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
