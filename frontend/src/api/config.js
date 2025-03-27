// src/api/config.js

export const API_BASE = 'http://localhost:8000';

export const productConfig = {
  title: "제품 목록",
  fields: [
    { key: "category", label: "품목명", type: "text", placeholder: "품목명" },
    { key: "name", label: "제품명", type: "text", placeholder: "제품명" },
    { key: "manufacturer", label: "제조사", type: "text", placeholder: "제조사" },
    { key: "price", label: "가격", type: "number", placeholder: "가격" },
    { key: "stock", label: "재고", type: "number", placeholder: "재고" },
    { key: "note", label: "비고", type: "text", placeholder: "비고" }
  ],
  searchFields: ["category", "name", "manufacturer", "note"],
  columns: [
    { key: "category", header: "품목명", align: "center" },
    { key: "name", header: "제품명", align: "center" },
    { key: "manufacturer", header: "제조사", align: "center" },
    { key: "price", header: "가격", format: (value) => `${(value ?? 0).toLocaleString()}원`, align: "right" },
    { key: "stock", header: "재고", format: (value) => `${(value ?? 0).toLocaleString()}개`, align: "right" },
    { key: "note", header: "비고", align: "center" },
  ]
};

export const vendorConfig = {
  title: "공급업체 목록",
  fields: [
    { key: 'company_name', label: '업체명', type: 'text', required: true },
    { key: 'contact_person', label: '담당자명', type: 'text', required: true },
    { key: 'contact', label: '연락처', type: 'text', required: true },
    { key: 'country', label: '국가', type: 'text', required: true },
    { key: 'address', label: '주소', type: 'text', required: true },
    { key: 'export_license_required', label: '수출허가필요여부', type: 'text', required: false },
    { key: 'export_license_type', label: '수출허가구분', type: 'text', required: false },
    { key: 'export_license_number', label: '수출허가번호', type: 'text', required: false },
    { key: 'shipping_method', label: '운송방법', type: 'text', required: false },
    { key: 'shipping_account', label: '운송계정', type: 'text', required: false },
    { key: 'note', label: '비고', type: 'text', required: false }
  ],
  searchFields: [
    'company_name', 'contact_person', 'contact', 'country', 'address',
    'export_license_required', 'export_license_type', 'export_license_number',
    'shipping_method', 'shipping_account', 'note'
  ],
  columns: [
    { key: 'company_name', header: '업체명', align: 'center' },
    { key: 'contact_person', header: '담당자명', align: 'center' },
    { key: 'contact', header: '연락처', align: 'center' },
    { key: 'country', header: '국가', align: 'center' },
    { key: 'address', header: '주소', align: 'center' },
    { key: 'export_license_required', header: '수출허가필요여부', align: 'center' },
    { key: 'export_license_type', header: '수출허가구분', align: 'center' },
    { key: 'export_license_number', header: '수출허가번호', align: 'center' },
    { key: 'shipping_method', header: '운송방법', align: 'center' },
    { key: 'shipping_account', header: '운송계정', align: 'center' },
    { key: 'note', header: '비고', align: 'center' },
  ]
};

export const orderConfig = {
  title: "주문 목록",
  enableFile: true,
  fields: [
    { key: 'po_number', label: '발주 번호', required: true },
    { key: 'order_number', label: '접수 번호', required: true },
    { key: 'vendor_name', label: '고객사', required: true },
    { key: 'order_date', label: '주문 날짜', type: 'date', required: true },
    { key: 'due_date', label: '납기일', type: 'date', required: true },
    { key: 'total_amount_ex_vat', label: '총 금액(VAT 미포함)', type: 'number', required: true },
    { key: 'total_amount_inc_vat', label: '총 금액(VAT 포함)', type: 'number', required: true },
    { key: 'note', label: '비고' },
    { key: 'status', label: '상태' }
  ],
  searchFields: ['order_number', 'vendor_name', 'note', 'status'],
  columns: [
    { key: 'order_number', header: '접수 번호', align: 'center' },
    { key: 'vendor_name', header: '고객사', align: 'center' },
    { key: 'order_date', header: '주문일', align: 'center' },
    { key: 'due_date', header: '납기일', align: 'center' },
    {
      key: 'total_amount_inc_vat',
      header: '총 금액(VAT 포함)',
      align: 'right',
      format: (v) => `${(v ?? 0).toLocaleString()}원`,
    },
    { key: 'status', header: '상태', align: 'center' }
  ]
};
