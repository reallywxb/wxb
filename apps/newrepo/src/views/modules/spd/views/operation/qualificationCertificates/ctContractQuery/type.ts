export interface filePathItem {
  created: string;
  fileId: string;
  path: string;
}

export interface parentRow {
  beginDate: string;
  bpartnerId: string;
  bpartnerName: string;
  contractId: string;
  contractNo: string;
  description: string;
  endDate: string;
  hasExpired: string;
  filePaths: filePathItem[];
}

export interface childrenRow {
  contractId: string;
  contractProductId: string;
  mproductId: string;
  productCode: string;
  productName: string;
  [key: string]: any;
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

export interface ProductsRowType {
  isActive: null;
  isHasRef: string;
  manufacturer: string;
  medicineName: string;
  modelNo: null;
  productCode: string;
  productId: null;
  productName: string;
  productSpec: string;
}

export interface ContractDetailType {
  beginDate: string;
  checkRemark: null;
  checkStatus: string;
  contractCode: string;
  contractNo: string;
  contracteApplyId: number;
  description: string;
  endDate: string;
  filePaths: string;
  products: ProductsRowType[];
  scope: string;
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
