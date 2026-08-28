import { requestFormClient } from '#/api/request';

export function savePCLRoleAccess(data: any) {
  return requestFormClient.post(
    'productControlLevelAction/savePCLRoleAccess.do',
    data,
    {
      responseReturn: 'body',
    },
  );
}
