import { requestFormClient } from '#/api/request';

export interface InvoiceTableRow {
  DateArrived: string;
  DeliveryNo: string;
  IsSerNo: 'N' | 'Y';
  applyBPartnerId: number;
  asnId: string;
  asnLineId: number;
  asnStatusName: string;
  bpartnerId: number;
  checkTime: string;
  checkerName: string;
  created: string;
  description: string;
  discountLineAmt: string;
  discountPrice: string;
  discountRate: string;
  guaranteeDate: string;
  invoiceMethod: string;
  isCrossDocking: 'N' | 'Y';
  isStoragePackage: 'N' | 'Y';
  lPackageQty: string;
  lineAmt: number;
  lineStatus: string;
  lineStatusName: string;
  lot: string;
  mAsnId: string;
  mInoutId: string;
  mPackageQty: string;
  manufacturer: string;
  modelNo: string;
  packageArrived: string;
  priceActual: number;
  priceList: number;
  productCode: string;
  productId: number;
  productName: string;
  productSpec: string;
  productionDate: string;
  qtyArrived: number;
  qtyChecked: string;
  qtyInvoiced: number;
  qtyOnhand: number;
  qtyReceived: number;
  qtyRejected: number;
  receiptType: string;
  receiptTypeName: string;
  serNo: string;
  serNoCount: number;
  taxInvoiceDate: string;
  taxInvoiceNo: string;
  uomId: string;
  uomName: string;
  warehouseId: number;
  warehouseName: string;
  [key: string]: any;
}

// 创建发票入参
export interface CreateInvoiceSubmitRequest {
  bpartnerId: string; // 供应商
  warehouseId?: string; // 仓库
  invoiceNo: string; // 发票号
  invoiceTypeNo: string; // 发票编码
  dateInvoiced: string; // 发票日期
  invoiceAmt: number; // 开票金额
  invoiceImageBase64: string; // 发票图片base64
  lineData: string;
}

// 创建发票提交接口
export const createInvoiceSubmit = (data: CreateInvoiceSubmitRequest) => {
  return requestFormClient.post<any>('/invoiceAction/save', data);
};
