import { requestFormClient } from '#/api/request';

// 批量通过-status:'PS'   批量驳回-status:'NO'

export interface NewProductTable {
  MAH: string;
  applyId: number;
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certNo: string;
  certType: string;
  certTypeName: string;
  certValidto: string;
  checkTime: string;
  ctProductId: string;
  ctProductName: string;
  insuranceCode: string;
  insuranceUOMName: string;
  isEssential: string;
  isInsurance: string;
  manufacturer: string;
  medicineName: string;
  modelNo: string;
  name: string;
  priceList: string;
  productName: string;
  productSpec: string;
  productType: string;
  productTypeName: string;
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  versionNo: string;
}
export interface ApplyOrRejectParams {
  applySyncId: number;
  status: string;
  checkRemark: string;
  productIds?: any[];
  removedProductCodes?: any[];
}

// 主页-通过/拒绝
export const applyOrReject = (params: { ids: string }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/applyCheck.do',
    params,
  );
};

// 获取详情
export const getSyncApplyDetail = (params: { id: number }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/getSyncApplyDetail.do',
    params,
  );
};

// 证照图片核对-通过/拒绝
export const passLicenseViewPicture = (params: any) => {
  return requestFormClient.post<any>(
    '/productSyncAction/detailCheck.do',
    params,
  );
};
