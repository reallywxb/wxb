import { requestFormClient } from '#/api/request';

export const queryUploadTraceCodeApi = (params: any) => {
  return requestFormClient.post<any>('/traceCode/uploadQuery.do', params);
};

export const uploadTraceCodeApi = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return requestFormClient.upload('/traceCode/uploadTraceCode.do', formData);
};
