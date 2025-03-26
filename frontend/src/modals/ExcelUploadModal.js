// src/modals/ExcelUploadModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export const ExcelUploadModal = ({ show, handleClose,...props }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>엑셀 일괄 등록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* 엑셀 업로드 관련 컨텐츠 */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={handleClose}>
          업로드
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
