import { createRoot } from "react-dom/client";
import App from "../modules/App";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("No se encontró el contenedor raíz");
}
