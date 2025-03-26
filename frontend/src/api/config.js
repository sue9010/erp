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

export const productConfig = {
  title: "제품 목록",
  fields: [
    { key: 'category', label: '품목명' },
    { key: 'name', label: '제품명' },
    { key: 'manufacturer', label: '제조사' },
    { key: 'price', label: '가격' },
    { key: 'stock', label: '재고' },
    { key: 'note', label: '비고' }
  ],
  searchFields: ['category', 'name', 'manufacturer', 'note']
};

export const vendorConfig = {
  title: "공급업체 목록",
  fields: [
    { key: 'company_name', label: '업체명', required: true },
    { key: 'contact_person', label: '담당자명', required: true },
    { key: 'contact', label: '연락처', required: true },
    { key: 'country', label: '국가', required: true },
    { key: 'address', label: '주소', required: true },
    { key: 'note', label: '비고', required: false }
  ],
  searchFields: ['company_name', 'contact_person','contact','country', 'address', 'note'],
  excelTemplate: {
    headers: ["업체명","담당자명", "연락처","국가", "주소", "비고"],
    sampleData: [
      ["공급업체 A","David", "010-1234-5678","대한민국", "서울시 강남구", "우수 공급업체"],
      ["공급업체 B", "Kim","010-9876-5432","미국", "부산시 해운대구", ""]
    ]
  }
};
