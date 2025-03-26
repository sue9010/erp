import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { productConfig, vendorConfig } from '../api/config';
import 'bootstrap/dist/css/bootstrap.min.css';

export const AddModifyModal = ({ show, handleClose, product, handleSubmit, setProduct, modalType }) => {
  const config = modalType === 'vendor' ? vendorConfig : productConfig;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    if (e) {
      e.preventDefault(); // 기본 제출 동작 방지
    }
    try {
      await handleSubmit(product);
      handleClose();
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{product.id ? `${config.title} 수정` : `${config.title} 등록`}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {config.fields.map((field) => (
            <Form.Group key={field.key}>
              <Form.Label>{field.label}</Form.Label>
              <Form.Control
                type={field.type || 'text'}
                name={field.key}
                value={product[field.key] || ''}
                onChange={handleChange}
                required={field.required}
              />
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" type="submit">
            {product.id ? '저장' : '등록'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
