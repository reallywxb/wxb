import { requestFormClient } from '#/api/request';

export interface ManufRowType {
  applyId: number;
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certValidTo: string;
  checkTime: string;
  checkUser: string;
  description: string;
  filePaths: Array<{ fileId: string; path: string }>;
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  versionNo: string;
  [key: string]: any;
}

export interface ManufTableTypeResponse {
  rows: ManufRowType[];
  success: boolean;
  total: number;
}

export interface ApplyOrRejectType {
  applySyncId: number;
  status: string;
  checkRemark: string;
}

export interface VendorRowType {
  certDate: string;
  certNo: string;
  certTypeName: string;
  certValidTo: string;
  checkRemark: null | string;
  checkStatus: string;
  companyApplyCertId: number;
  companyName: string;
  description: null | string;
  filePaths: string;
  principal: null | string;
  principalMobile: null | string;
  scope: null;
  validityType: string;
  [key: string]: any;
}

export interface DetailResponse {
  rows: {
    authorizes: any[];
    contracts: any[];
    manufCerts: any[];
    newProductApply: any[];
    productCerts: any[];
    productMaster: any[];
    products: any[] | null;
    vendorCerts: VendorRowType[];
  };
  success: boolean;
  total: number;
}

export interface ApplyOrRejectParams {
  applySyncId: number;
  status: string;
  checkRemark: string;
  productIds?: any[];
  removedProductCodes?: any[];
}

// 单个证照详情-通过/拒绝
interface PassLicenseDetailParams {
  checkRemark: string;
  type: string;
  status: string;
  ids: string;
}

// 通过/拒绝
export const applyOrReject = (params: { ids: string }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/applyCheck.do',
    params,
  );
};

// 获取详情
export const getSyncApplyDetail = (params: { id: number }) => {
  return requestFormClient.post<DetailResponse>(
    '/productSyncAction/getSyncApplyDetail.do',
    params,
  );
};

// 证照图片核对-通过/拒绝
export const passLicenseViewPicture = (params: PassLicenseDetailParams) => {
  return requestFormClient.post<any>(
    '/productSyncAction/detailCheck.do',
    params,
  );
};
