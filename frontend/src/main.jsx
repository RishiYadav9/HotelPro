import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";
createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><App /><ToastContainer position="bottom-right" /></BrowserRouter></React.StrictMode>);
