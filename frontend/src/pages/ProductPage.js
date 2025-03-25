import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [modules, setModules] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [sensors, setSensors] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    manufacturer: "",
    price: "",
    module: "",
    lens: "",
    sensor: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchParts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${API_BASE}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("불러오기 실패:", err));
  };

  const fetchParts = () => {
    axios.get(`${API_BASE}/product-parts`)
      .then((res) => {
        const all = res.data;
        setModules(all.filter(p => p.type === "모듈"));
        setLenses(all.filter(p => p.type === "렌즈"));
        setSensors(all.filter(p => p.type === "센서"));
      })
      .catch((err) => console.error("부품 불러오기 실패:", err));
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
          module: "",
          lens: "",
          sensor: ""
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
            <br />
            구성: {p.module} / {p.lens} / {p.sensor}
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

        <h3>🧩 구성 선택</h3>
        <select value={newProduct.module} onChange={(e) => setNewProduct({ ...newProduct, module: e.target.value })} required>
          <option value="">-- 모듈 선택 --</option>
          {modules.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>

        <select value={newProduct.lens} onChange={(e) => setNewProduct({ ...newProduct, lens: e.target.value })} required>
          <option value="">-- 렌즈 선택 --</option>
          {lenses.map((l) => (
            <option key={l.id} value={l.name}>{l.name}</option>
          ))}
        </select>

        <select value={newProduct.sensor} onChange={(e) => setNewProduct({ ...newProduct, sensor: e.target.value })} required>
          <option value="">-- 센서 선택 --</option>
          {sensors.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <br /><br />
        <button type="submit">등록</button>
      </form>
    </div>
  );
}

export default ProductPage;
