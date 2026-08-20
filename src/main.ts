import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const target = document.getElementById("app");
if (target === null) throw new Error("mount target is missing");

function dismissSplash(): void {
  const splash = document.getElementById("splash");
  if (splash === null) return;
  // one frame to let the mounted markup lay out, a second to let it paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      splash.dataset.done = "";
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
      setTimeout(() => splash.remove(), 600);
    });
  });
}

const app = mount(App, { target });
dismissSplash();

export default app;
