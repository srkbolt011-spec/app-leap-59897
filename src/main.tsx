import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeMobileCapabilities } from "./lib/mobileCapabilities";

// Initialize mobile capabilities
initializeMobileCapabilities();

createRoot(document.getElementById("root")!).render(<App />);
