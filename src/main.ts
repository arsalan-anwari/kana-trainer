import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";
import { dismissSplash } from "kaizen-ui";

const target = document.getElementById("app");
if (target === null) throw new Error("mount target is missing");

const app = mount(App, { target });
dismissSplash();

export default app;
