import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Layout from "./Components/Layout";
import App from "./Pages/App";
import Discussion from "./Pages/Discussion";
import PlacementStats from "./Pages/PlacementStats";
import CompanyPage from "./Pages/CompanyPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PlacementStats />} />
          <Route path="discussion" element={<Discussion />} />
          <Route path="company/:id" element={<CompanyPage />} />
          <Route path="placement-stats" element={<PlacementStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);