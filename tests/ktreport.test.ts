import { describe, expect, it } from "vitest";
import {
  decodeReportFile,
  encodeReportFile,
  FILE_VERSION,
  ReportFileError
} from "../src/lib/core/ktreport";
import type { Report } from "../src/lib/core/report";
import { defaultSettings } from "../src/lib/core/settings";

function report(id: string, createdAt: string): Report {
  return {
    id,
    createdAt,
    durationMs: 42_000,
    settings: { ...defaultSettings },
    answers: [
      { kanaId: "a", script: "hiragana", correct: true, timedOut: false, elapsedMs: 900, given: "a" },
      { kanaId: "ki", script: "katakana", correct: false, timedOut: true, elapsedMs: 5000, given: "" }
    ]
  };
}

const runs = [
  report("aaa-1", "2026-08-20T10:00:00.000Z"),
  report("bbb-2", "2026-08-21T10:00:00.000Z")
];

describe("kt-report files", () => {
  it("round trips a batch of runs", () => {
    expect(decodeReportFile(encodeReportFile(runs))).toEqual(runs);
  });

  it("round trips an empty file", () => {
    expect(decodeReportFile(encodeReportFile([]))).toEqual([]);
  });

  it("survives characters outside ascii", () => {
    const run = report("ccc-3", "2026-08-21T11:00:00.000Z");
    run.answers[0]!.given = "きゃ";
    expect(decodeReportFile(encodeReportFile([run]))[0]!.answers[0]!.given).toBe("きゃ");
  });

  it("writes the magic, version and run count into the header", () => {
    const bytes = encodeReportFile(runs);
    const view = new DataView(bytes.buffer);
    expect(String.fromCharCode(...bytes.subarray(0, 8))).toBe("KTREPORT");
    expect(view.getUint8(8)).toBe(FILE_VERSION);
    expect(view.getUint32(12, true)).toBe(2);
  });

  it("rejects a file that is not one of ours", () => {
    const bytes = new TextEncoder().encode('{"id":"aaa-1","answers":[]}');
    expect(() => decodeReportFile(bytes)).toThrow(ReportFileError);
  });

  it("rejects a file shorter than a header", () => {
    expect(() => decodeReportFile(new Uint8Array(8))).toThrow(/too short/);
  });

  it("rejects a newer format version", () => {
    const bytes = encodeReportFile(runs);
    bytes[8] = FILE_VERSION + 1;
    expect(() => decodeReportFile(bytes)).toThrow(/newer version/);
  });

  it("rejects a file with a flipped byte", () => {
    const bytes = encodeReportFile(runs);
    bytes[bytes.length - 5] ^= 0xff;
    expect(() => decodeReportFile(bytes)).toThrow(/damaged/);
  });

  it("rejects a truncated file", () => {
    const bytes = encodeReportFile(runs);
    expect(() => decodeReportFile(bytes.subarray(0, bytes.length - 10))).toThrow(/incomplete/);
  });

  it("rejects a record that is not a run", () => {
    const bogus = [{ id: "aaa-1", nope: true }] as unknown as Report[];
    expect(() => decodeReportFile(encodeReportFile(bogus))).toThrow(/cannot be read/);
  });
});
