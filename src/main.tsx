import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ⛔ Evita que errores de doble registro detengan el render
window.addEventListener(
  "error",
  (e) => {
    const msg = String(e?.message || "");
    if (
      msg.includes("mce-autosize-textarea") &&
      msg.includes("already been defined")
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  },
  true
);

createRoot(document.getElementById("root")!).render(<App />);
