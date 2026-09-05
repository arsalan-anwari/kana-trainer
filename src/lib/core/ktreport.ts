import { t } from "../i18n.svelte";
import type { Report } from "./report";

// The .kt-report container format. Header is 24 bytes, integers little endian:
//
//   offset  size  field
//   0       8     magic, ASCII "KTREPORT"
//   8       1     format version
//   9       1     reserved, must be 0
//   10      2     flags, must be 0
//   12      4     number of runs
//   16      4     payload length in bytes
//   20      4     CRC32 of the payload
//   24      ..    payload
//
// The payload is that many records, each a u32 byte length followed by the run
// as UTF-8 JSON.

export const FILE_EXTENSION = "kt-report";
export const FILE_VERSION = 1;

const MAGIC = "KTREPORT";
const HEADER_BYTES = 24;

export class ReportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportFileError";
  }
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function isReport(value: unknown): value is Report {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id !== "" &&
    typeof record.createdAt === "string" &&
    Array.isArray(record.answers) &&
    typeof record.settings === "object" &&
    record.settings !== null
  );
}

export function encodeReportFile(reports: Report[]): Uint8Array {
  const encoder = new TextEncoder();
  const records = reports.map((report) => encoder.encode(JSON.stringify(report)));
  const payloadBytes = records.reduce((sum, record) => sum + 4 + record.length, 0);

  const buffer = new ArrayBuffer(HEADER_BYTES + payloadBytes);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < MAGIC.length; index += 1) {
    view.setUint8(index, MAGIC.charCodeAt(index));
  }
  view.setUint8(8, FILE_VERSION);
  view.setUint8(9, 0);
  view.setUint16(10, 0, true);
  view.setUint32(12, records.length, true);
  view.setUint32(16, payloadBytes, true);

  let offset = HEADER_BYTES;
  for (const record of records) {
    view.setUint32(offset, record.length, true);
    bytes.set(record, offset + 4);
    offset += 4 + record.length;
  }

  view.setUint32(20, crc32(bytes.subarray(HEADER_BYTES)), true);
  return bytes;
}

export function decodeReportFile(bytes: Uint8Array): Report[] {
  if (bytes.length < HEADER_BYTES) {
    throw new ReportFileError(t("common.file.tooShort"));
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let index = 0; index < MAGIC.length; index += 1) {
    if (view.getUint8(index) !== MAGIC.charCodeAt(index)) {
      throw new ReportFileError(t("common.file.notReport"));
    }
  }

  const version = view.getUint8(8);
  if (version !== FILE_VERSION) {
    throw new ReportFileError(
      t("common.file.newer", { version })
    );
  }

  const count = view.getUint32(12, true);
  const payloadBytes = view.getUint32(16, true);
  const checksum = view.getUint32(20, true);
  if (bytes.length !== HEADER_BYTES + payloadBytes) {
    throw new ReportFileError(t("common.file.incomplete"));
  }

  const payload = bytes.subarray(HEADER_BYTES);
  if (crc32(payload) !== checksum) {
    throw new ReportFileError(t("common.file.damaged"));
  }

  const decoder = new TextDecoder();
  const reports: Report[] = [];
  let offset = 0;
  for (let index = 0; index < count; index += 1) {
    if (offset + 4 > payload.length) {
      throw new ReportFileError(t("common.file.incomplete"));
    }
    const length = new DataView(
      payload.buffer,
      payload.byteOffset + offset,
      4
    ).getUint32(0, true);
    offset += 4;
    if (offset + length > payload.length) {
      throw new ReportFileError(t("common.file.incomplete"));
    }
    let value: unknown;
    try {
      value = JSON.parse(decoder.decode(payload.subarray(offset, offset + length)));
    } catch {
      throw new ReportFileError(t("common.file.badRun"));
    }
    if (!isReport(value)) {
      throw new ReportFileError(t("common.file.badRun"));
    }
    reports.push(value);
    offset += length;
  }

  return reports;
}
