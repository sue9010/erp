import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { inputFields } from '../api/config';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap 스타일 추가

export const ProductModal = ({ show, handleClose, product, handleSubmit, setProduct }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered
      backdrop="static"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{product.id ? '제품 수정' : '제품 등록'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {inputFields.map((field) => (
            <Form.Group key={field.name}>
              <Form.Label>{field.placeholder}</Form.Label>
              <Form.Control
                type={field.type}
                name={field.name}
                value={product[field.name] || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          취소
        </Button>
        <Button variant="primary" onClick={() => handleSubmit(product)}>
          {product.id ? '저장' : '등록'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
