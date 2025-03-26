// src/api/config.js

export const API_BASE = 'http://localhost:8000';

export const inputFields = [
  { name: "category", type: "text", placeholder: "품목명" },
  { name: "name", type: "text", placeholder: "제품명" },
  { name: "manufacturer", type: "text", placeholder: "제조사" },
  { name: "price", type: "number", placeholder: "가격" },
  { name: "stock", type: "number", placeholder: "재고" },
  { name: "note", type: "text", placeholder: "비고" },
];

export const columns = [
  { key: 'category', header: '품목명', align: 'center' },
  { key: 'name', header: '제품명', align: 'center' },
  { key: 'manufacturer', header: '제조사', align: 'center' },
  { key: 'price', header: '가격', format: (value) => `${(value ?? 0).toLocaleString()}원`, align: 'right' },
  { key: 'stock', header: '재고', format: (value) => `${(value ?? 0).toLocaleString()}개`, align: 'right' },
  { key: 'note', header: '비고', align: 'center' },
  { key: 'edit', header: '수정', align: 'center' },
  { key: 'delete', header: '삭제', align: 'center' }
];
