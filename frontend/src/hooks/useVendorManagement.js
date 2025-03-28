import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import * as XLSX from "xlsx";
import readXlsxFile from 'read-excel-file';
import { vendorConfig } from "../api/config";

// ✅ vendorApi 대신 fileApi 사용
import {
  uploadFile,
  downloadFile
} from "../api/fileApi";

export const useVendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/vendors`);
      setVendors(response.data);
    } catch (error) {
      console.error("공급업체 목록 불러오기 실패:", error);
    }
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm("정말로 이 공급업체를 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${API_BASE}/vendors/${id}`);
        alert("공급업체가 삭제되었습니다.");
        fetchVendors();
      } catch (error) {
        console.error("공급업체 삭제 실패:", error);
        alert("공급업체 삭제에 실패했습니다.");
      }
    }
  };

  const handleVendorSubmit = async (vendor, closeModalCallback) => {
    const isEditing = !!vendor.id;
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/vendors/${vendor.id}`, vendor);
        alert("공급업체가 수정되었습니다.");
      } else {
        await axios.post(`${API_BASE}/vendors`, vendor);
        alert("공급업체가 추가되었습니다.");
      }
      await fetchVendors();
      if (typeof closeModalCallback === "function") {
        closeModalCallback();
      }
    } catch (error) {
      console.error(isEditing ? "공급업체 수정 실패:" : "공급업체 등록 실패:", error);
      alert("공급업체 등록/수정에 실패했습니다.");
    }
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

      const columnMapping = {};
      vendorConfig.fields.forEach((field) => {
        const index = headerRow.findIndex((cell) => cell === field.label);
        columnMapping[field.key] = index;
      });

      vendorConfig.fields
        .filter((f) => f.required)
        .forEach((f) => {
          if (columnMapping[f.key] === -1) {
            throw new Error(`[${f.label}] 열이 누락되었습니다.`);
          }
        });

      const vendors = rows.slice(1).map((row) => {
        const vendor = {};
        vendorConfig.fields.forEach((field) => {
          const cell = row[columnMapping[field.key]];
          vendor[field.key] = cell?.toString().trim() || "";
        });
        return vendor;
      });

      await axios.post(`${API_BASE}/vendors/bulk`, { vendors });
      alert("공급업체 일괄 추가 완료!");
      setUploadError("");
      fetchVendors();

      if (typeof closeModalCallback === "function") {
        closeModalCallback();
      }
    } catch (error) {
      console.error("엑셀 파일 처리 오류:", error);
      setUploadError(error.message || "엑셀 파일 처리 중 오류가 발생했습니다.");
    }
  };

  const downloadExcel = (vendors) => {
    const worksheet = XLSX.utils.json_to_sheet(vendors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");
    XLSX.writeFile(workbook, "vendors.xlsx");
  };

  // ✅ fileApi 활용한 통합 업로드
  const handleVendorFileUpload = async (vendorId, files) => {
    const fileList = Array.isArray(files) ? files : [files];
    let successCount = 0;
    const failedFiles = [];

    for (const file of fileList) {
      try {
        await uploadFile("vendors", vendorId, file);
        successCount += 1;
      } catch (err) {
        console.error(`파일 업로드 실패: ${file.name}`, err);
        failedFiles.push(file.name);
      }
    }

    let message = "";
    if (successCount > 0) {
      message += `${successCount}개 파일 업로드 성공!`;
    }
    if (failedFiles.length > 0) {
      message += `\n업로드 실패 파일: ${failedFiles.join(", ")}`;
    }

    if (message) {
      alert(message);
    }
  };

  const handleVendorFileDownload = async (fileId) => {
    try {
      const blob = await downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "첨부파일.pdf";
      link.click();
    } catch (err) {
      console.error("다운로드 실패:", err);
      alert("파일 다운로드 실패!");
    }
  };

  return {
    vendors,
    fetchVendors,
    handleDeleteVendor,
    handleVendorSubmit,
    handleExcelUpload,
    downloadExcel,
    handleVendorFileUpload,
    handleVendorFileDownload,
    uploadError,
    fileInputRef,
  };
};
