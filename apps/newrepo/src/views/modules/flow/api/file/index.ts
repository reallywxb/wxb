import type { AxiosPromise } from 'axios';

import type { FileInfo } from './types.ts';

import { requestClient } from '#/api/request.ts';

/**
 * 上传文件
 *
 * @param file
 */
export function uploadFileApi(file: File): AxiosPromise<FileInfo> {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.post('/flow/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除文件
 *
 * @param filePath 文件完整路径
 */
export function deleteFileApi(filePath?: string) {
  return requestClient.delete('/flow/api/v1/files', { params: { filePath } });
}

// /**
//  * pdf转图片
//  *
//  * @param filePath 文件完整路径
//  */
// export function pdfToImgList(filePath?: string, page, count) {
//   return requestClient.({
//     url: '/file/pdfToImgList',
//     method: 'get',
//     params: { url: filePath, page, count },
//   });
// }
