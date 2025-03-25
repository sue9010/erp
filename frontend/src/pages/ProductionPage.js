import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";

function ProductionPage() {
  const [form, setForm] = useState({
    product_name: "",
    scheduled_date: "",
    serial_numbers: [""],
  });

  const [productions, setProductions] = useState([]);

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    const res = await axios.get(`${API_BASE}/productions`);
    setProductions(res.data);
  };

  const handleChange = (index, value) => {
    const updated = [...form.serial_numbers];
    updated[index] = value;
    setForm({ ...form, serial_numbers: updated });
  };

  const addSerial = () => {
    setForm({ ...form, serial_numbers: [...form.serial_numbers, ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/productions`, form);
      alert("생산 등록 완료!");
      setForm({
        product_name: "",
        scheduled_date: "",
        serial_numbers: [""],
      });
      fetchProductions();
    } catch (err) {
      alert("등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🏭 생산 등록</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제품명"
          value={form.product_name}
          onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.scheduled_date}
          onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
          required
        />

        <h3>📋 시리얼 번호 목록</h3>
        {form.serial_numbers.map((sn, i) => (
          <input
            key={i}
            type="text"
            value={sn}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={`시리얼 번호 ${i + 1}`}
            required
          />
        ))}
        <button type="button" onClick={addSerial}>+ 시리얼 추가</button>
        <br /><br />
        <button type="submit">생산 등록</button>
      </form>

      <hr />
      <h2>📦 생산 내역</h2>
      <ul>
        {productions.map((p) => (
          <li key={p.id} style={{ marginBottom: "1rem" }}>
            <strong>{p.product_name}</strong> / 출고 예정일: {p.scheduled_date}
            <ul>
              {p.serial_numbers.map((sn, idx) => (
                <li key={idx}>🔢 {sn}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductionPage;
