import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";

function PurchaseOrderPage() {
  const [form, setForm] = useState({
    vendor: "",
    order_date: "",
    items: [{ product_name: "", quantity: 1 }]
  });
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/purchase-orders`).then(res => setPurchaseOrders(res.data));
    axios.get(`${API_BASE}/products`).then(res => setProducts(res.data));
    axios.get(`${API_BASE}/vendors`).then(res => setVendors(res.data));
  }, []);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_name: "", quantity: 1 }] });
  };

  const updateItem = (i, field, value) => {
    const updated = [...form.items];
    updated[i][field] = field === "quantity" ? parseInt(value) : value;
    setForm({ ...form, items: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/purchase-orders`, form);
      alert("발주 등록 완료!");
      setForm({ vendor: "", order_date: "", items: [{ product_name: "", quantity: 1 }] });
      const res = await axios.get(`${API_BASE}/purchase-orders`);
      setPurchaseOrders(res.data);
    } catch (err) {
      alert("등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📑 발주 등록</h1>
      <form onSubmit={handleSubmit}>
        <select value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} required>
          <option value="">-- 업체 선택 --</option>
          {vendors.map(v => (
            <option key={v.id} value={v.name}>{v.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.order_date}
          onChange={(e) => setForm({ ...form, order_date: e.target.value })}
          required
        />
        <h3>상품 목록</h3>
        {form.items.map((item, i) => (
          <div key={i}>
            <select value={item.product_name} onChange={(e) => updateItem(i, "product_name", e.target.value)} required>
              <option value="">-- 제품 선택 --</option>
              {products.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addItem}>+ 항목 추가</button>
        <br /><br />
        <button type="submit">발주 등록</button>
      </form>

      <h2>📦 발주 내역</h2>
      <ul>
        {purchaseOrders.map((po) => (
          <li key={po.id}>
            {po.vendor} / {po.order_date}
            <ul>
            {po.items.map((item, i) => (
              <li key={`${item.product_name}-${i}`}>
                {item.product_name} / {item.quantity}개
              </li>
            ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PurchaseOrderPage;
