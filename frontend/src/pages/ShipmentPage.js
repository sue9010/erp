import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";

function ShipmentPage() {
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    order_id: "",
    tracking_number: "",
    shipped_date: ""
  });
  const [file, setFile] = useState(null);

  const fetchShipments = async () => {
    const res = await axios.get(`${API_BASE}/shipments`);
    setShipments(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get(`${API_BASE}/orders`);
    setOrders(res.data);
  };

  useEffect(() => {
    fetchShipments();
    fetchOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.order_id || !form.tracking_number || !form.shipped_date) {
      alert("모든 항목을 입력해주세요!");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/shipments`, form);

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`${API_BASE}/shipments/${res.data.shipment.id}/upload`, formData);
      }

      alert("배송 등록 완료!");
      setForm({ order_id: "", tracking_number: "", shipped_date: "" });
      setFile(null);
      fetchShipments();
    } catch (err) {
      console.error(err);
      alert("배송 등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🚚 배송 등록</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={form.order_id}
          onChange={(e) => setForm({ ...form, order_id: e.target.value })}
          required
        >
          <option value="">-- 주문 선택 --</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              주문 #{o.id} - {o.customer}
            </option>
          ))}
        </select>
        <input
          placeholder="운송장 번호"
          value={form.tracking_number}
          onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.shipped_date}
          onChange={(e) => setForm({ ...form, shipped_date: e.target.value })}
          required
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">배송 등록</button>
      </form>

      <h2 style={{ marginTop: "2rem" }}>📦 배송 내역</h2>
      <ul>
        {shipments.map((s) => (
          <li key={s.id}>
            주문 #{s.order_id} / {s.tracking_number} / {s.shipped_date}
            {s.file_path && (
              <a
                href={`${API_BASE}/${s.file_path}`}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: "10px", color: "blue" }}
              >
                [첨부파일]
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShipmentPage;
    