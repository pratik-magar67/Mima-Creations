import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

const AdminDashboard = lazy(() => import("./AdminDashboard.jsx"));

const isAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={null}>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </Suspense>
  </StrictMode>
);