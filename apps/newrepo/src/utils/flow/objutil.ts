// import useClipboard from 'vue-clipboard3';

import { isReactive, toRaw } from 'vue';

import { message } from 'ant-design-vue';
// import moment from 'moment';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

import { useFlowStore } from '#/store/flow';

import getFormRuleWidget from './getFormRuleWidget';

// const { toClipboard } = useClipboard();

export function getPageSize() {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const pageWidth = window.innerWidth;

  const pageHeight = window.innerHeight;
  return {
    screenHeight,
    screenWidth,
    pageWidth,
    pageHeight,
  };
}

// 获取表单验证规则
export function getFormRuleConfig(item) {
  const module = getFormRuleWidget[item.type];
  const method = module.getValidateRule(item);
  return method;
}

// 定义url解析函数
export function parseUrlParams(paramsString) {
  const params = {};
  paramsString.split('&').forEach((param) => {
    const [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
  });
  return params;
}

// 获取表单值
export function getFormValue(v) {
  const obj = {};

  for (const item of v) {
    obj[item.id] = item.props.value;
  }
  return obj;
}

export function getCurrentConfig(id) {
  const flowStore = useFlowStore();
  const step2 = flowStore.step2;
  const idObjList = step2.filter((res) => res.id === id);
  if (idObjList.length > 0) {
    return idObjList[0];
  }

  return undefined;
}

// 数字转人民币大写
export function convertCurrency(money) {
  if (money === null || money === undefined) {
    return '';
  }

  // 汉字的数字
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  // 基本单位
  const cnIntRadice = ['', '拾', '佰', '仟'];
  // 对应整数部分扩展单位
  const cnIntUnits = ['', '万', '亿', '兆'];
  // 对应小数部分单位
  const cnDecUnits = ['角', '分', '毫', '厘'];
  // 整数金额时后面跟的字符
  const cnInteger = '整';
  // 整型完以后的单位
  const cnIntLast = '元';
  // 最大处理的数字
  // eslint-disable-next-line no-loss-of-precision
  const maxNum = 999_999_999_999_999.9999;
  // 金额整数部分
  let integerNum;
  // 金额小数部分
  let decimalNum;
  // 输出的中文金额字符串
  let chineseStr = '';
  // 分离金额后用的数组，预定义
  let parts;
  // 传入的参数为空情况
  if (money === '') {
    return '';
  }
  money = Number.parseFloat(money);
  if (money >= maxNum) {
    return '';
  }
  // 传入的参数为0情况
  if (money === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  // 转为字符串
  money = money.toString();
  // indexOf 检测某字符在字符串中首次出现的位置 返回索引值（从0 开始） -1 代表无
  if (money.includes('.')) {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].slice(0, 4);
  } else {
    integerNum = money;
    decimalNum = '';
  }
  // 转换整数部分
  if (Number.parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    const IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.slice(i, i + 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      if (n === '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        zeroCount = 0;
        chineseStr += cnNums[Number.parseInt(n)] + cnIntRadice[m];
      }
      if (m === 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    // 最后+ 元
    chineseStr += cnIntLast;
  }
  // 转换小数部分
  if (decimalNum !== '') {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.slice(i, i + 1);
      if (n !== '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === '') {
    chineseStr += cnInteger;
  }

  return chineseStr;
}

/**
 * 复制到粘贴板
 * @param value any
 * @returns {Promise<void>}
 */
export async function copyToBoard(value: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.append(textarea);
      textarea.select();

      document.execCommand('copy');

      textarea.remove();
    }
    message.success('复制成功');
  } catch {
    message.error('复制失败');
  }
}

export function isNull(s) {
  if (s === undefined || s === null) {
    return true;
  }
  return false;
}

export function isBlank(s) {
  if (
    s === undefined ||
    s === null ||
    (typeof s === 'string' && s.trim().length === 0)
  ) {
    return true;
  }
  return false;
}

export function isNotBlank(s) {
  return !isBlank(s);
}

export function isNode(obj) {
  return isNotBlank(obj) && isNotBlank(obj.id);
}

export function checkHttpSetting(setting, title) {
  const url = setting?.url;
  const header = setting?.header;
  const body = setting?.body;

  if (!isUrl(url)) {
    let msg = '请输入正确的请求地址';
    if (isNotBlank(title)) {
      msg = `请输入【${title}】的请求地址`;
    }
    return {
      ok: false,
      msg,
    };
  }

  if (header && header.length > 0) {
    for (const item of header) {
      if (isBlank(item.field) || isBlank(item.value)) {
        let msg = '请完善请求头';
        if (isNotBlank(title)) {
          msg = `请完善【${title}】的请求头`;
        }
        return {
          ok: false,
          msg,
        };
      }
    }
  }

  if (body && body.length > 0) {
    for (const item of body) {
      if (isBlank(item.field) || isBlank(item.value)) {
        let msg = '请完善请求体';
        if (isNotBlank(title)) {
          msg = `请完善【${title}】的请求体`;
        }
        return {
          ok: false,
          msg,
        };
      }
    }
  }

  return { ok: true };
}

// 对象合并
export function assiginObj(target = {}, sources = {}) {
  const obj = target;
  if (typeof target !== 'object' || typeof sources !== 'object') {
    return sources; // 如果其中一个不是对象 就返回sources
  }
  for (const key in sources) {
    // 如果target也存在 那就再次合并
    obj[key] = Object.prototype.hasOwnProperty.call(target, key)
      ? assiginObj(target[key], sources[key])
      : sources[key];
  }
  return obj;
}

export function isUrl(obj) {
  if (isBlank(obj)) {
    return false;
  }

  const regUrl =
    // eslint-disable-next-line regexp/no-super-linear-backtracking,regexp/strict
    /^(?:ht|f)tps?:\/\/[\w-]+(?:\.[\w-]+)+(?:[\w-.,@?^=%&:/~+#]*[\w-@?^=%&/~+#])?$/;

  return regUrl.test(obj);
}

// 判断是否是整数
export function isInteger(obj) {
  if (isBlank(obj)) {
    return false;
  }

  const regUrl = /^\d+$/;

  return regUrl.test(obj);
}

export function getRandomId() {
  return `flow_${Date.now().toString().slice(5)}${Math.round(
    Math.random() * 9000 + 1000,
  )}`;
}

export function distinct(arr) {
  return [...new Set(arr)];
}

export function getNumberRadixNum(s) {
  const strings = s.toString().split('.');
  if (strings.length <= 1) {
    return 0;
  }
  return strings[1].toString().length;
}

export function deepCopy(s) {
  if (isNull(s)) {
    return undefined;
  }

  return cloneDeep(isReactive(s) ? toRaw(s) : s);
}

export function sameJsonObj(o1, o2) {
  if (typeof o1 !== typeof o2) {
    return false;
  }

  const object1 = deepCopy(o1);
  const object2 = deepCopy(o2);

  const keys1 = Object.keys(object1).sort();

  const keys2 = Object.keys(object2).sort();

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const [index, element] of keys1.entries()) {
    const val1 = object1[element];

    const val2 = object2[keys2[index]];

    const type1 = typeof val1;
    const type2 = typeof val2;

    if (type1 !== type2) {
      return false;
    }
    if (type1 instanceof Object) {
      const b = sameJsonObj(val1, val2);
      if (!b) {
        return false;
      }
    } else if (Array.isArray(val1)) {
      const l1 = val1.length;
      const l2 = val2.length;
      if (l1 !== l2) {
        return false;
      }
      for (let k = 0; k < l1; k++) {
        const b = sameJsonObj(val1[k], val2[k]);
        if (!b) {
          return false;
        }
      }
    } else if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

export function momentFunc(a, b) {
  return dayjs(a, b);
}

// export function momentFormat(a, b) {
//   return moment(a).format(b);
// }

// 最大公约数
function getGcd(a, b) {
  const max = Math.max(a, b);
  const min = Math.min(a, b);
  return max % min === 0 ? min : getGcd(max % min, min);
}

// 最小公倍数
function getLcm(a, b) {
  return (a * b) / getGcd(a, b);
}

// 多个数字的最小公倍数
export function getLcmArray(arr) {
  let lcm = arr[0];

  for (let k = 1; k < arr.length; k++) {
    lcm = getLcm(lcm, arr[k]);
  }
  return lcm;
}

// 获取URL的查询参数
// 将参数转化成JSON对象：如果URL没有携带参数，则JSON对象为{}
export function getUrlParamsToJSON(url) {
  const params = {};
  // 去除所有空格
  url = url.replaceAll(/\s/g, '');
  // 正则表达式匹配
  url.replaceAll(/([^?&=]+)=([^&]+)/g, (_, key, value) => {
    params[key] = value;
  });
  return params;
}

/**
 * 拼接对象为请求字符串
 * @param {object} obj - 待拼接的对象
 * @returns {string} - 拼接成的请求字符串
 * Auth:WANGJIAN
 */
export function encodeSearchParams(obj) {
  const params = [];

  Object.keys(obj).forEach((key) => {
    let value = obj[key];
    // 如果值为undefined我们将其置空
    if (value === undefined) {
      value = '';
    }
    // 对于需要编码的文本（比如说中文）我们要进行编码
    params.push([key, encodeURIComponent(value)].join('='));
  });

  return params.join('&');
}
// 判断是否是数字
export function isNumber(nubmer: string) {
  const re = /^[-+]?\d+(?:\.\d+)?$/; // 判断字符串是否为数字//判断正整数/[1−9]+[0−9]∗]∗/
  if (!re.test(nubmer)) {
    return false;
  }
  return true;
}
