import React, { useEffect, useState } from "react";
import axios from "axios";

function OrderPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customer: "",
    items: [{ product_name: "", quantity: 1 }]
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/products").then(res => setProducts(res.data));
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios.get("http://127.0.0.1:8000/orders").then(res => setOrders(res.data));
  };

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product_name: "", quantity: 1 }]
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...newOrder.items];
    items[index][field] = field === "quantity" ? parseInt(value) : value;
    setNewOrder({ ...newOrder, items });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/orders", newOrder)
      .then(() => {
        alert("주문 등록 완료!");
        setNewOrder({ customer: "", items: [{ product_name: "", quantity: 1 }] });
        fetchOrders();
      })
      .catch((err) =>{
        if (err.response) {
          alert("❗주문 실패: " + err.response.data.detail);
        } else {
          alert("❗오류 발생: " + err.message);
        }
      });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📦 주문 목록</h1>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.customer}
            <ul>
              {o.items.map((item, i) => (
                <li key={i}>{item.product_name} / {item.quantity}개</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <hr />
      <h2>🛒 새 주문 등록</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="고객명"
          value={newOrder.customer}
          onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
          required
        />
        <h3>주문 항목</h3>
        {newOrder.items.map((item, index) => (
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
        <button type="submit">주문 등록</button>
      </form>
    </div>
  );
}

export default OrderPage;
