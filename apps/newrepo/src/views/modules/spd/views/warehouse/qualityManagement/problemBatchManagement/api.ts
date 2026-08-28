import { requestFormClient } from '#/api/request';

export const dataMove = (params: any) => {
  return requestFormClient.post<any>('/movementAction/move.do', params);
};
