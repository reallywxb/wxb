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
  }[];
  success: boolean;
  total: number;
}

// 获取详情
export const getSyncApplyDetail = (params: { id: number }) => {
  return requestFormClient.post<AuthorizeDetailResponse>(
    '/productSyncAction/getSyncApplyDetail.do',
    params,
  );
};
