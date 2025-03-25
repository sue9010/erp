import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api/config'; // config.js 위치에 따라 경로 조정

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    order_id: '',
    amount: '',
    date: '',
    depositor: '',
    note: '',
  });
  const [file, setFile] = useState(null);

  const fetchPayments = async () => {
    const res = await axios.get(`${API_BASE}/payments`);
    setPayments(res.data);
  };

  const handleSubmit = async () => {
    const payload = { ...form, order_id: form.order_id ? parseInt(form.order_id) : null };
    const res = await axios.post(`${API_BASE}/payments`, payload);
    const paymentId = res.data.payment.id;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${API_BASE}/payments/${paymentId}/upload`, formData);
    }

    setForm({ order_id: '', amount: '', date: '', depositor: '', note: '' });
    setFile(null);
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">입금 등록</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input className="border p-2" placeholder="주문 ID (선택)" value={form.order_id}
               onChange={e => setForm({ ...form, order_id: e.target.value })} />
        <input className="border p-2" placeholder="금액" value={form.amount}
               onChange={e => setForm({ ...form, amount: e.target.value })} />
        <input type="date" className="border p-2" value={form.date}
               onChange={e => setForm({ ...form, date: e.target.value })} />
        <input className="border p-2" placeholder="입금자" value={form.depositor}
               onChange={e => setForm({ ...form, depositor: e.target.value })} />
        <input className="border p-2 col-span-2" placeholder="비고" value={form.note}
               onChange={e => setForm({ ...form, note: e.target.value })} />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
        입금 등록
      </button>

      <h2 className="text-xl font-bold mt-8">입금 내역</h2>
      <ul className="mt-2 space-y-2">
        {payments.map(p => (
          <li key={p.id} className="border p-2">
            #{p.id} | {p.depositor} | {p.amount}원 | {p.date}
            {p.file_path && (
              <a href={`${API_BASE}/${p.file_path}`} className="ml-2 text-blue-600" target="_blank" rel="noreferrer">
                입금증 보기
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentPage;
