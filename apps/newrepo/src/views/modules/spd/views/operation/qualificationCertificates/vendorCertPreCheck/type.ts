export interface FilePathsItem {
  fileId: string;
  path: string;
}

// 父表
export interface ParentTableType {
  authCertWCCnt: string;
  authorizeWCCnt: string;
  bpartnerId: number;
  bpartnerName: string;
  bpartnercode: string;
  contractWCCnt: string;
  manufCertWCCnt: string;
  productItemCount: string;
  productWCCnt: string;
  vendorCertWCCnt: string;
}

// 供应商证照
export interface CompanyCertRowType {
  applyId: number;
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certNo: string;
  certType: string;
  certValidTo: string;
  checkTime: string;
  checkUser: string;
  companyCertCode: string;
  companyCode: string;
  companyName: string;
  companyType: string;
  filePaths: Array<{ fileId: string; path: string }>;
  isVendor: 'Y';
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  versionNo: string;
  [key: string]: any;
}
