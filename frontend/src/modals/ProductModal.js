import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { inputFields } from '../api/config';
import 'bootstrap/dist/css/bootstrap.min.css';


export const ProductModal = ({ show, handleClose, product, handleSubmit, setProduct }) => {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
    setError(""); // 입력 시 에러 메시지 초기화
  };

  const onSubmit = async () => {
    try {
      await handleSubmit(product);
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered
      backdrop="static"
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
                isInvalid={!!error}
                required
              />
            </Form.Group>
          ))}
          {error && <div className="text-danger mt-2">{error}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          취소
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {product.id ? '저장' : '등록'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
