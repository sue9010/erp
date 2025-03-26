import React, { useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export const ExcelUploadModal = ({ show, handleClose, handleUpload }) => {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = () => {
    setUploadError("");
  };

  const handleFileUpload = () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      setUploadError("파일을 선택해주세요.");
      return;
    }
    handleUpload(file, handleClose);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>엑셀 일괄 등록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>엑셀 파일 선택</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {uploadError && <div style={{ color: 'red', marginTop: '10px' }}>{uploadError}</div>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={handleFileUpload}>
          업로드
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
