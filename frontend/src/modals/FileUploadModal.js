import React, { useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const FileUploadModal = ({ show, handleClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = () => {
    if (selectedFiles.length && onUpload) {
      onUpload(selectedFiles); // ✅ 한 번에 배열로 전달
      setSelectedFiles([]);
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>📤 파일 업로드</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {selectedFiles.length > 0 && (
          <ul className="mt-2">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>취소</Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0}
        >
          업로드 ({selectedFiles.length}개)
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUploadModal;
