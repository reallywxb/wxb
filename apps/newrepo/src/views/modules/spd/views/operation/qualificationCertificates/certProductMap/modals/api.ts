import { requestFormClient } from '#/api/request';

export interface FilePathsItem {
  fileId: string;
  path: string;
}

export interface ParentTableItem {
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certNo: string;
  certType: string;
  certTypeName: string;
  certValidTo: string;
  checkTime: string;
  checkUser: string;
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
  filePaths: FilePathsItem[];
}

export interface MapProductItem {
  isActive: string;
  manufacturerId: string;
  mapId: string;
  mproductId: string;
  productFullName: string;
  productId: string;
  productName: string;
  productSpec: string;
  productcode: string;
}

// 商品选择
export interface ProductSelectItem {
  markCode: string;
  modelNo: string;
  productCode: string;
  productId: number;
  productName: string;
  productSpec: string;
  uomName: string;
  value: string;
  [key: string]: any;
}

export const queryUser = (params: any) => {
  return requestFormClient.post<any>(
    '/movementWorkerHandleAction/query.do',
    params,
  );
};
export const doASNReg = (params: any) => {
  return requestFormClient.post<any>('/asnAction/doASNReg.do', params);
};

// 启用/禁用
export const updateActive = (params: {
  isActive: 'N' | 'Y';
  productMapId: string;
}) => {
  return requestFormClient.post<any>(
    '/productMapAction/changeActive.do',
    params,
  );
};

// 删除
export const deleteActive = (params: { productMapId: string }) => {
  return requestFormClient.post<any>('/productMapAction/delete.do', params);
};
