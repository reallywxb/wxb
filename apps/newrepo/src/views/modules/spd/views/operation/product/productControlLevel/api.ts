import { requestFormClient } from '#/api/request';

async function delProductControlLevel(data: any) {
  return requestFormClient.post('productControlLevelAction/delete.do', data, {
    responseReturn: 'body',
  });
}

async function saveProductControlLevel(data: any) {
  return requestFormClient.post('productControlLevelAction/save.do', data, {
    responseReturn: 'body',
  });
}

function savePCLRoleAccess(data: any) {
  return requestFormClient.post(
    'productControlLevelAction/savePCLRoleAccess.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

function getPCLFieldValues(data: any) {
  return requestFormClient.post(
    'productControlLevelAction/getPCLFieldValues.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

function savePCLFieldValues(data: any) {
  return requestFormClient.post(
    'productControlLevelAction/savePCLFieldValues.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}

export {
  delProductControlLevel,
  getPCLFieldValues,
  savePCLFieldValues,
  savePCLRoleAccess,
  saveProductControlLevel,
};
