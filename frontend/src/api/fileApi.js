import axios from "axios";

/**
 * 특정 엔터티(vendors, products 등)에 파일 업로드
 * @param {string} entity - 예: "vendors", "products"
 * @param {string|number} id - 해당 엔터티의 고유 ID
 * @param {File} file - 업로드할 파일
 */
export const uploadFile = async (entity, id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `http://localhost:8000/${entity}/${id}/files`,  // ✅ "api" prefix 제거
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

/**
 * 특정 파일 ID에 해당하는 파일 다운로드
 * @param {string|number} fileId
 */
export const downloadFile = async (fileId) => {
  const response = await axios.get(
    `http://localhost:8000/files/${fileId}`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

/**
 * 특정 엔터티의 첨부 파일 목록 조회
 * @param {string} entity - 예: "vendors", "products"
 * @param {string|number} id
 */
export const fetchFiles = async (entity, id) => {
  const response = await axios.get(
    `http://localhost:8000/${entity}/${id}/files`
  );
  return response.data;
};

/**
 * 특정 파일 ID에 해당하는 파일 삭제
 * @param {string|number} fileId
 */
export const deleteFile = async (fileId) => {
  const response = await axios.delete(
    `http://localhost:8000/files/${fileId}`
  );
  return response.data;
};

/**
 * 특정 엔터티의 모든 첨부파일을 ZIP으로 다운로드
 * @param {string} entity - 예: "vendors", "products"
 * @param {string|number} id
 */
export const downloadAllFiles = async (entity, id) => {
  const response = await axios.get(
    `http://localhost:8000/${entity}/${id}/files/download-all`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};
