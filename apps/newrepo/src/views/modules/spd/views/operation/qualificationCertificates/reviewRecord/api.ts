import { requestFormClient } from '#/api/request';

/**
 * @description 通用的审核、描述与文件信息
 */
export interface BaseAuditInfo {
  checkRemark: null | string;
  checkStatus: string;
  description: null | string;
  filePaths: string;
  validityType: string;
}

/**
 * @description 通用的证书核心信息
 */
export interface BaseCertInfo {
  certNo: string;
  certTypeName: string;
  certDate: string;
  certValidTo: null | string;
}

export interface LineItem {
  authorizeCompanyName: string;
  authorizeLineCode: number | string;
  certDate: string;
  certValidTo: string;
  description: string;
  filePaths: string;
  scope: string;
  toAuthorizeCompanyName: string;
}

/**
 * @description 企业授权书 (继承了基础审核信息)
 */
export interface AuthorizeItem extends BaseAuditInfo {
  authorizeApplyId: number;
  authorizeCode: string;
  authorizeCompanyName: string;
  certDate: string;
  certValidTo: string; // 注意：这里覆盖了 BaseAuditInfo 中可能存在的同名字段，类型更具体
  lines: LineItem[];
  manufacturer: string;
  scope: null;
  toAuthorizeCompanyName: string;
}

/**
 * @description 生产厂家证书 (继承了审核信息与证书核心信息)
 */
export interface ManufCertItem extends BaseAuditInfo, BaseCertInfo {
  companyApplyCertId: number;
  companyName: string;
  principal: null | string;
  principalMobile: null | string;
  scope: null;
}

/**
 * @description 产品证照 (继承了审核信息与证书核心信息)
 */
export interface ProductCertItem extends BaseAuditInfo, BaseCertInfo {
  productApplyCertId: number;
}

/**
 * @description 供应商证照 (继承了审核信息与证书核心信息)
 */
export interface VendorCertItem extends BaseAuditInfo, BaseCertInfo {
  companyApplyCertId: number;
  companyName: string;
  principal: null;
  principalMobile: null;
  scope: null;
  // 注意：这里的 certValidTo 是 string，它兼容 BaseCertInfo 的 null | string
  certValidTo: string;
}

/**
 * @description 产品主数据 (同样继承了审核与证书信息)
 */
export interface ProductMaster extends BaseAuditInfo, BaseCertInfo {
  productApplyId: number;
  productName: string;
  productType: string;
  model: null;
  manufacturer: string;
  oldCertNo: null;
  vendorName: null;
  // 注意：这里的 certValidTo 是 string，它兼容 BaseCertInfo 的 null | string
  certValidTo: string;
}

/**
 * @description 关联医院商品
 */
export interface ProductItem {
  productId: number;
  modelN: null;
  manufacturer: null;
  isActive: string;
  isHasRef: string;
  productCode: string;
  productName: string;
  productSpec: string;
  medicineName: string;
}

export interface licenseDetailType {
  authorizes: AuthorizeItem[];
  contracts: any[];
  manufCerts: ManufCertItem[];
  newProductApply: any[];
  productCerts: ProductCertItem[];
  productMaster: ProductMaster;
  products: ProductItem[];
  vendorCerts: VendorCertItem[];
}

export interface licenseDetailResponse {
  rows: licenseDetailType[];
}

export const queryLicenseDetailInfo = (params: { id: number }) => {
  return requestFormClient.post<licenseDetailResponse>(
    '/productSyncAction/getSyncApplyDetail.do',
    params,
  );
};
