
import type { Group, Row } from "./core/kana";
import { t } from "./i18n.svelte";

export function groupLabel(group: Group): string {
  return t(`common.group.${group}`);
}

export function rowLabel(row: Row): string {
  return row.id === "n" ? row.label : t("common.rowLabel", { letter: row.label });
}
