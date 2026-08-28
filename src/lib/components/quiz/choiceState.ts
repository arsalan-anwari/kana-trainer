import type { Choice, Question } from "../../core/quiz";
import type { Phase } from "../../state.svelte";

export type ChoiceState = "idle" | "staged" | "correct" | "wrong" | "dimmed";

// How a single answer tile should render, plain while answering and marked once graded.
export function choiceState(
  question: Question,
  choice: Choice,
  phase: Phase,
  picked: Choice | null,
  staged: Choice | null
): ChoiceState {
  if (phase === "answering") {
    return staged !== null && staged.kanaId === choice.kanaId ? "staged" : "idle";
  }
  if (choice.kanaId === question.kanaId) return "correct";
  if (picked !== null && picked.kanaId === choice.kanaId) return "wrong";
  return "dimmed";
}
