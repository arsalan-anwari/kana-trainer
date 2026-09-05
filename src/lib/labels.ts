// Translated names for the kana table. Kept out of core/kana so that module
// stays plain data, importable from the promo and showcase scripts.

import type { Group, Row } from "./core/kana";
import { t } from "./i18n.svelte";

export function groupLabel(group: Group): string {
  return t(`common.group.${group}`);
}

// Rows are named after their leading letter. The lone ん row has no letter to
// hang a suffix on, so it keeps its bare label.
export function rowLabel(row: Row): string {
  return row.id === "n" ? row.label : t("common.rowLabel", { letter: row.label });
}
