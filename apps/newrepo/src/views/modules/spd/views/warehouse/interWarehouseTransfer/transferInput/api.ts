import { requestFormClient } from '#/api/request';

export const saveLine = (params: any) => {
  return requestFormClient.post<any>('/orderAction/save_direct.do', params);
  // return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/orderAction/save_directDb', params);
};

export const modifyLine = (params: any) => {
  return requestFormClient.post<any>(
    '/orderAction/modifyLine_direct.do',
    params,
  );
  // return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};

export const deleteLine = (params: any) => {
  return requestFormClient.post<any>(
    '/orderAction/deleteLine_direct.do',
    params,
  );
  // return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};

export const detailCommitDo = (params: any) => {
  return requestFormClient.post<any>(
    '/orderAction/save.do?page=package',
    params,
  );
};
export const invalidateCancel = (params: any) => {
  return requestFormClient.post<any>('/orderAction/delete.do', params);
};
export const dataCommit = (params: any) => {
  return requestFormClient.post<any>('/orderAction/commit_direct.do', params);
};

export const createMoPlan = (params: any) => {
  return requestFormClient.post<any>('/autoPlanAction/createMoPlan.do', params);
};
