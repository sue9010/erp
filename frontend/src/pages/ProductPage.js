// src/pages/ProductPage.js

import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { AddModifyModal } from "../modals/AddModifyModal";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import { DataTable } from "../components/DataTable";
import { useProductManagement } from "../hooks/useProductManagement";
import { productConfig } from "../api/config";

function ProductPage() {
  const [showAddModifyModal, setShowAddModifyModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    products,
    handleDelete,
    handleProductSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
    downloadExcel,
  } = useProductManagement();

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      productConfig.searchFields.some((field) =>
        product[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    // ✅ 정렬: 품목명 → 제품명 순 오름차순
    return filtered.sort((a, b) => {
      const categoryCompare = a.category.localeCompare(b.category);
      if (categoryCompare !== 0) return categoryCompare;
      return a.name.localeCompare(b.name);
    });
  }, [products, searchTerm]);
  
  

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleOpenAddModifyModal = (product = null) => {
    const defaultProduct = productConfig.fields.reduce((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    setCurrentProduct(product || defaultProduct);
    setShowAddModifyModal(true);
  };

  const handleCloseAddModifyModal = () => {
    setShowAddModifyModal(false);
  };

  return (
    <div>
      <h2>{productConfig.title}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder={`검색 (${productConfig.searchFields.join(", ")})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenAddModifyModal()}>
          제품 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
        <Button variant="success" onClick={() => downloadExcel(filteredProducts)}>
          엑셀로 다운로드
        </Button>
      </ButtonGroup>

      <DataTable
        data={paginatedProducts}
        config={productConfig}
        onEdit={handleOpenAddModifyModal}
        onDelete={handleDelete}
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
        product={currentProduct}
        handleSubmit={handleProductSubmit}
        setProduct={setCurrentProduct}
        modalType="product"
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

export default ProductPage;
