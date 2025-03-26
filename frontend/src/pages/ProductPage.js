import React, { useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { ProductModal } from "../modals/ProductModal";
import { ExcelUploadModal } from "../modals/ExcelUploadModal";
import { ProductTable } from "../tables/ProductTable";
import { useProductManagement } from "../hooks/useProductManagement";

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

  const {
    products,
    handleDelete,
    handleProductSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
  } = useProductManagement();

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
      <div><br/></div>
      <ProductTable
        products={products}
        onEdit={handleOpenProductModal}
        onDelete={handleDelete}
      />

      <ProductModal
        show={showProductModal}
        handleClose={handleCloseProductModal}
        product={currentProduct}
        handleSubmit={(product) => {
          handleProductSubmit(product);
          handleCloseProductModal();
        }}
        setProduct={setCurrentProduct}
      />

      <ExcelUploadModal
        show={showExcelModal}
        handleClose={() => setShowExcelModal(false)}
        handleUpload={handleExcelUpload}
        uploadError={uploadError}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}

export default ProductPage;
