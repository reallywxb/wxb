/**
 * @zh_CN 登录页面 url 地址
 */
export const LOGIN_PATH = '/auth/login';
// 空白登录页面 url 地址
export const BLANK_LOGIN_PATH = '/blankLogin';
export interface LanguageOption {
  label: string;
  value: 'zh-CN' | 'zh-HO';
}
// 'en-US' |
//

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '医院甲',
    value: 'zh-CN',
  },
  {
    label: '医院乙',
    value: 'zh-HO',
  },
  // {
  //   label: 'English',
  //   value: 'en-US',
  // },
];
