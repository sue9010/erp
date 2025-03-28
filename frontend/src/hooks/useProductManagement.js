import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import readXlsxFile from "read-excel-file";
import * as XLSX from 'xlsx';
import { productConfig } from "../api/config";

// ✅ fileApi 통합 import
import {
  uploadFile,
  downloadFile,
  fetchFiles,
  deleteFile,
  downloadAllFiles,
} from "../api/fileApi";

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

      if (!rows || rows.length < 2) {
        throw new Error("유효한 데이터가 없습니다. 파일을 확인해주세요.");
      }

      const headerRow = rows[0];
      if (!headerRow || headerRow.length === 0) {
        throw new Error("헤더 행이 비어있습니다.");
      }

      // label → index 매핑
      const columnMapping = {};
      productConfig.fields.forEach((field) => {
        const index = headerRow.findIndex((cell) => cell === field.label);
        columnMapping[field.key] = index;
      });

      // 필수 필드 검증
      productConfig.fields.forEach((f) => {
        if (columnMapping[f.key] === -1 || columnMapping[f.key] === undefined) {
          console.warn(`헤더에 '${f.label}' 항목이 없습니다. (key: ${f.key})`);
        }
      });

      const products = rows.slice(1).map((row) => {
        const product = {};
        productConfig.fields.forEach((field) => {
          const cell = row[columnMapping[field.key]];
          product[field.key] =
            typeof cell === "number" && ["price", "stock"].includes(field.key)
              ? cell
              : (cell?.toString().trim() || "");
        });
        return product;
      });

      const response = await axios.post(`${API_BASE}/products/bulk`, { products });
      alert(response.data.message || "제품 일괄 업로드 완료!");
      setUploadError("");
      fetchProducts();

      if (typeof closeModalCallback === "function") {
        closeModalCallback();
      }
    } catch (error) {
      console.error("엑셀 파일 처리 오류:", error);
      setUploadError(error.message || "엑셀 파일 처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ 파일 관련 기능 추가
  const uploadProductFile = async (productId, file) => {
    return await uploadFile("products", productId, file);
  };

  const fetchProductFiles = async (productId) => {
    return await fetchFiles("products", productId);
  };

  const deleteProductFile = async (fileId) => {
    return await deleteFile(fileId);
  };

  const downloadAllProductFiles = async (productId) => {
    return await downloadAllFiles("products", productId);
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

    // ✅ 파일 관련 함수 반환
    uploadProductFile,
    fetchProductFiles,
    deleteProductFile,
    downloadAllProductFiles,
  };
};
