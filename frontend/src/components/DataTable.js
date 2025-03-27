import React from 'react';
import { Table, Button } from 'react-bootstrap';

export const DataTable = ({ data, config, onEdit, onDelete }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {config.columns.map((col) => (
            <th key={col.key} style={{ textAlign: col.align || 'left' }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const rowKey = item.id || `${item.name}-${index}`;
          return (
            <tr key={rowKey}>
              {config.columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.format ? col.format(item[col.key]) : item[col.key]}
                </td>
              ))}
              <td style={{ textAlign: 'center' }}>
                <Button variant="info" size="sm" onClick={() => onEdit(item)} className="me-2">
                  수정
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(item.id)}>
                  삭제
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
