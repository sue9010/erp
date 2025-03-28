import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup, Spinner } from "react-bootstrap";
import {
  fetchFiles,
  downloadFile,
  downloadAllFiles,
} from "../api/fileApi";

const FileDownloadModal = ({ entity = "vendors", entityId, entityName, show, handleClose }) => {
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
      const data = await fetchFiles(entity, entityId);
      setFileList(data);
    } catch (err) {
      console.error("파일 목록 불러오기 실패:", err);
      alert("파일 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const blob = await downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = originalName;
      link.click();
    } catch (err) {
      console.error("다운로드 실패:", err);
      alert("다운로드에 실패했습니다.");
    }
  };

  const handleDownloadAll = async () => {
    try {
      const blob = await downloadAllFiles(entity, entityId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${entityName}_첨부파일.zip`;
      link.click();
    } catch (err) {
      console.error("전체 다운로드 실패:", err);
      alert("전체 다운로드에 실패했습니다.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📁 {entityName} 파일 다운로드</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" /> 파일 목록 불러오는 중...
          </div>
        ) : fileList.length === 0 ? (
          <p>업로드된 파일이 없습니다.</p>
        ) : (
          <ListGroup>
            {fileList.map((file) => (
              <ListGroup.Item
                key={file.file_id}
                className="d-flex justify-content-between align-items-center"
              >
                {file.original_name}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleDownload(file.file_id, file.original_name)}
                >
                  다운로드
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        {fileList.length > 0 && (
          <Button variant="success" onClick={handleDownloadAll}>
            전체 다운로드 (ZIP)
          </Button>
        )}
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileDownloadModal;
