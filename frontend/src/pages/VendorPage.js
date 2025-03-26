import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import { ProductModal } from "../modals/AddModifyModal";
import { DataTable } from "../components/DataTable";
import { useVendorManagement } from "../hooks/useVendorManagement";
import { vendorConfig } from "../api/config";

function VendorPage() {
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentVendor, setCurrentVendor] = useState({});
  const itemsPerPage = 10;

  const {
    vendors,
    handleDeleteVendor,
    handleVendorSubmit,
    handleExcelUpload,
    downloadExcel,
    uploadError,
    fileInputRef,
  } = useVendorManagement();

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) =>
      vendorConfig.searchFields.some((field) =>
        vendor[field].toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [vendors, searchTerm]);

  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVendors.slice(startIndex, endIndex);
  }, [filteredVendors, currentPage]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const handleOpenProductModal = () => {
    setCurrentVendor({});
    setShowProductModal(true);
  };
  
  return (
    <div>
      <h2>{vendorConfig.title}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder={`검색 (${vendorConfig.searchFields.join(", ")})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={handleOpenProductModal}>
          공급업체 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
        <Button variant="success" onClick={() => downloadExcel(filteredVendors)}>
          엑셀로 다운로드
        </Button>
      </ButtonGroup>

      <DataTable
        data={paginatedVendors}
        config={vendorConfig}
        onEdit={(vendor) => alert(`수정 모달 열기: ${vendor.name}`)}
        onDelete={handleDeleteVendor}
      />

      <div className="pagination-controls">
        <Button
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          이전
        </Button>
        <span>{currentPage} / {totalPages}</span>
        <Button
          variant="secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          다음
        </Button>
      </div>

      <ProductModal
        show={showProductModal}
        handleClose={() => setShowProductModal(false)}
        product={currentVendor}
        handleSubmit={handleVendorSubmit}
        setProduct={setCurrentVendor}
        modalType="vendor"
      />

      <ExcelUploadModal
        show={showExcelModal}
        handleClose={() => setShowExcelModal(false)}
        handleUpload={(file) => handleExcelUpload(file, () => setShowExcelModal(false))}
        uploadError={uploadError}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}

export default VendorPage;
