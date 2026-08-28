export interface filePathItem {
  created: string;
  fileId: string;
  path: string;
}

// 审查记录
export interface reviewRecordRow {
  applyId: number;
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certValidTo: string;
  checkTime: string;
  checkUser: string;
  filePaths: Omit<filePathItem, 'created'>[];
  manufacturerCode: string;
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  versionNo: string;
}

export type AuthorizeRowType = reviewRecordRow & {};

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
