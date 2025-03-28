// src/hooks/useQuotationManagement.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import * as XLSX from "xlsx";

export function useQuotationManagement() {
  const [quotations, setQuotations] = useState([]);
  const fileInputRef = useRef();
  const [uploadError, setUploadError] = useState("");

  const fetchQuotations = async () => {
    const res = await axios.get(`${API_BASE}/quotations`);
    setQuotations(res.data);
  };

  const handleQuotationSubmit = async (quotation) => {
    if (quotation.id) {
      await axios.put(`${API_BASE}/quotations/${quotation.id}`, quotation);
    } else {
      await axios.post(`${API_BASE}/quotations`, quotation);
    }
    await fetchQuotations();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`${API_BASE}/quotations/${id}`);
    await fetchQuotations();
  };

  const handleExcelUpload = async (file, callback) => {
    setUploadError("");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      for (const quotation of json) {
        await axios.post(`${API_BASE}/quotations`, quotation);
      }
      await fetchQuotations();
      if (callback) callback();
    } catch (err) {
      console.error("엑셀 업로드 실패:", err);
      setUploadError("엑셀 업로드에 실패했습니다.");
    }
  };

  const downloadExcel = (quotations) => {
    const ws = XLSX.utils.json_to_sheet(quotations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotations");
    XLSX.writeFile(wb, "quotations.xlsx");
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    quotations,
    handleDelete,
    handleQuotationSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  };
}
