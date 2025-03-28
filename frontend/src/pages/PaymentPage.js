// src/pages/PaymentPage.js
import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { AddModifyModal } from "../modals/AddModifyModal";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import FileUploadModal from "../modals/FileUploadModal";
import FileManageModal from "../modals/FileManageModal";
import FileDownloadModal from "../modals/FileDownloadModal";
import { DataTable } from "../components/DataTable";
import { usePaymentManagement } from "../hooks/usePaymentManagement";
import { paymentConfig } from "../api/config";
import { uploadFile } from "../api/fileApi";

function PaymentPage() {
  const [showAddModifyModal, setShowAddModifyModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showFileManageModal, setShowFileManageModal] = useState(false);
  const [showFileDownloadModal, setShowFileDownloadModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    payments,
    handleDelete,
    handlePaymentSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  } = usePaymentManagement();

  const filteredPayments = useMemo(() => {
    const filtered = payments.filter((p) =>
      paymentConfig.searchFields.some((field) =>
        p[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    return filtered.sort((a, b) => b.id - a.id);
  }, [payments, searchTerm]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handleOpenAddModifyModal = (payment = null) => {
    const defaultPayment = paymentConfig.fields.reduce((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    setCurrentPayment(payment || defaultPayment);
    setShowAddModifyModal(true);
  };

  const handleCloseAddModifyModal = () => {
    setShowAddModifyModal(false);
  };

  const handleUploadFiles = async (files) => {
    for (const file of files) {
      await uploadFile("payments", currentPayment.id, file);
    }
    alert("파일 업로드가 완료되었습니다.");
    setShowFileUploadModal(false);
  };

  return (
    <div>
      <h2>{paymentConfig.title}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder={`검색 (${paymentConfig.searchFields.join(", ")})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenAddModifyModal()}>
          입금 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
        <Button variant="success" onClick={() => downloadExcel(filteredPayments)}>
          엑셀로 다운로드
        </Button>
      </ButtonGroup>

      <DataTable
        data={paginatedPayments}
        config={{ ...paymentConfig, enableFile: true }}
        onEdit={handleOpenAddModifyModal}
        onDelete={handleDelete}
        onUploadClick={(row) => { setCurrentPayment(row); setShowFileUploadModal(true); }}
        onDownloadClick={(row) => { setCurrentPayment(row); setShowFileDownloadModal(true); }}
        onManageClick={(row) => { setCurrentPayment(row); setShowFileManageModal(true); }}
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
        product={currentPayment}
        handleSubmit={handlePaymentSubmit}
        setProduct={setCurrentPayment}
        config={paymentConfig}
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
        entity="payments"
        entityId={currentPayment.id}
        entityName={`입금-${currentPayment.id}`}
      />

      <FileDownloadModal
        show={showFileDownloadModal}
        handleClose={() => setShowFileDownloadModal(false)}
        entity="payments"
        entityId={currentPayment.id}
        entityName={`입금-${currentPayment.id}`}
      />
    </div>
  );
}

export default PaymentPage;
