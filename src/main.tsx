// import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./main.css";

const div = document.getElementById("root") || document.body.appendChild(document.createElement("div"));
createRoot(div).render(<App />);

// // if no .tsx just as a .ts file
// createRoot(div).render(createElement(App, { initialCount: 3 }));
