export interface TableRowType {
  applyId: number;
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certValidTo: string;
  checkTime: string;
  checkUser: string;
  companyCertCode: string;
  companyCode: string;
  companyName: string;
  companyType: string;
  filePaths: Array<{ fileId: string; path: string }>;
  isVendor: string;
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  versionNo: string;
  [key: string]: any;
}

export interface TableTypeResponse {
  rows: TableRowType[];
  success: boolean;
  total: number;
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

export interface LicenseDetailResponse {
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
