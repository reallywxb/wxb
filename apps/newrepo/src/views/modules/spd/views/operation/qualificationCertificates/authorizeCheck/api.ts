import { requestFormClient } from '#/api/request';

export interface AuthorizeRowType {
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

export interface AuthorizeTableTypeResponse {
  rows: AuthorizeRowType[];
  success: boolean;
  total: number;
}

export interface ApplyOrRejectType {
  applySyncId: number;
  status: string;
  checkRemark: string;
}

export interface AuthorizeDetail {
  authorizeApplyId: number;
  authorizeCode: string;
  authorizeCompanyName: string;
  certDate: string;
  certValidTo: string;
  checkRemark: null | string;
  checkStatus: string;
  description: null;
  filePaths: string;
  lines: Array<any>;
  manufacturer: string;
  scope: null;
  toAuthorizeCompanyName: string;
  validityType: string;
}

export interface AuthorizeDetailResponse {
  rows: {
    authorizes: AuthorizeDetail[];
    contracts: any[];
    manufCerts: any[];
    newProductApply: any[];
    productCerts: any[];
    productMaster: any[];
    products: any[] | null;
    vendorCerts: any[];
  };
  success: boolean;
  total: number;
}

export interface ApplyOrRejectParams {
  applySyncId: number;
  status: string;
  checkRemark?: string;
  productIds?: any[];
  removedProductCodes: any[];
}

// 单个证照详情-通过/拒绝
interface PassLicenseDetailParams {
  checkRemark: string;
  type: string;
  status: string;
  ids: string;
}

// 通过
export const applySyncCheck = (data: { ids: string }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/applySyncCheck.do',
    data,
  );
};

// 拒绝
export const rejectSyncCheck = (data: { ids: string }) => {
  return requestFormClient.post<any>('/productSyncAction/applyCheck.do', data);
};

// 获取详情
export const getSyncApplyDetail = (params: { id: number }) => {
  return requestFormClient.post<AuthorizeDetailResponse>(
    '/productSyncAction/getSyncApplyDetail.do',
    params,
  );
};

// 详情-审核通过/拒绝
export const applyOrReject = (params: { ids: string }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/applyCheck.do',
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
