import { requestClient } from '#/api/request';
import { ENCRYPT_KEY } from '#/const';
import { deepCopyReactive, encryptObj } from '#/utils/util';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    code?: string;
    password?: string;
    randomStr?: string;
    username?: string;
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
export function captchaImage() {
  return requestClient.get('/codeSetting');
}

/**
 * 登录
 */
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
  delete handledParams.captcha;
  delete handledParams.selectAccount;

  return requestClient.request<AuthApi.LoginResult>('/login', {
    params: handledParams,
  });
}
/**
 * 单点登录接口
 */
export async function ssoLogin(query: Record<string, any>) {
  return requestClient.get<{
    code: number;
    data: null | {
      accessToken: {
        token: string;
      };
      msg: null | string;
      siteUserId?: number;
    };
    msg: null | string;
  }>('/siteLogin', {
    params: query,
    responseReturn: 'body',
  });
}
