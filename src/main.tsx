import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set default theme to dark
const storedTheme = localStorage.getItem('theme');
if (!storedTheme) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.add(storedTheme);
}

createRoot(document.getElementById("root")!).render(<App />);
