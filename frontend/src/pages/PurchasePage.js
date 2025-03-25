import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config"; // 경로에 따라 조정

function PurchasePage() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [newPurchase, setNewPurchase] = useState({
    vendor: "",
    items: [{ product_name: "", quantity: 1 }]
  });

  useEffect(() => {
    axios.get(`${API_BASE}/products`).then(res => setProducts(res.data));
    fetchPurchases();
  }, []);

  const fetchPurchases = () => {
    axios.get(`${API_BASE}/purchases`).then(res => setPurchases(res.data));
  };

  const addItem = () => {
    setNewPurchase({
      ...newPurchase,
      items: [...newPurchase.items, { product_name: "", quantity: 1 }]
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...newPurchase.items];
    items[index][field] = field === "quantity" ? parseInt(value) : value;
    setNewPurchase({ ...newPurchase, items });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/purchases`, newPurchase)
      .then(() => {
        alert("입고 처리 완료!");
        setNewPurchase({ vendor: "", items: [{ product_name: "", quantity: 1 }] });
        fetchPurchases();
      })
      .catch((err) => {
        alert("입고 실패: " + (err.response?.data?.detail || err.message));
      });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📥 입고 목록</h1>
      <ul>
        {purchases.map((p) => (
          <li key={p.id}>
            {p.vendor}
            <ul>
              {p.items.map((item, i) => (
                <li key={i}>{item.product_name} / {item.quantity}개</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <hr />
      <h2>➕ 새 입고 처리</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="업체명"
          value={newPurchase.vendor}
          onChange={(e) => setNewPurchase({ ...newPurchase, vendor: e.target.value })}
          required
        />

        <h3>입고 항목</h3>
        {newPurchase.items.map((item, index) => (
          <div key={index}>
            <select
              value={item.product_name}
              onChange={(e) => updateItem(index, "product_name", e.target.value)}
              required
            >
              <option value="">-- 제품 선택 --</option>
              {products.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addItem}>+ 항목 추가</button>
        <br /><br />
        <button type="submit">입고 등록</button>
      </form>
    </div>
  );
}

export default PurchasePage;
