import { keynavShortcuts } from "kaizen-ui";
import { t } from "./i18n.svelte";

export function shortcuts(): {
  title: string;
  items: { keys: string[]; label: string }[];
}[] {
  return [
    {
      title: t("common.shortcuts.appGroup"),
      items: keynavShortcuts({
        start: t("common.shortcuts.start"),
        stop: t("common.shortcuts.stop"),
        section: t("common.shortcuts.section"),
        next: t("common.shortcuts.next"),
        previous: t("common.shortcuts.previous"),
        edges: t("common.shortcuts.edges"),
        scroll: t("common.shortcuts.scroll"),
        select: t("common.shortcuts.select"),
        confirm: t("common.shortcuts.confirm"),
        page: t("common.shortcuts.page"),
        close: t("common.shortcuts.close")
      })
    },
    {
      title: t("common.shortcuts.runGroup"),
      items: [
        { keys: ["1", "to", "4"], label: t("common.shortcuts.answer") },
        { keys: ["Enter"], label: t("common.shortcuts.submit") },
        { keys: ["R"], label: t("common.shortcuts.replay") },
        { keys: ["Esc"], label: t("common.shortcuts.quit") }
      ]
    }
  ];
}
