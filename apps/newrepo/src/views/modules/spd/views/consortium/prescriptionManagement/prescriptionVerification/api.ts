import { requestClient } from '#/api/request';

export interface SavePrescriptionToPurchaseParams {
  prescriptionId: number;
  preStatus: string; // 1:已发送 -1: 关闭
  lineList: Array<{ prescriptionLineId: string; vendorId: string }>;
  closeReason?: string;
}

// 保存|关闭
export const savePrescriptionToPurchase = (
  params: SavePrescriptionToPurchaseParams,
) => {
  return requestClient.post<any>('prescriptionAction/savePreStatus', params);
};

// 供应商项
export interface VendorItem {
  name: string;
  productId: string;
  vendorId: string;
}

// 处方行项
export interface QueryLineRow {
  description: string;
  freqCounter: string;
  freqCounterName: string;
  lineAmt: number;
  lineNum: string;
  manufacturer: string;
  medDays: string;
  medPerDos: string;
  prescriptionId: number;
  prescriptionLineId: number;
  price: number;
  productCode: string;
  productId: number;
  productName: string;
  productSpec: string;
  qty: number;
  qtyBack: number;
  qtyBacked: number;
  qtyDelivery: number;
  uomName: string;
  usageDescCode: string;
  usageDescCodeName: string;
  vendorId: string;
  vendorList: VendorItem[];
  [key: string]: any;
}
