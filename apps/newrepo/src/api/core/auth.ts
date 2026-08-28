import type { AdvSearchField } from '@vben/common-ui';

import {
  baseRequestClient,
  requestClient,
  requestFormClient,
} from '#/api/request';
import { ENCRYPT_KEY } from '#/const';
import { deepCopyReactive, encryptObj } from '#/utils/util';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    code?: string;
    randomStr?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: {
      expiresIn: number;
      refreshToken: string;
      token: string;
    };
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

const basicAuth = `Basic ${window.btoa('chcit-ui:xVrgD@d!')}`;

export function captchaImage() {
  // return requestClient.get('/codeSetting');
  return requestClient.get('/loginAction/getLoginConfig.do');
}

/**
 * 登录
 */
// export async function loginApi(data: AuthApi.LoginParams) {
//   return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
// }
export async function loginApi(data: AuthApi.LoginParams) {
  let handledParams = deepCopyReactive(data);
  if (!handledParams.password) {
    handledParams.password = '';
  }
  handledParams = encryptObj({
    data: handledParams,
    key: ENCRYPT_KEY,
    param: ['password'],
  });
  // handledParams.randomStr = randomLenNum(4, true);
  handledParams.randomStr = data.randomStr;
  handledParams.code = data.code;
  handledParams.grant_type = 'password';

  delete handledParams.captcha;
  delete handledParams.selectAccount;

  return requestClient.request<AuthApi.LoginResult>('/oauth2/token', {
    method: 'POST',
    params: handledParams,
    headers: {
      skipToken: true,
      Authorization: basicAuth,
    },
  });
}
/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/oauth2/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
// export async function logoutApi() {
//   return baseRequestClient.post('/auth/logout', {
//     withCredentials: true,
//     maxRedirects: 0,
//   });
// }
export async function logoutApi() {
  return baseRequestClient.delete('/logout', {
    withCredentials: true,
    maxRedirects: 0,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
/**
 * 获取表格高级查询keys
 */
export function getAdvSearchKeysFn(
  menuPageId: string,
): () => Promise<AdvSearchField[]> {
  return () => {
    return new Promise<AdvSearchField[]>((resolve) => {
      // 以下为测试代码，用于测试高级查询不同参数配置
      // resolve([
      //   {
      //     field: '公司',
      //     compType: 'text',
      //     value: 'company',
      //   },
      //   {
      //     field: '部门',
      //     compType: 'text',
      //     value: 'dept',
      //   },
      //   {
      //     field: '用户',
      //     compType: 'select',
      //     value: 'user',
      //     itemProps: {
      //       dictUrl: '/baseHandleAction/refList.do?id=1000244',
      //       labelField: 'name',
      //       valueField: 'id',
      //       formatInterfaceData: `function formatInterfaceData(data){
      //           return {
      //             records:data.rows
      //           }
      //         }`,
      //       maxTagCount: 1,
      //     },
      //   },
      //   {
      //     field: '创建时间',
      //     compType: 'date',
      //     value: 'create_time',
      //   },
      //   {
      //     field: '修改时间',
      //     compType: 'datetime',
      //     value: 'update_time',
      //   },
      //   {
      //     field: '金额',
      //     compType: 'number',
      //     value: 'amount',
      //   },
      // ]);

      requestFormClient
        .post('/baseHandleAction/querySeniorConfig', { menuPageId })
        .then((res) => {
          resolve(
            res.rows.map((item: any) => {
              return {
                field: item.fieldName,
                compType: item.fieldType,
                value: item.fieldCode,
                itemProps: item.itemProps || {},
              };
            }),
          );
        });
    });
  };
}
