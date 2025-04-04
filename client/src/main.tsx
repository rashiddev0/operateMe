import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n"; // Import i18n configuration before rendering

createRoot(document.getElementById("root")!).render(<App />);