import React, { useEffect, useState } from "react";
import axios from "axios";

function StockHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/stock_history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📚 재고 이력</h1>
      <ul>
        {history.map((h, idx) => (
          <li key={idx}>
            [{h.timestamp}] {h.product_name} / {h.quantity}개 / {h.type} / {h.source}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StockHistoryPage;
