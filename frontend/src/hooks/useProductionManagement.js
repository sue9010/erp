// src/hooks/useProductionManagement.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import * as XLSX from "xlsx";

export function useProductionManagement() {
  const [productions, setProductions] = useState([]);
  const fileInputRef = useRef();
  const [uploadError, setUploadError] = useState("");

  const fetchProductions = async () => {
    const res = await axios.get(`${API_BASE}/productions`);
    setProductions(res.data);
  };

  const handleProductionSubmit = async (production) => {
    if (production.id) {
      alert("수정 기능은 아직 구현되지 않았습니다.");
      return;
    } else {
      await axios.post(`${API_BASE}/productions`, production);
    }
    await fetchProductions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`${API_BASE}/productions/${id}`);
    await fetchProductions();
  };

  const handleExcelUpload = async (file, callback) => {
    setUploadError("");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      for (const production of json) {
        await axios.post(`${API_BASE}/productions`, production);
      }
      await fetchProductions();
      if (callback) callback();
    } catch (err) {
      console.error("엑셀 업로드 실패:", err);
      setUploadError("엑셀 업로드에 실패했습니다.");
    }
  };

  const downloadExcel = (productions) => {
    const ws = XLSX.utils.json_to_sheet(productions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productions");
    XLSX.writeFile(wb, "productions.xlsx");
  };

  const fetchOrderItems = async (order_number) => {
    try {
      const res = await axios.get(`${API_BASE}/orders/by-number/${order_number}`);
      return res.data.products || [];
    } catch (err) {
      console.error("주문 정보 불러오기 실패:", err);
      return [];
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  return {
    productions,
    handleDelete,
    handleProductionSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
    fetchOrderItems,
  };
}
