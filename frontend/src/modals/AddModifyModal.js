import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import axios from "axios";
import { API_BASE } from "../api/config";
import { v4 as uuidv4 } from 'uuid';

export const AddModifyModal = ({
  show,
  handleClose,
  product,
  handleSubmit,
  setProduct,
  config,
  fetchOrderItems,
}) => {
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/products`).then((res) => {
      setProductList(res.data);
    });
  }, []);

  const allCategories = [...new Set(productList.map((p) => p.category))];
  const allNames = [...new Set(productList.map((p) => p.name))];

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    const field = config.fields.find((f) => f.key === name);
    if (field?.fetchDependent && fetchOrderItems) {
      const orderProducts = await fetchOrderItems(value);
      const items = orderProducts.map((p) => ({
        product_name: p.product_name || `[${p.category}] ${p.name}`,
        serial_numbers: [],
      }));
      setProduct((prev) => ({ ...prev, items }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(product);
      handleClose();
    } catch (error) {
      console.error("저장 실패:", error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert("생산 수정 중 오류가 발생했습니다.");
      }
      return;
    }
  };

  const updateProducts = (updatedProducts) => {
    const total = updatedProducts.reduce((sum, p) => {
      const prodTotal = (p.quantity || 0) * (p.unit_price || 0);
      const optTotal = (p.options || []).reduce(
        (s, o) => s + (o.quantity || 0) * (o.unit_price || 0),
        0
      );
      return sum + prodTotal + optTotal;
    }, 0);

    setProduct((prev) => ({
      ...prev,
      products: updatedProducts,
      total_amount_ex_vat: total,
      total_amount_inc_vat: Math.round(total * 1.1),
    }));
  };

  const addProduct = () => {
    updateProducts([
      ...(product.products || []),
      { category: "", name: "", quantity: 1, unit_price: 0, options: [] },
    ]);
  };

  const deleteProduct = (index) => {
    const updated = [...(product.products || [])];
    updated.splice(index, 1);
    updateProducts(updated);
  };

  const updateProductField = (index, key, value) => {
    const updated = [...(product.products || [])];
    updated[index][key] =
      key === "quantity" || key === "unit_price" ? parseFloat(value) : value;
    updateProducts(updated);
  };

  const addOption = (productIndex) => {
    const updated = [...(product.products || [])];
    const options = updated[productIndex].options || [];
    options.push({ category: "", name: "", quantity: 1, unit_price: 0 });
    updated[productIndex].options = options;
    updateProducts(updated);
  };

  const updateOptionField = (productIndex, optionIndex, key, value) => {
    const updated = [...(product.products || [])];
    updated[productIndex].options[optionIndex][key] =
      key === "quantity" || key === "unit_price" ? parseFloat(value) : value;
    updateProducts(updated);
  };

  const deleteOption = (productIndex, optionIndex) => {
    const updated = [...(product.products || [])];
    updated[productIndex].options.splice(optionIndex, 1);
    updateProducts(updated);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{product.id ? `${config.title} 수정` : `${config.title} 등록`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {config.fields.map((field) => {
            if (field.type === "custom" && field.key === "items") {
              return (
                <div key="items" className="mt-3">
                  <h5>📦 생산 제품별 시리얼 번호 입력</h5>
                  {product.items?.map(() => (
                    <Form.Group key={`serial-${uuidv4()}`} className="mb-3">
                      <Form.Label>제품명</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="쉼표 또는 줄바꿈으로 여러 개 입력 가능"
                      />
                    </Form.Group>
                  ))}
                </div>
              );
            }

            if (field.type === "custom" && field.key === "products") {
              return (
                <div key="products" className="mt-3">
                  <h5>🧾 제품 구성</h5>
                  {(product.products || []).map((prod, i) => (
                    <div key={`product-${uuidv4()}`} className="mb-3 border rounded p-2">
                      <Row className="mb-2 align-items-center">
                        <Col>
                          <Typeahead
                            id={`category-${uuidv4()}`}
                            options={allCategories}
                            onChange={(selected) =>
                              updateProductField(i, "category", selected[0] || "")
                            }
                            selected={prod.category ? [prod.category] : []}
                            placeholder="카테고리 입력"
                          />
                        </Col>
                        <Col>
                          <Typeahead
                            id={`name-${uuidv4()}`}
                            options={prod.category ? productList.filter(p => p.category === prod.category).map(p => p.name) : allNames}
                            onChange={(selected) =>
                              updateProductField(i, "name", selected[0] || "")
                            }
                            selected={prod.name ? [prod.name] : []}
                            placeholder="제품명 입력"
                          />
                        </Col>
                        <Col xs={2}>
                          <Form.Control
                            type="number"
                            placeholder="수량"
                            value={prod.quantity}
                            onChange={(e) => updateProductField(i, "quantity", e.target.value)}
                            required
                          />
                        </Col>
                        <Col xs={3}>
                          <Form.Control
                            type="number"
                            placeholder="단가"
                            value={prod.unit_price}
                            onChange={(e) => updateProductField(i, "unit_price", e.target.value)}
                            required
                          />
                        </Col>
                        <Col xs="auto">
                          <Button variant="outline-secondary" size="sm" onClick={() => addOption(i)}>
                            + 옵션
                          </Button>
                        </Col>
                        <Col xs="auto">
                          <Button variant="outline-danger" size="sm" onClick={() => deleteProduct(i)}>
                            🗑️
                          </Button>
                        </Col>
                      </Row>
                      {prod.options?.map((opt, j) => (
                        <Row key={`opt-${uuidv4()}`} className="mb-1 ps-4 align-items-center">
                          <Col>
                            <Typeahead
                              id={`opt-category-${uuidv4()}`}
                              options={allCategories}
                              onChange={(selected) =>
                                updateOptionField(i, j, "category", selected[0] || "")
                              }
                              selected={opt.category ? [opt.category] : []}
                              placeholder="옵션 카테고리 입력"
                            />
                          </Col>
                          <Col>
                            <Typeahead
                              id={`opt-name-${uuidv4()}`}
                              options={opt.category ? productList.filter(p => p.category === opt.category).map(p => p.name) : allNames}
                              onChange={(selected) =>
                                updateOptionField(i, j, "name", selected[0] || "")
                              }
                              selected={opt.name ? [opt.name] : []}
                              placeholder="옵션명 입력"
                            />
                          </Col>
                          <Col xs={2}>
                            <Form.Control
                              type="number"
                              placeholder="수량"
                              value={opt.quantity}
                              onChange={(e) => updateOptionField(i, j, "quantity", e.target.value)}
                              required
                            />
                          </Col>
                          <Col xs={3}>
                            <Form.Control
                              type="number"
                              placeholder="단가"
                              value={opt.unit_price}
                              onChange={(e) => updateOptionField(i, j, "unit_price", e.target.value)}
                              required
                            />
                          </Col>
                          <Col xs="auto">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteOption(i, j)}
                            >
                              🗑️
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  ))}
                  <Button variant="outline-primary" size="sm" onClick={addProduct}>
                    + 제품 추가
                  </Button>

                  <div className="mt-3 text-end fw-bold">
                    <div>공급가액: {product.total_amount_ex_vat?.toLocaleString() || 0} 원</div>
                    <div>총액(VAT포함): {product.total_amount_inc_vat?.toLocaleString() || 0} 원</div>
                  </div>
                </div>
              );
            }

            return (
              <Form.Group key={field.key} className="mb-3">
                <Form.Label>{field.label}</Form.Label>
                <Form.Control
                  type={field.type || "text"}
                  name={field.key}
                  value={product[field.key] || ""}
                  onChange={handleChange}
                  required={field.required}
                />
              </Form.Group>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" type="submit">
            {product.id ? "저장" : "등록"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
