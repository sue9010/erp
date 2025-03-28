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
  title: "주문",
  enableFile: true,
  fields: [
    { key: "po_number", label: "PO 번호", required: true },
    { key: "order_number", label: "접수 번호", required: true },
    { key: "vendor_name", label: "공급업체명", required: true },
    { key: "order_date", label: "주문일", type: "date", required: true },
    { key: "due_date", label: "납기일", type: "date", required: true },
    {
      key: "products",
      label: "제품 구성",
      type: "custom", // 테이블 + 옵션 UI
      required: true,
    },
    { key: "note", label: "비고" },
    { key: "status", label: "상태", default: "접수" },
  ],
  searchFields: ["po_number", "order_number", "vendor_name"],
  columns: [
    { key: "id", header: "ID", align: "center" },
    { key: "po_number", header: "PO 번호", align: "center" },
    { key: "order_number", header: "접수 번호", align: "center" },
    { key: "vendor_name", header: "공급업체", align: "center" },
    { key: "order_date", header: "주문일", align: "center" },
    { key: "due_date", header: "납기일", align: "center" },
    {
      key: "total_amount_ex_vat",
      header: "공급가액",
      align: "right",
      format: (v) => `${(v ?? 0).toLocaleString()}원`,
    },
    {
      key: "total_amount_inc_vat",
      header: "총액(VAT)",
      align: "right",
      format: (v) => `${(v ?? 0).toLocaleString()}원`,
    },
    { key: "status", header: "상태", align: "center" },
  ],
};


export const quotationConfig = {
  title: "견적 목록",
  enableFile: true,
  fields: [
    { key: 'quotation_number', label: '견적 번호', required: true },
    { key: 'customer_name', label: '고객사', required: true },
    { key: 'quotation_date', label: '견적일', type: 'date', required: true },
    { key: 'due_date', label: '납기일', type: 'date', required: true },
    {
      key: 'products',
      label: '제품 구성',
      type: 'custom', // 제품 + 옵션 + 단가 테이블 UI
      required: true
    },
    { key: 'note', label: '비고' },
    { key: 'status', label: '상태', default: '작성중' }
  ],
  searchFields: ['quotation_number', 'customer_name', 'note', 'status'],
  columns: [
    { key: 'quotation_number', header: '견적 번호', align: 'center' },
    { key: 'customer_name', header: '고객사', align: 'center' },
    { key: 'quotation_date', header: '견적일', align: 'center' },
    { key: 'due_date', header: '납기일', align: 'center' },
    {
      key: 'total_amount_ex_vat',
      header: '공급가액',
      align: 'right',
      format: (v) => `${(v ?? 0).toLocaleString()}원`,
    },
    {
      key: 'total_amount_inc_vat',
      header: '총액(VAT)',
      align: 'right',
      format: (v) => `${(v ?? 0).toLocaleString()}원`,
    },
    { key: 'status', header: '상태', align: 'center' }
  ]
};


export const paymentConfig = {
  title: "입금 목록",
  enableFile: true,
  fields: [
    { key: "order_id", label: "주문 ID", type: "text" }, // ⬅ string + optional
    { key: "amount", label: "입금액", type: "number", required: true },
    { key: "date", label: "입금일", type: "date", required: true },
    { key: "depositor", label: "입금자", required: true },
    { key: "note", label: "비고" }
  ],
  searchFields: ["depositor", "note", "order_id"],
  columns: [
    { key: "id", header: "ID", align: "center" },
    { key: "order_id", header: "주문 ID", align: "center" },
    {
      key: "amount",
      header: "입금액",
      align: "right",
      format: (v) => `${(v ?? 0).toLocaleString()}원`,
    },
    { key: "date", header: "입금일", align: "center" },
    { key: "depositor", header: "입금자", align: "center" },
    { key: "note", header: "비고", align: "center" }
  ]
};

export const productionConfig = {
  title: "생산 목록",
  enableFile: true,
  fields: [
    {
      key: "order_number",
      label: "주문 번호",
      type: "text",
      required: true,
      fetchDependent: true // 주문 선택 시 제품 목록 자동 조회에 사용
    },
    {
      key: "scheduled_date",
      label: "생산 예정일",
      type: "date",
      required: true
    },
    {
      key: "items",
      label: "생산 제품 및 시리얼",
      type: "custom",
      required: true
    }
  ],
  searchFields: ["order_number"],
  columns: [
    { key: "id", header: "ID", align: "center" },
    { key: "order_number", header: "주문 번호", align: "center" },
    {
      key: "scheduled_date",
      header: "생산 예정일",
      align: "center"
    },
    {
      key: "items",
      header: "제품 수",
      align: "center",
      format: (items) => `${items?.length ?? 0}종`
    }
  ]
};
