import React, { useState } from "react";
import { Button, ButtonGroup } from 'react-bootstrap';
import { ProductModal } from '../modals/ProductModal';
import { ExcelUploadModal } from '../modals/ExcelUploadModal';
import { ProductTable } from '../tables/ProductTable';
import { useProductManagement } from '../hooks/useProductManagement';

function ProductPage() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    category: "",
    name: "",
    manufacturer: "",
    price: "",
    stock: "",
    note: "",
  });

  const { products, handleDelete, handleProductSubmit } = useProductManagement();

  const handleOpenProductModal = (product = null) => {
    setCurrentProduct(product || {
      category: "",
      name: "",
      manufacturer: "",
      price: "",
      stock: "",
      note: "",
    });
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
  };

  return (
    <div>
      <h2>📦 제품 목록</h2>
      
      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenProductModal()}>
          제품 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
      </ButtonGroup>

      <ProductTable
        products={products}
        onEdit={handleOpenProductModal}
        onDelete={handleDelete}
      />

      {/* 제품 등록/수정 모달 */}
      <ProductModal
        show={showProductModal}
        handleClose={handleCloseProductModal}
        product={currentProduct}
        handleSubmit={handleProductSubmit}
        setProduct={setCurrentProduct}
      />

      {/* 엑셀 업로드 모달 */}
      <ExcelUploadModal
        show={showExcelModal}
        handleClose={() => setShowExcelModal(false)}
      />
    </div>
  );
}

export default ProductPage;
