import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const request = instance?.appContext.config.globalProperties.$axios;

export const getUploadFiles = (url, type: string, query) => {
  return new Promise((resolve, reject) => {
    request
      .request(url, {
        data: query,
        dataIsArray: true,
        formSubmit: true,
        method: type,
        type: 'json',
      })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
