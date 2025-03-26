// src/tables/ProductTable.js
import React from 'react';
import { columns } from '../api/config';

export const ProductTable = ({ products, onEdit, onDelete }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        {columns.map(column => (
          <th key={column.key} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {products.map((product) => (
        <tr key={product.id}>
          {columns.map(column => {
            if (column.key === 'edit') {
              return (
                <td key={column.key} style={{ border: '1px solid black', padding: '8px', textAlign: column.align }}>
                  <button onClick={() => onEdit(product)}>수정</button>
                </td>
              );
            }
            if (column.key === 'delete') {
              return (
                <td key={column.key} style={{ border: '1px solid black', padding: '8px', textAlign: column.align }}>
                  <button onClick={() => onDelete(product.id)}>삭제</button>
                </td>
              );
            }
            return (
              <td key={column.key} style={{ border: '1px solid black', padding: '8px', textAlign: column.align }}>
                {column.format ? column.format(product[column.key]) : product[column.key]}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
);
