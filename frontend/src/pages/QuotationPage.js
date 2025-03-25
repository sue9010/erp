// src/pages/QuotationPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function QuotationPage() {
  const [quotations, setQuotations] = useState([]);
  const [newQuotation, setNewQuotation] = useState({
    client: "",
    date: "",
    items: [{ product_name: "", quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = () => {
    axios.get("http://127.0.0.1:8000/quotations")
      .then(res => setQuotations(res.data))
      .catch(err => console.error("불러오기 실패:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/quotations", newQuotation)
      .then(() => {
        alert("견적 등록 완료!");
        setNewQuotation({
          client: "",
          date: "",
          items: [{ product_name: "", quantity: 1, unit_price: 0 }]
        });
        fetchQuotations();
      })
      .catch(err => console.error("등록 실패:", err));
  };

  const addItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [...newQuotation.items, { product_name: "", quantity: 1, unit_price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...newQuotation.items];
    items[index][field] = field === "quantity" || field === "unit_price" ? parseInt(value) : value;
    setNewQuotation({ ...newQuotation, items });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📝 견적 목록</h1>
      <ul>
        {quotations.map((q) => (
          <li key={q.id}>
            {q.client} ({q.date}) - 총액: {q.total?.toLocaleString()}원
            <ul>
              {q.items.map((item, i) => (
                <li key={i}>
                  {item.product_name} / {item.quantity}개 / {item.unit_price.toLocaleString()}원
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <hr />
      <h2>➕ 새 견적 등록</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="고객명"
          value={newQuotation.client}
          onChange={(e) => setNewQuotation({ ...newQuotation, client: e.target.value })}
          required
        />
        <input
          type="date"
          value={newQuotation.date}
          onChange={(e) => setNewQuotation({ ...newQuotation, date: e.target.value })}
          required
        />

        <h3>📦 견적 항목</h3>
        {newQuotation.items.map((item, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="제품명"
              value={item.product_name}
              onChange={(e) => updateItem(index, "product_name", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="수량"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="단가"
              value={item.unit_price}
              onChange={(e) => updateItem(index, "unit_price", e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addItem}>+ 항목 추가</button>
        <br /><br />
        <button type="submit">견적 등록</button>
      </form>
    </div>
  );
}

export default QuotationPage;
