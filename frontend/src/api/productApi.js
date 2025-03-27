import axios from "axios";
import { API_BASE } from "./config";

// ✅ 파일 업로드
export const uploadProductFile = async (productId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${API_BASE}/products/${productId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ 파일 목록 조회
export const fetchProductFiles = async (productId) => {
  const response = await axios.get(`${API_BASE}/products/${productId}/files`);
  return response.data;
};

// ✅ 파일 삭제
export const deleteProductFile = async (fileId) => {
  await axios.delete(`${API_BASE}/products/files/${fileId}`);
};

// ✅ 전체 다운로드 (ZIP)
export const downloadProductFilesZip = async (productId) => {
  const response = await axios.get(`${API_BASE}/products/${productId}/files/download-all`, {
    responseType: "blob",
  });
  return response.data;
};
