// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VendorPage from "./pages/VendorPage";
import ProductPage from "./pages/ProductPage";
import QuotationPage from "./pages/QuotationPage";
import OrderPage from "./pages/OrderPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import PurchasePage from "./pages/PurchasePage";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <h1>📦 ERP 시스템</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>홈</Link>
          <Link to="/vendors">업체 관리</Link>
          <Link to="/products" style={{ marginLeft: "1rem" }}>제품 관리</Link>
          <Link to="/quotations" style={{ marginLeft: "1rem" }}>견적 관리</Link>
          <Link to="/orders" style={{ marginLeft: "1rem" }}>주문 관리</Link>
          <Link to="/stock-history" style={{ marginLeft: "1rem" }}>재고 이력</Link>
          <Link to="/purchases" style={{ marginLeft: "1rem" }}>입고 관리</Link>
        </nav>

        <Routes>
          <Route path="/" element={<div>🏠 대시보드 또는 홈 화면 (나중에 만들기)</div>} />
          <Route path="/vendors" element={<VendorPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/quotations" element={<QuotationPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/stock-history" element={<StockHistoryPage />} />
          <Route path="/purchases" element={<PurchasePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
