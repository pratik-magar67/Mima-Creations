import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import NotFound from "./NotFound.jsx";

const path = window.location.pathname;
const isAdmin = path.startsWith("/admin");
const isKnownPath = path === "/" || path === "" || isAdmin;

function getRoot() {
  if (isAdmin) return <AdminDashboard />;
  if (!isKnownPath) return <NotFound />;
  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {getRoot()}
  </StrictMode>
);