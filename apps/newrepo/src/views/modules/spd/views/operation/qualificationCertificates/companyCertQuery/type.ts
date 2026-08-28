export interface filePathItem {
  created: string;
  fileId: string;
  path: string;
}

export interface parentRow {
  bpartnerCode: string;
  bpartnerId: string;
  bpartnerName: string;
  companyId: string;
  isVendorCompany: string;
  locationOfCountry: string;
  locationOfCountryName: string;
  name: string;
  type: string;
  typeName: string;
}

export interface childrenRow extends parentRow {
  certValidTo: string;
  checkTime: string;
  checkUser: string;
  companyCertId: string;
  companyId: string;
  companyName: string;
  companyType: string;
  companyTypeName: string;
  filePaths: Omit<filePathItem, 'created'>[];
  hasExpired: string;
  isVendorCompany: string;
}

// 审查记录
export interface reviewRecordRow {
  [x: string]: any;
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
  filePaths: Omit<filePathItem, 'created'>[];
  isVendor: string;
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  versionNo: string;
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
    vendorCerts: any[];
  }[];
  success: boolean;
  total: number;
}
