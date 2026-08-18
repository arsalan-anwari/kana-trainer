import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const target = document.getElementById("app");
if (target === null) throw new Error("mount target is missing");

export default mount(App, { target });
