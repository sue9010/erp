import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import readXlsxFile from "read-excel-file";

export const useProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("제품 목록 불러오기 실패:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 제품을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${API_BASE}/products/${id}`);
        alert("제품이 삭제되었습니다.");
        fetchProducts();
      } catch (error) {
        console.error("제품 삭제 실패:", error);
      }
    }
  };

  const handleProductSubmit = async (product, closeModal) => {
    const isEditing = !!product.id;
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/products/${product.id}`, product);
        alert("제품이 수정되었습니다.");
      } else {
        await axios.post(`${API_BASE}/products`, {
          ...product,
          price: parseInt(product.price),
          stock: parseInt(product.stock),
        });
        alert("제품이 추가되었습니다.");
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error(isEditing ? "제품 수정 실패:" : "제품 등록 실패:", error);
    }
  };

  const handleExcelUpload = async (file, closeModal) => {
    if (!file) {
      setUploadError("파일을 선택해주세요.");
      return;
    }

    try {
      const rows = await readXlsxFile(file);
      const products = rows.slice(1).map((row) => ({
        category: row[0],
        name: row[1],
        manufacturer: row[2],
        price: parseInt(row[3]),
        stock: parseInt(row[4]),
        note: row[5] || "",
      }));
      await axios.post(`${API_BASE}/products/bulk`, { products });
      alert("제품 일괄 추가 완료!");
      setUploadError("");
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("엑셀 파일 처리 오류:", error);
      setUploadError("엑셀 파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해주세요.");
    }
  };

  return {
    products,
    fetchProducts,
    handleDelete,
    handleProductSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
  };
};
