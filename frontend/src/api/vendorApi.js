// src/api/vendorApi.js

import { uploadFile, downloadFile } from "./fileApi";

/**
 * 공급업체 관련 파일 업로드
 * @param {number|string} vendorId
 * @param {File} file
 */
export const uploadVendorFile = (vendorId, file) => {
  return uploadFile("vendors", vendorId, file);
};

/**
 * 공급업체 관련 파일 다운로드
 * @param {number|string} fileId
 */
export const downloadVendorFile = (fileId) => {
  return downloadFile(fileId);
};
