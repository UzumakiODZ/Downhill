import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Layout from "./components/Layout";
import App from "./pages/App";
import PlacementStats from "./pages/PlacementStats";
import Discussion from "./pages/Discussion";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="discussion" element={<Discussion />} />
          <Route path="placement-stats" element={<PlacementStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);