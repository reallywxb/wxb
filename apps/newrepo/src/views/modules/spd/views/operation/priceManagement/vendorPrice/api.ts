import { requestFormClient } from '#/api/request';

export interface VendorPriceRowType {
  created: string;
  createdByName: string;
  discountPrice: string;
  discountRate: string;
  guaranteeDaysMin: string;
  isActive: string;
  isDefault: string;
  isPurchasePriceUnify: string;
  manufacturer: string;
  markCode: string;
  orgId: string;
  priceList: string;
  pricePO: string;
  productCode: string;
  productId: string;
  productIsActive: string;
  productName: string;
  productOrgId: string;
  productSpec: string;
  uomId: string;
  uomName: string;
  updated: string;
  updatedByName: string;
  vendorId: string;
  vendorName: string;
  [key: string]: any;
}

export const vendorPriceAdjust = (params: any) => {
  return requestFormClient.post<any>(
    'productAction/vendorPriceAdjust.do',
    params,
  );
};
