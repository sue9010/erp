import React from 'react';
import { Table, Button } from 'react-bootstrap';

export const DataTable = ({
  data,
  config,
  onEdit,
  onDelete,
  onUploadClick,
  onDownloadClick,
  onManageClick
}) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {config.columns.map((col, colIndex) => {
            const thKey = `${String(col.key)}-${colIndex}`;
            // console.log('TH key:', thKey);
            return (
              <th key={thKey} style={{ textAlign: col.align || "left" }}>
                {col.header}
              </th>
            );
          })}
          <th style={{ textAlign: "center" }}>작업</th>
          {config.enableFile && <th style={{ textAlign: "center" }}>파일</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => {
          const rowKey =
            (config.keyField && item[config.keyField]) ??
            `fallback-${item.id ?? 'unknown'}-${rowIndex}`;
          

          // console.log('ROW key:', rowKey);

          return (
            <tr key={rowKey}>
              {config.columns.map((col, colIndex) => {
                const tdKey = `${String(col.key)}-${colIndex}`;
                // console.log('TD key:', tdKey, 'Value:', item[col.key]);
                return (
                  <td key={tdKey} style={{ textAlign: col.align || "left" }}>
                    {col.format ? col.format(item[col.key]) : item[col.key]}
                  </td>
                );
              })}

              <td style={{ textAlign: "center" }}>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(item)}
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  삭제
                </Button>
              </td>

              {config.enableFile && (
                <td style={{ textAlign: "center" }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="me-1"
                    onClick={() => onUploadClick(item)}
                  >
                    업로드
                  </Button>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    className="me-1"
                    onClick={() => onDownloadClick(item)}
                  >
                    다운로드
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onManageClick(item)}
                  >
                    관리
                  </Button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
