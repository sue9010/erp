// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VendorPage from "./pages/VendorPage";
import ProductPage from "./pages/ProductPage";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <h1>📦 ERP 시스템</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>홈</Link>
          <Link to="/vendors">업체 관리</Link>
          <Link to="/products" style={{ marginLeft: "1rem" }}>제품 관리</Link>
        </nav>

        <Routes>
          <Route path="/" element={<div>🏠 대시보드 또는 홈 화면 (나중에 만들기)</div>} />
          <Route path="/vendors" element={<VendorPage />} />
          <Route path="/products" element={<ProductPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
