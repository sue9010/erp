// src/pages/VendorPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function VendorPage() {
  const [vendors, setVendors] = useState([]);
  const [newVendor, setNewVendor] = useState({ name: "", contact: "" });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = () => {
    axios.get("http://127.0.0.1:8000/vendors")
      .then((res) => setVendors(res.data))
      .catch((err) => console.error("불러오기 실패:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/vendors", newVendor)
      .then((res) => {
        alert("업체 추가 성공!");
        setNewVendor({ name: "", contact: "" });
        fetchVendors();
      })
      .catch((err) => console.error("등록 실패:", err));
  };

  const [excelFile, setExcelFile] = useState(null);

const handleExcelUpload = () => {
  if (!excelFile) {
    alert("엑셀 파일을 선택해주세요!");
    return;
  }

  const formData = new FormData();
  formData.append("file", excelFile);

  axios.post("http://127.0.0.1:8000/vendors/upload_excel", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
    .then((res) => {
      alert(res.data.message);
      fetchVendors();
    })
    .catch((err) => console.error("엑셀 업로드 실패:", err));
};


  return (
    <div>
      <h1>📋 업체 목록</h1>
      <ul>
        {vendors.map((vendor) => (
          <li key={vendor.id}>
            {vendor.name} ({vendor.contact})
          </li>
        ))}
      </ul>

      <h2>➕ 업체 등록</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="업체명"
          value={newVendor.name}
          onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="연락처"
          value={newVendor.contact}
          onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
          required
        />
        <button type="submit">등록</button>
      </form>
      <hr />
        <h2>📂 엑셀로 등록</h2>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setExcelFile(e.target.files[0])}
        />
        <button onClick={handleExcelUpload}>엑셀 업로드</button>
    </div>
  );
}

export default VendorPage;
