import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup, Spinner } from "react-bootstrap";
import api from "../api/axiosConfig";

const FileManageModal = ({ entity = "vendors", entityId, entityName, show, handleClose }) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && entityId) {
      fetchFileList();
    }
  }, [show, entityId]);

  const fetchFileList = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/${entity}/${entityId}/files`);
      setFileList(response.data);
    } catch (err) {
      console.error("파일 목록 불러오기 실패:", err);
      alert("파일 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("정말 이 파일을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/files/${fileId}`);
      setFileList((prev) => prev.filter((f) => f.file_id !== fileId));
    } catch (err) {
      console.error("파일 삭제 실패:", err);
      alert("파일 삭제에 실패했습니다.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📂 {entityName} 파일 관리</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" /> 파일 목록 불러오는 중...
          </div>
        ) : fileList.length === 0 ? (
          <p>등록된 파일이 없습니다.</p>
        ) : (
          <ListGroup>
            {fileList.map((file) => (
              <ListGroup.Item
                key={file.file_id}
                className="d-flex justify-content-between align-items-center"
              >
                {file.original_name}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(file.file_id)}
                >
                  삭제
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileManageModal;