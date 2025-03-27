// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VendorPage from "./pages/VendorPage";
import ProductPage from "./pages/ProductPage";
import QuotationPage from "./pages/QuotationPage";
import OrderPage from "./pages/OrderPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import PurchasePage from "./pages/PurchasePage";
import PaymentPage from './pages/PaymentPage';
import ProductionPage from "./pages/ProductionPage";
import ShipmentPage from "./pages/ShipmentPage";
import PurchaseOrderPage from "./pages/PurchaseOrderPage";
import RemittancePage from "./pages/RemittancePage";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <h1>📦 ERP 시스템</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>홈</Link>

          {/* main */}
          <Link to="/vendors">업체 관리</Link>
          <Link to="/products" style={{ marginLeft: "1rem" }}>제품 관리</Link>
          <Link to="/stock-history" style={{ marginLeft: "1rem" }}>재고 이력</Link>

          {/* 판매관리 */}
          <Link to="/quotations" style={{ marginLeft: "1rem" }}>견적 관리</Link>
          <Link to="/orders" style={{ marginLeft: "1rem" }}>주문 관리</Link>
          <Link to="/payments" style={{ marginLeft: "1rem" }}>입금 관리</Link>
          <Link to="/productions" style={{ marginLeft: "1rem" }}>생산 관리</Link>
          <Link to="/shipments" style={{ marginLeft: "1rem" }}>배송 관리</Link>

          {/* 구매관리 */}
          <Link to="/purchase-orders" style={{ marginLeft: "1rem" }}>발주 관리</Link>
          <Link to="/remittances" style={{ marginLeft: "1rem" }}>송금 관리</Link>
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
          <Route path="/payments" element={<PaymentPage />} />
          <Route path="/productions" element={<ProductionPage />} />
          <Route path="/shipments" element={<ShipmentPage />} />
          <Route path="/purchase-orders" element={<PurchaseOrderPage />} />
          <Route path="/remittances" element={<RemittancePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
