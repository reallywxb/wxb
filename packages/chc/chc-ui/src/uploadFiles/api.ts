import { RequestClient } from '@vben/request';

type RequestClientExt = InstanceType<typeof RequestClient>;
export function useUploadApi(axios: RequestClientExt) {
  function uploadFilesByFilelist(
    url: string,
    data: any,
    newFileKey = 'fileDtoList',
    oldFileKey = 'fileIds',
  ) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      const oldArr: any[] = [];
      Object.keys(data).forEach((key) => {
        if (key === newFileKey) {
          data[key].forEach((item: any) => {
            if (item instanceof File) {
              formData.append(`${newFileKey}`, item);
            } else {
              oldArr.push(item);
            }
          });
          formData.append(oldFileKey, JSON.stringify(oldArr));
        } else {
          formData.append(key, data[key]);
        }
      });
      axios
        .post(url, formData, {
          headers: {
            'Content-Type': false,
          },
        })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  return { uploadFilesByFilelist };
}
