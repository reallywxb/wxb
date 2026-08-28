export interface FilePathsItem {
  fileId: string;
  path: string;
}

// 父表
export interface ParentTableType {
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certNo: string;
  certType: string;
  certTypeName: string;
  certValidTo: string;
  checkTime: string;
  checkUser: string;
  filePaths: FilePathsItem[];
  manufacturerId: string;
  manufacturerName: string;
  orgId: string;
  orgName: string;
  productCode: string;
  productId: string;
  productName: string;
  productType: string;
  syncTime: string;
  versionNo: string;
  authorizeId?: string;
}
