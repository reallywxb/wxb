import { getApi } from '../../api/request';

function getRequestClient() {
  return getApi();
}

export async function uploadImage(url: string, params: any) {
  return getRequestClient().upload(url, params);
}
