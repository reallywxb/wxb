import { requestClient } from '#/api/request';
/**
 * 获取用户信息
 */
// export async function getUserInfoApi() {
//   return requestClient.get<UserInfo>('/user/info');
// }
export async function getUserInfoApi(token?: string) {
  return requestClient.get<UserInfoExt>(
    '/userBaseHandleAction/getCurrentUserV4.do',
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );
}
type WarehouseInfo = {
  warehouseId: number | string;
  warehouseName: string;
};

export async function getWarehouseInfoByOrgId(data: any, token?: string) {
  return new Promise<WarehouseInfo[]>((resolve, reject) => {
    requestClient
      .post<WarehouseInfo[]>(
        `/datatable/data/process/md.warehouse/queryWarehouseByUser`,
        data,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        },
      )
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
export async function switchOrg(id: number | string, token?: string) {
  return requestClient.post(
    `/sys/user/switchOrg/${id}`,
    {},
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );
}
type MessagePostData = {
  cols: { dict?: boolean; id: string }[];
  current: number;
  isRead?: boolean;
  messageGroup?: string;
  messageTime: string;
  messageType: string;
  size: number;
  sort: string[];
  start: number;
};
export async function getMyMessageList(data: MessagePostData) {
  return requestClient.post(`/sys/message/pageUserMessage`, data);
}

export async function readMessage(data: number[]) {
  return requestClient.post(`/sys/message/batchRead`, data);
}
