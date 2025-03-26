import React, { useState, useMemo } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
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
  const [searchTerm, setSearchTerm] = useState("");

  const {
    products,
    handleDelete,
    handleProductSubmit,
    handleExcelUpload,
    uploadError,
    fileInputRef,
  } = useProductManagement();

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.note.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

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
      
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="검색 (품목명, 제품명, 제조사, 비고)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <ButtonGroup>
        <Button variant="primary" onClick={() => handleOpenProductModal()}>
          제품 등록
        </Button>
        <Button variant="secondary" onClick={() => setShowExcelModal(true)}>
          엑셀로 일괄 등록
        </Button>
      </ButtonGroup>

      <ProductTable
        products={filteredProducts}
        onEdit={handleOpenProductModal}
        onDelete={handleDelete}
      />

      <ProductModal
        show={showProductModal}
        handleClose={handleCloseProductModal}
        product={currentProduct}
        handleSubmit={handleProductSubmit}
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
