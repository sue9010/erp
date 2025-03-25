import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";

function RemittancePage() {
  const [remittances, setRemittances] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [form, setForm] = useState({
    purchase_order_id: "",
    amount: "",
    date: "",
    memo: ""
  });
  const [file, setFile] = useState(null);

  const fetchAll = async () => {
    const res1 = await axios.get(`${API_BASE}/remittances`);
    setRemittances(res1.data);

    const res2 = await axios.get(`${API_BASE}/purchase-orders`);
    setPurchaseOrders(res2.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.purchase_order_id || !form.amount || !form.date) {
      alert("모든 필수 항목을 입력해주세요!");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/remittances`, {
        ...form,
        purchase_order_id: parseInt(form.purchase_order_id),
        amount: parseInt(form.amount)
      });

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`${API_BASE}/remittances/${res.data.remittance.id}/upload`, formData);
      }

      alert("송금 등록 완료!");
      setForm({ purchase_order_id: "", amount: "", date: "", memo: "" });
      setFile(null);
      fetchAll();
    } catch (err) {
      alert("송금 등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>💸 송금 등록</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={form.purchase_order_id}
          onChange={(e) => setForm({ ...form, purchase_order_id: e.target.value })}
          required
        >
          <option value="">-- 발주 선택 --</option>
          {purchaseOrders.map(po => (
            <option key={po.id} value={po.id}>
              #{po.id} - {po.vendor}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="금액"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="메모 (선택)"
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">송금 등록</button>
      </form>

      <h2 style={{ marginTop: "2rem" }}>📄 송금 내역</h2>
      <ul>
        {remittances.map(r => (
          <li key={r.id}>
            발주 #{r.purchase_order_id} / {r.amount.toLocaleString()}원 / {r.date}
            {r.memo && <> / 메모: {r.memo}</>}
            {r.file_path && (
              <a
                href={`${API_BASE}/${r.file_path}`}
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

export default RemittancePage;
