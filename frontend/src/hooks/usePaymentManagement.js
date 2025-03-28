// src/hooks/usePaymentManagement.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import * as XLSX from "xlsx";

export function usePaymentManagement() {
  const [payments, setPayments] = useState([]);
  const fileInputRef = useRef();
  const [uploadError, setUploadError] = useState("");

  const fetchPayments = async () => {
    const res = await axios.get(`${API_BASE}/payments`);
    setPayments(res.data);
  };

  const handlePaymentSubmit = async (payment) => {
    if (payment.id) {
      await axios.put(`${API_BASE}/payments/${payment.id}`, payment);
    } else {
      await axios.post(`${API_BASE}/payments`, payment);
    }
    await fetchPayments();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`${API_BASE}/payments/${id}`);
    await fetchPayments();
  };

  const handleExcelUpload = async (file, callback) => {
    setUploadError("");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      for (const payment of json) {
        await axios.post(`${API_BASE}/payments`, payment);
      }
      await fetchPayments();
      if (callback) callback();
    } catch (err) {
      console.error("엑셀 업로드 실패:", err);
      setUploadError("엑셀 업로드에 실패했습니다.");
    }
  };

  const downloadExcel = (payments) => {
    const ws = XLSX.utils.json_to_sheet(payments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payments.xlsx");
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    handleDelete,
    handlePaymentSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  };
}
