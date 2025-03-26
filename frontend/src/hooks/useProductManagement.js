// src/hooks/useProductManagement.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api/config';

export const useProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${API_BASE}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("불러오기 실패:", err));
  };

  const handleProductSubmit = (product) => {
    const isEditing = !!product.id;
    const apiCall = isEditing
      ? axios.put(`${API_BASE}/products/${product.id}`, product)
      : axios.post(`${API_BASE}/products`, {
          ...product,
          price: parseInt(product.price),
          stock: parseInt(product.stock),
        });

    apiCall
      .then(() => {
        alert(isEditing ? "제품이 수정되었습니다." : "제품이 추가되었습니다.");
        fetchProducts();
      })
      .catch((err) => console.error(isEditing ? "수정 실패:" : "등록 실패:", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("정말로 이 제품을 삭제하시겠습니까?")) {
      axios.delete(`${API_BASE}/products/${id}`)
        .then(() => {
          alert("제품이 삭제되었습니다.");
          fetchProducts();
        })
        .catch((err) => console.error("삭제 실패:", err));
    }
  };

  return { products, currentProduct, setCurrentProduct, handleProductSubmit, handleDelete };
};
