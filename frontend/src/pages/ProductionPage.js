// src/pages/ProductionPage.js

import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { AddModifyModal } from "../modals/AddModifyModal";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import FileUploadModal from "../modals/FileUploadModal";
import FileManageModal from "../modals/FileManageModal";
import FileDownloadModal from "../modals/FileDownloadModal";
import { DataTable } from "../components/DataTable";
import { useProductionManagement } from "../hooks/useProductionManagement";
import { productionConfig } from "../api/config";
import { uploadFile } from "../api/fileApi";

function ProductionPage() {
  const [showAddModifyModal, setShowAddModifyModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showFileManageModal, setShowFileManageModal] = useState(false);
  const [showFileDownloadModal, setShowFileDownloadModal] = useState(false);
  const [currentProduction, setCurrentProduction] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    productions,
    handleDelete,
    handleProductionSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
    fetchOrderItems,
  } = useProductionManagement();

  const filteredProductions = useMemo(() => {
    return productions
      .filter((p) =>
        productionConfig.searchFields.some((field) =>
          p[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => b.id - a.id);
  }, [productions, searchTerm]);

  const paginatedProductions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProductions.slice(start, start + itemsPerPage);
  }, [filteredProductions, currentPage]);

  const totalPages = Math.ceil(filteredProductions.length / itemsPerPage);

  const handleOpenAddModifyModal = async (production = null) => {
    const defaultProduction = {
      order_number: "",
      scheduled_date: "",
      items: []
    };

    if (production) {
      setCurrentProduction(production);
    } else {
      setCurrentProduction(defaultProduction);
    }

    setShowAddModifyModal(true);
  };

  const handleUploadFiles = async (files) => {
    for (const file of files) {
      await uploadFile("productions", currentProduction.id, file);
    }
    alert("파일 업로드가 완료되었습니다.");
    setShowFileUploadModal(false);
  };

  return (
    <div>
      <h2>{productionConfig.title}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder={`검색 (${productionConfig.searchFields.join(", ")})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenAddModifyModal()}>
          생산 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
        <Button variant="success" onClick={() => downloadExcel(filteredProductions)}>
          엑셀로 다운로드
        </Button>
      </ButtonGroup>

      <DataTable
        data={paginatedProductions}
        config={{ ...productionConfig, enableFile: true }}
        onEdit={handleOpenAddModifyModal}
        onDelete={handleDelete}
        onUploadClick={(row) => { setCurrentProduction(row); setShowFileUploadModal(true); }}
        onDownloadClick={(row) => { setCurrentProduction(row); setShowFileDownloadModal(true); }}
        onManageClick={(row) => { setCurrentProduction(row); setShowFileManageModal(true); }}
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

      <AddModifyModal
        show={showAddModifyModal}
        handleClose={() => setShowAddModifyModal(false)}
        product={currentProduction}
        handleSubmit={handleProductionSubmit}
        setProduct={setCurrentProduction}
        config={productionConfig}
        fetchOrderItems={fetchOrderItems} // 주문 제품 자동 연결
      />

      <ExcelUploadModal
        show={showExcelModal}
        handleClose={() => setShowExcelModal(false)}
        handleUpload={(file) => handleExcelUpload(file, () => setShowExcelModal(false))}
        uploadError={uploadError}
        fileInputRef={fileInputRef}
      />

      <FileUploadModal
        show={showFileUploadModal}
        handleClose={() => setShowFileUploadModal(false)}
        onUpload={handleUploadFiles}
      />

      <FileManageModal
        show={showFileManageModal}
        handleClose={() => setShowFileManageModal(false)}
        entity="productions"
        entityId={currentProduction.id}
        entityName={`생산-${currentProduction.id}`}
      />

      <FileDownloadModal
        show={showFileDownloadModal}
        handleClose={() => setShowFileDownloadModal(false)}
        entity="productions"
        entityId={currentProduction.id}
        entityName={`생산-${currentProduction.id}`}
      />
    </div>
  );
}

export default ProductionPage;
