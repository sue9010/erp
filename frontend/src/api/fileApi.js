// src/api/fileApi.js

import axios from "axios";

/**
 * 특정 엔터티(vendors, shipments 등)에 파일 업로드
 * @param {string} entity - 예: "vendors", "shipments"
 * @param {string|number} id - 해당 엔터티의 고유 ID
 * @param {File} file - 업로드할 파일
 */
export const uploadFile = async (entity, id, file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await axios.post(
      `http://localhost:8000/${entity}/${id}/files`,  // ✅ "api" prefix 제거!
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  };
  
  export const downloadFile = async (fileId) => {
    const response = await axios.get(
      `http://localhost:8000/files/${fileId}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  };
