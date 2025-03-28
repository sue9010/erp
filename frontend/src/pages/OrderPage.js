// src/pages/OrderPage.js
import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { AddModifyModal } from "../modals/AddModifyModal";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import FileUploadModal from "../modals/FileUploadModal";
import FileManageModal from "../modals/FileManageModal";
import FileDownloadModal from "../modals/FileDownloadModal";
import { DataTable } from "../components/DataTable";
import { useOrderManagement } from "../hooks/useOrderManagement";
import { orderConfig } from "../api/config";
import { uploadFile } from "../api/fileApi";

function OrderPage() {
  const [showAddModifyModal, setShowAddModifyModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showFileManageModal, setShowFileManageModal] = useState(false);
  const [showFileDownloadModal, setShowFileDownloadModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    orders,
    handleDelete,
    handleOrderSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  } = useOrderManagement();

  const flattenedOrders = useMemo(() => {
    const rows = [];
    let rowIndex = 0;
    orders.forEach((order) => {
      order.products?.forEach((product, pIndex) => {
        rows.push({
          row_id: `order-${order.id}-product-${pIndex}`,
          ...order,
          category: product.category,
          name: product.name,
          is_option: false,
          quantity: product.quantity,
          unit_price: product.unit_price,
          total_price: product.quantity * product.unit_price,
        });
        product.options?.forEach((opt, oIndex) => {
          rows.push({
            row_id: `order-${order.id}-product-${pIndex}-option-${oIndex}`,
            ...order,
            category: opt.category,
            name: opt.name,
            is_option: true,
            quantity: opt.quantity,
            unit_price: opt.unit_price,
            total_price: opt.quantity * opt.unit_price,
          });
        });
      });
    });
  
    return rows
      .filter((row) =>
        orderConfig.searchFields.some((field) =>
          row[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => b.id - a.id);
  }, [orders, searchTerm]);
  

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return flattenedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [flattenedOrders, currentPage]);

  const totalPages = Math.ceil(flattenedOrders.length / itemsPerPage);

  const handleOpenAddModifyModal = (order = null) => {
    const defaultOrder = orderConfig.fields.reduce((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    setCurrentOrder(order || defaultOrder);
    setShowAddModifyModal(true);
  };

  const handleCloseAddModifyModal = () => {
    setShowAddModifyModal(false);
  };

  const handleUploadFiles = async (files) => {
    for (const file of files) {
      await uploadFile("orders", currentOrder.id, file);
    }
    alert("파일 업로드가 완료되었습니다.");
    setShowFileUploadModal(false);
  };

  return (
    <div>
      <h2>{orderConfig.title}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder={`검색 (${orderConfig.searchFields.join(", ")})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenAddModifyModal()}>
          주문 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
        <Button variant="success" onClick={() => downloadExcel(flattenedOrders)}>
          엑셀로 다운로드
        </Button>
      </ButtonGroup>

      <DataTable
        data={paginatedOrders}
        config={{ ...orderConfig, enableFile: true }}
        onEdit={handleOpenAddModifyModal}
        onDelete={handleDelete}
        onUploadClick={(row) => { setCurrentOrder(row); setShowFileUploadModal(true); }}
        onDownloadClick={(row) => { setCurrentOrder(row); setShowFileDownloadModal(true); }}
        onManageClick={(row) => { setCurrentOrder(row); setShowFileManageModal(true); }}
        keyField="row_id" // ✅ 이거 추가!
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
        product={currentOrder}
        handleSubmit={handleOrderSubmit}
        setProduct={setCurrentOrder}
        config={orderConfig}
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
        entity="orders"
        entityId={currentOrder.id}
        entityName={currentOrder.order_number || "주문"}
      />

      <FileDownloadModal
        show={showFileDownloadModal}
        handleClose={() => setShowFileDownloadModal(false)}
        entity="orders"
        entityId={currentOrder.id}
        entityName={currentOrder.order_number || "주문"}
      />
    </div>
  );
}

export default OrderPage;