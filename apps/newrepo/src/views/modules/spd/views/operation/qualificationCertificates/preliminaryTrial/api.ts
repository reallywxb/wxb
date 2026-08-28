import { requestFormClient } from '#/api/request';

export interface filePathType {
  created: string;
  fileId: string;
  path: string;
}

export interface tableRowType {
  ProductCode: string;
  applyId: number;
  bpartnerId: string;
  bpartnerName: string;
  certDate: string;
  certNo: string;
  certType: string;
  certValidTo: string;
  checkTime: string;
  filePaths: filePathType[];
  manufacturerId: string;
  manufacturerName: string;
  productName: string;
  productType: string;
  status: string;
  statusName: string;
  syncTime: string;
  type: string;
  typeName: string;
  validityType: string;
  versionNo: string;
}

// 通过接口的入参
export interface CommonType {
  applySyncId: number;
  status: string;
  checkRemark?: string;
}

// export type RejectParams = Omit<CommonType, 'checkRemark'>

// 通过
export const applySyncCheck = (data: { ids: string }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/applySyncCheck.do',
    data,
  );
};

// 拒绝
export const rejectSyncCheck = (data: { ids: string }) => {
  return requestFormClient.post<any>('/productSyncAction/applyCheck.do', data);
};

// 证照详情
export const queryLicenseDetailInfo = (params: { id: number }) => {
  return requestFormClient.post<any>(
    '/productSyncAction/getSyncApplyDetail.do',
    params,
  );
};

// 证照详情-通过/拒绝
export const passLicenseDetail = (params: any) => {
  return requestFormClient.post<any>(
    '/productSyncAction/applyCheck.do',
    params,
    // {
    //   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    // }
  );
};

// 证照图片核对-通过/拒绝
export const passLicenseViewPicture = (params: any) => {
  return requestFormClient.post<any>(
    '/productSyncAction/detailCheck.do',
    params,
  );
};
