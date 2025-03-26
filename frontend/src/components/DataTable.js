// src/components/DataTable.js

import React from 'react';
import { Table, Button } from 'react-bootstrap';

export const DataTable = ({ data, config, onEdit, onDelete }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {config.fields.map((field) => (
            <th key={field.key}>{field.label}</th>
          ))}
          <th>작업</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {config.fields.map((field) => (
              <td key={field.key}>{item[field.key]}</td>
            ))}
            <td>
              <Button variant="info" onClick={() => onEdit(item)}>수정</Button>
              <Button variant="danger" onClick={() => onDelete(item.id)}>삭제</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
