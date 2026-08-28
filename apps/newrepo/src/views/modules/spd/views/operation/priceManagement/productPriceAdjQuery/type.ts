export interface FilePathsItem {
  fileId: string;
  path: string;
}

// 父表
export interface ParentTableType {
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
}

// 调价明细
export interface PriceAdjDetailsRowType {
  amountAdj: number;
  amountPOAdj: number;
  isFee: string;
  isPurchasePriceUnify: string;
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

// 调价结果
export interface PriceAdjResultRowType {
  [key: string]: any | string;
}
