import { requestClient } from '#/api/request';

export interface QuerySettlementRow {
  productId: string;
  productCode: string;
  productName: string;
  pricePo: number;
  priceAmt: number;
  qty: number | string;
  vendorName: string;
  uomName: string;
  baseUomName: string;
  insuranceCodeNo: string;
  productSpec: string;
}

export interface SavePrescriptionToPurchaseParams {
  startTime: string;
  endTime: string;
  productIds: string; // 产品iDs
  pricePos: string; // 价格ids
  warehouseId: string; // 采购仓库id
  targetWarehouseId: string; // 需求仓库id
}

// 处方转采购保存
export const savePrescriptionToPurchase = (
  params: SavePrescriptionToPurchaseParams,
) => {
  return requestClient.post<any>(
    'settlementAction/createPMSSettlement',
    params,
  );
};
