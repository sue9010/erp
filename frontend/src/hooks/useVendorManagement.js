import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api/config";
import * as XLSX from "xlsx";
import readXlsxFile from 'read-excel-file';


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
      await fetchVendors(); // 목록 새로고침
      if (typeof closeModalCallback === "function") {
        closeModalCallback(); // 모달 닫기
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
      // 엑셀 파일 읽기
      const rows = await readXlsxFile(file);
  
      // 데이터 유효성 검사
      if (!rows || rows.length < 2) {
        throw new Error("유효한 데이터가 없습니다. 파일을 확인해주세요.");
      }
  
      // 헤더 행 가져오기
      const headerRow = rows[0];
      if (!headerRow || headerRow.length === 0) {
        throw new Error("헤더 행이 비어있습니다.");
      }
  
      // 헤더 매핑
      const columnMapping = {
        company_name: headerRow.findIndex((cell) => cell === "업체명"),
        contact_person: headerRow.findIndex((cell) => cell === "담당자명"),
        contact: headerRow.findIndex((cell) => cell === "연락처"),
        country: headerRow.findIndex((cell) => cell === "국가"),
        address: headerRow.findIndex((cell) => cell === "주소"),
        export_license_required: headerRow.findIndex((cell) => cell === "수출허가필요여부"),
        export_license_type: headerRow.findIndex((cell) => cell === "수출허가구분"),
        export_license_number: headerRow.findIndex((cell) => cell === "수출허가번호"),
        shipping_method: headerRow.findIndex((cell) => cell === "운송방법"),
        shipping_account: headerRow.findIndex((cell) => cell === "운송계정"),
        note: headerRow.findIndex((cell) => cell === "비고"),
      };

      // 필수 필드 검증
      ["company_name", "contact_person", "contact", "country", "address"].forEach((key) => {
        if (columnMapping[key] === -1) {
          throw new Error(`[${key}] 열이 누락되었습니다.`);
        }
      });

      // 데이터 추출
      const vendors = rows.slice(1).map((row) => ({
        company_name: row[columnMapping.company_name]?.toString().trim() || "",
        contact_person: row[columnMapping.contact_person]?.toString().trim() || "",
        contact: row[columnMapping.contact]?.toString().trim() || "",
        country: row[columnMapping.country]?.toString().trim() || "",
        address: row[columnMapping.address]?.toString().trim() || "",
        export_license_required: row[columnMapping.export_license_required]?.toString().trim() || "",
        export_license_type: row[columnMapping.export_license_type]?.toString().trim() || "",
        export_license_number: row[columnMapping.export_license_number]?.toString().trim() || "",
        shipping_method: row[columnMapping.shipping_method]?.toString().trim() || "",
        shipping_account: row[columnMapping.shipping_account]?.toString().trim() || "",
        note: row[columnMapping.note]?.toString().trim() || "",
      }));

  
      // 서버로 전송
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

  return {
    vendors,
    fetchVendors,
    handleDeleteVendor,
    handleVendorSubmit,
    handleExcelUpload,
    downloadExcel,
    uploadError,
    fileInputRef,
  };
};
