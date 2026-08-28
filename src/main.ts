import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const target = document.getElementById("app");
if (target === null) throw new Error("mount target is missing");

function dismissSplash(): void {
  const splash = document.getElementById("splash");
  if (splash === null) return;
  // wait two frames so the mounted markup has laid out and painted
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
