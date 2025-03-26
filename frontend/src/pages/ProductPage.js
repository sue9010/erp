import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";

function ProductPage() {
  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    manufacturer: "",
    price: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${API_BASE}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("불러오기 실패:", err));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/products`, {
      ...newProduct,
      price: parseInt(newProduct.price)
    })
      .then(() => {
        alert("제품 추가 완료!");
        setNewProduct({
          name: "",
          manufacturer: "",
          price: "",
       });
        fetchProducts();
      })
      .catch((err) => console.error("등록 실패:", err));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📦 제품 목록</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} / {p.manufacturer} / {p.price?.toLocaleString()}원 / 재고: {p.stock ?? 0}개
          </li>        
        ))}
      </ul>

      <h2>➕ 제품 등록</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제품명"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="제조사"
          value={newProduct.manufacturer}
          onChange={(e) => setNewProduct({ ...newProduct, manufacturer: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="가격"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          required
        />
        <br /><br />
        <button type="submit">등록</button>
      </form>
    </div>
  );
}

export default ProductPage;
