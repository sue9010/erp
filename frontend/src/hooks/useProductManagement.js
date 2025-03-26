import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import readXlsxFile from "read-excel-file";
import * as XLSX from 'xlsx';

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
        alert("제품 삭제에 실패했습니다.");
      }
    }
  };

  const handleProductSubmit = async (product, closeModalCallback) => {
    const isEditing = !!product.id;
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/products/${product.id}`, product);
        alert("제품이 수정되었습니다.");
      } else {
        await axios.post(`${API_BASE}/products`, product);
        alert("제품이 추가되었습니다.");
      }
      fetchProducts();
      if (typeof closeModalCallback === 'function') {
        closeModalCallback();
      }
    } catch (error) {
      console.error(isEditing ? "제품 수정 실패:" : "제품 등록 실패:", error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data.detail);
      } else {
        alert(isEditing ? "제품 수정에 실패했습니다." : "제품 등록에 실패했습니다.");
      }
    }
  };

  const downloadExcel = (products) => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const handleExcelUpload = async (file, closeModalCallback) => {
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

      const response = await axios.post(`${API_BASE}/products/bulk`, { products });
      alert(response.data.message);
      setUploadError("");
      fetchProducts();
      if (typeof closeModalCallback === 'function') {
        closeModalCallback();
      }
    } catch (error) {
      console.error("엑셀 파일 처리 오류:", error);
      if (error.response && error.response.data.detail) {
        setUploadError(error.response.data.detail.message);
        console.error("중복 제품:", error.response.data.detail.errors);
      } else {
        setUploadError("엑셀 파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해주세요.");
      }
    }
  };

  return {
    products,
    fetchProducts,
    handleDelete,
    handleProductSubmit,
    handleExcelUpload,
    downloadExcel,
    uploadError,
    fileInputRef,
  };
};
