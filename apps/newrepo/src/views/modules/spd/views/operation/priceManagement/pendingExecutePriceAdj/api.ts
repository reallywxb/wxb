import { requestFormClient } from '#/api/request';

export interface ParentTableItem {
  adjType: string;
  adjTypeName: string;
  approveTime: string;
  completeTime: string;
  created: string;
  createdByName: string;
  docDate: string;
  docStatus: string;
  docStatusName: string;
  effectiveTime: string;
  priceListAdjId: string;
  productCount: string;
  sitePriceListAdjId: string;
  [key: string]: any;
}

export interface ChildTableItem {
  amountAdj: number;
  amountPOAdj: number;
  isFee: 'N' | 'Y';
  isPurchasePriceUnify: 'N' | 'Y';
  manufacturer: string;
  priceList: number;
  priceListNew: number;
  pricePO: number;
  pricePONew: number;
  productCode: string;
  productId: string;
  productName: string;
  productPriceListAdjId: string;
  productSpec: string;
  qtyAdj: number;
  siteProductPriceListAdjId: string;
  uomName: string;
  vendorAmountPOAdj: number;
  vendorQtyAdj: number;
}

// 审批
export const confirmPriceListAdj = (params: {
  priceListAdjId: number | string;
}) => {
  return requestFormClient.post<any>(
    '/productAction/confirmPriceListAdj.do',
    params,
  );
};

// 作废
export const cancelPriceListAdj = (params: {
  priceListAdjId: number | string;
}) => {
  return requestFormClient.post<any>(
    'productAction/cancelPriceListAdj.do',
    params,
  );
};
