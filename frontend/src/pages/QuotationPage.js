// src/pages/QuotationPage.js
import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { AddModifyModal } from "../modals/AddModifyModal";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import FileUploadModal from "../modals/FileUploadModal";
import FileManageModal from "../modals/FileManageModal";
import FileDownloadModal from "../modals/FileDownloadModal";
import { DataTable } from "../components/DataTable";
import { useQuotationManagement } from "../hooks/useQuotationManagement";
import { quotationConfig } from "../api/config";
import { uploadFile } from "../api/fileApi";

function QuotationPage() {
  const [showAddModifyModal, setShowAddModifyModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showFileManageModal, setShowFileManageModal] = useState(false);
  const [showFileDownloadModal, setShowFileDownloadModal] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    quotations,
    handleDelete,
    handleQuotationSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  } = useQuotationManagement();

  const filteredQuotations = useMemo(() => {
    const filtered = quotations.filter((q) =>
      quotationConfig.searchFields.some((field) =>
        q[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    return filtered.sort((a, b) => b.id - a.id);
  }, [quotations, searchTerm]);

  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQuotations.slice(startIndex, endIndex);
  }, [filteredQuotations, currentPage]);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  const handleOpenAddModifyModal = (quotation = null) => {
    const defaultQuotation = quotationConfig.fields.reduce((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    setCurrentQuotation(quotation || defaultQuotation);
    setShowAddModifyModal(true);
  };

  const handleCloseAddModifyModal = () => {
    setShowAddModifyModal(false);
  };

  const handleUploadFiles = async (files) => {
    for (const file of files) {
      await uploadFile("quotations", currentQuotation.id, file);
    }
    alert("파일 업로드가 완료되었습니다.");
    setShowFileUploadModal(false);
  };

  return (
    <div>
      <h2>{quotationConfig.title}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder={`검색 (${quotationConfig.searchFields.join(", ")})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenAddModifyModal()}>
          견적 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
        <Button variant="success" onClick={() => downloadExcel(filteredQuotations)}>
          엑셀로 다운로드
        </Button>
      </ButtonGroup>

      <DataTable
        data={paginatedQuotations}
        config={{ ...quotationConfig, enableFile: true }}
        onEdit={handleOpenAddModifyModal}
        onDelete={handleDelete}
        onUploadClick={(row) => { setCurrentQuotation(row); setShowFileUploadModal(true); }}
        onDownloadClick={(row) => { setCurrentQuotation(row); setShowFileDownloadModal(true); }}
        onManageClick={(row) => { setCurrentQuotation(row); setShowFileManageModal(true); }}
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
        handleClose={handleCloseAddModifyModal}
        product={currentQuotation}
        handleSubmit={handleQuotationSubmit}
        setProduct={setCurrentQuotation}
        config={quotationConfig}
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
        entity="quotations"
        entityId={currentQuotation.id}
        entityName={currentQuotation.quotation_number || "견적"}
      />

      <FileDownloadModal
        show={showFileDownloadModal}
        handleClose={() => setShowFileDownloadModal(false)}
        entity="quotations"
        entityId={currentQuotation.id}
        entityName={currentQuotation.quotation_number || "견적"}
      />
    </div>
  );
}

export default QuotationPage;
