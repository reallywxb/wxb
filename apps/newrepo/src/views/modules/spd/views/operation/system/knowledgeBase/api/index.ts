import { requestClient, requestFormClient } from '#/api/request';

/** 上传知识文档 */
export async function uploadKnowledge(data: FormData) {
  return requestClient.post('/aIChatAction/uploadKnowledge.do', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/** 知识库文档列表查询 */
export async function listDocuments(params: any) {
  return requestClient.post('/aIChatAction/listDocuments.do', params);
}

/** 删除知识库文档 */
export async function deleteDocument(params: { docId: string }) {
  return requestFormClient.post('/aIChatAction/deleteDocument.do', params);
}

/** 审核文档 */
export async function auditDocument(params: { docId: string }) {
  return requestFormClient.post('/aIChatAction/auditDocument.do', params);
}

/** 查询文档片段列表 */
export async function getDocChunks(params: { docId: string }) {
  return requestFormClient.post('/aIChatAction/listChunks.do', params);
}
