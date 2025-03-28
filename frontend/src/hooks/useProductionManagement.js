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

    // 예: useProductionManagement.js
    const handleProductionSubmit = async (production) => {
      try {
        if (production.id) {
          await axios.put(`${API_BASE}/productions/${production.id}`, production);
        } else {
          await axios.post(`${API_BASE}/productions`, production);
        }
        await fetchProductions(); // 성공 시만 목록 갱신
      } catch (error) {
        // 실패 시에도 목록 갱신해서 UI 원복
        await fetchProductions();
        throw error; // 모달 쪽에서 alert 띄우기 위해 에러 다시 던짐
      }
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

  const fetchOrderItems = async (orderNumber) => {
    try {
      const res = await axios.get(`${API_BASE}/orders/by-number/${orderNumber}`);
      const order = res.data;

      const filtered = [];

      for (const p of order.products || []) {
        // 🔍 카테고리에 "카메라"가 포함된 경우만 포함
        if (p.category?.includes("카메라")) {
          filtered.push({
            product_name: `[${p.category}] ${p.name}`,
          });
        }

        for (const opt of p.options || []) {
          if (opt.category?.includes("카메라")) {
            filtered.push({
              product_name: `[${opt.category}] ${opt.name}`,
            });
          }
        }
      }

      return filtered;
    } catch (err) {
      console.error("주문 정보 조회 실패:", err);
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
