import { requestFormClient } from '#/api/request';

export interface ContractRowType {
  applyId: number;
  contractNo: string;
  bpartnerName: string;
  beginDate: string;
  endDate: string;
  scope: string;
  description: string;
  filePaths: Array<{ fileId: string; path: string }>;
  syncTime: string;
  versionNo: string;
  status: string;
  [key: string]: any;
}

export interface ContractRowTypeResponse {
  rows: ContractRowType[];
  success: boolean;
  total: number;
}

export interface ApplyOrRejectType {
  applySyncId: number;
  status: string;
  checkRemark: string;
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
    contracts: ContractDetailType[];
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
