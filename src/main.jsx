import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./style.css";

/**
 * Creates the React root and renders the main application
 */
createRoot(document.getElementById("app")).render(<App />);
