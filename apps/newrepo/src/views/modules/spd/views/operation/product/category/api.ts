import { requestFormClient } from '#/api/request';

async function modifyActive(data: any) {
  return requestFormClient.post('productCategoryAction/active.do', data, {
    responseReturn: 'body',
  });
}

async function saveCategory(data: any) {
  return requestFormClient.post('productCategoryAction/save.do', data, {
    responseReturn: 'body',
  });
}

async function delCategory(data: any) {
  return requestFormClient.post('productCategoryAction/delete.do', data, {
    responseReturn: 'body',
  });
}

export { delCategory, modifyActive, saveCategory };
