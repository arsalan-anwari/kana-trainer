import { describe, expect, it } from "vitest";
import { fileLabel } from "../src/lib/storage";

describe("fileLabel", () => {
  it("leaves a desktop path alone", () => {
    expect(fileLabel("/home/me/kana-runs-2026-08-21-3.kt-report")).toBe(
      "/home/me/kana-runs-2026-08-21-3.kt-report"
    );
    expect(fileLabel("C:\\Users\\me\\runs.kt-report")).toBe("C:\\Users\\me\\runs.kt-report");
  });

  it("shortens the content URI android hands back to the file name", () => {
    expect(
      fileLabel(
        "content://com.android.providers.downloads.documents/document/msf%3A1000%2Fruns.kt-report"
      )
    ).toBe("runs.kt-report");
    expect(
      fileLabel("content://com.android.externalstorage.documents/document/primary%3ADownload%2Fruns.kt-report")
    ).toBe("runs.kt-report");
  });

  it("keeps the URI when there is no tail to show", () => {
    expect(fileLabel("content://provider/document/")).toBe("content://provider/document/");
    expect(fileLabel("content://provider/%E0%A4%A")).toBe("content://provider/%E0%A4%A");
  });
});
