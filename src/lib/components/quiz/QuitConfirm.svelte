<script lang="ts">
  import { app } from "../../state.svelte";
  import { t } from "../../i18n.svelte";
  import { ConfirmDialog } from "kaizen-ui";

  const answered = $derived(app.answers.length);
  const left = $derived(Math.max(0, app.questions.length - answered));
</script>

<ConfirmDialog
  title={t("quiz.stop.title")}
  confirmLabel={t("quiz.stop.confirm")}
  cancelLabel={t("quiz.stop.cancel")}
  closeLabel={t("quiz.stop.cancel")}
  onconfirm={() => app.quit()}
  oncancel={() => app.cancelQuit()}
>
  <p>{t(answered === 0 ? "quiz.stop.nothing" : "quiz.stop.discard", { count: answered })}</p>
  {#if left > 0 && answered > 0}
    <p>{t("quiz.stop.left", { count: left })}</p>
  {/if}
</ConfirmDialog>
