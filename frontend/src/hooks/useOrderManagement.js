// src/hooks/useOrderManagement.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import { uploadFile } from "../api/fileApi";
import * as XLSX from "xlsx";

export function useOrderManagement() {
  const [orders, setOrders] = useState([]);
  const fileInputRef = useRef();
  const [uploadError, setUploadError] = useState("");

  const fetchOrders = async () => {
    const res = await axios.get(`${API_BASE}/orders`);
    setOrders(res.data);
  };

  const handleOrderSubmit = async (order) => {
    if (order.id) {
      await axios.put(`${API_BASE}/orders/${order.id}`, order);
    } else {
      await axios.post(`${API_BASE}/orders`, order);
    }
    await fetchOrders();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`${API_BASE}/orders/${id}`);
    await fetchOrders();
  };

  const handleExcelUpload = async (file, callback) => {
    setUploadError("");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      for (const order of json) {
        await axios.post(`${API_BASE}/orders`, order);
      }
      await fetchOrders();
      if (callback) callback();
    } catch (err) {
      console.error("엑셀 업로드 실패:", err);
      setUploadError("엑셀 업로드에 실패했습니다.");
    }
  };

  const downloadExcel = (orders) => {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    handleDelete,
    handleOrderSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  };
}