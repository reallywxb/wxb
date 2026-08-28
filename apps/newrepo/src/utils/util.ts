import type { Reactive, Ref } from 'vue';

import { ref, toRaw } from 'vue';

import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
/**
 * 深拷贝一个Reactive对象
 */
export function deepCopyReactive(obj: Reactive<any>) {
  // 基础类型直接返回
  if (obj === null || typeof obj !== 'object') return obj;

  // 获取原始对象（解除顶层 Proxy）
  const rawObj = toRaw(obj);

  // 处理数组和普通对象
  const copy: Reactive<any> | Reactive<any>[] = Array.isArray(rawObj) ? [] : {};

  for (const key in rawObj) {
    if (Object.prototype.hasOwnProperty.call(rawObj, key)) {
      // 递归处理每个属性
      copy[key] = deepCopyReactive(rawObj[key]);
    }
  }

  return copy;
}
/**
 * 深拷贝一个普通js对象
 */
export function deepClone(source: any, hash = new WeakMap()) {
  // 基础类型直接返回
  if (source === null || typeof source !== 'object') return source;

  // 处理循环引用
  if (hash.has(source)) return hash.get(source);

  // 处理 Date
  if (source instanceof Date) return new Date(source);

  // 处理 RegExp
  if (source instanceof RegExp) return new RegExp(source);

  // 处理数组
  if (Array.isArray(source)) {
    const clonedArr: any[] = [];
    hash.set(source, clonedArr);
    source.forEach((item, index) => {
      clonedArr[index] = deepClone(item, hash);
    });
    return clonedArr;
  }

  // 初始化拷贝对象（保留原型链）
  const clone = Object.create(Object.getPrototypeOf(source));

  hash.set(source, clone); // 记录已拷贝对象

  // 遍历属性
  for (const key of Reflect.ownKeys(source)) {
    clone[key] = deepClone(source[key], hash);
  }

  return clone;
}
/**
 * 生成随机len位数字
 */
export const randomLenNum = (len: number, date: boolean) => {
  let random = '';
  random = Math.ceil(Math.random() * 100_000_000_000_000)
    .toString()
    .slice(0, Math.max(0, len || 4));
  if (date) random = random + Date.now();
  return random;
};

/**
 * 加密一个字符串
 */
export const encryptStr = (data: string, key: string) => {
  const newKey = CryptoJS.enc.Latin1.parse(key);
  const iv = newKey;
  // 加密
  const encrypted = CryptoJS.AES.encrypt(data, newKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  });
  const result = encrypted.toString();

  return result;
};

/**
 * 加密一个对象
 */
export const encryptObj = (params: {
  data: { [string: string]: any };
  key: string;
  param: string[];
  type?: string;
}) => {
  const { data, key, param, type } = params;
  const result = deepClone(data);
  if (type === 'Base64') {
    param.forEach((ele) => {
      result[ele] = btoa(result[ele]);
    });
  } else {
    param.forEach((ele) => {
      const data = result[ele];
      const newKey = CryptoJS.enc.Latin1.parse(key);
      const iv = newKey;
      // 加密
      const encrypted = CryptoJS.AES.encrypt(data, newKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding,
      });
      result[ele] = encrypted.toString();
    });
  }
  return result;
};

export function deepMerge(targetori: any, source: any, options: any = {}) {
  const target = deepClone(targetori);
  const { concatArrays = true } = options;
  // 如果source不是对象或为null，直接返回source
  if (typeof source !== 'object' || source === null) {
    return source;
  }
  // 遍历source的所有属性
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];

      // 如果target中没有该属性，直接添加
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        const targetValue = target[key];
        // 双方都是数组
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
          concatArrays
            ? (target[key] = [...targetValue, ...sourceValue])
            : (target[key] = sourceValue);
        }
        // 双方都是对象，递归合并
        else if (
          typeof targetValue === 'object' &&
          targetValue !== null &&
          typeof sourceValue === 'object' &&
          sourceValue !== null
        ) {
          target[key] = deepMerge(
            Object.assign({}, targetValue),
            sourceValue,
            options,
          );
        }
        // 其他情况，直接覆盖
        else {
          target[key] = sourceValue;
        }
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return target;
}

export function handlePriceToFixedTwo(price: number | string): string {
  if (typeof price === 'number') {
    const str = String(price);
    if (!str.split('.')[1]) {
      return `${str}.00`;
    } else if (str.split('.')[1]?.length === 1) {
      return `${str}0`;
    } else {
      return str;
    }
  } else {
    const str = price;
    if (!str) {
      return '';
    }
    if (!str.split('.')[1]) {
      return `${str}.00`;
    } else if (str.split('.')[1]?.length === 1) {
      return `${str}0`;
    } else {
      return str;
    }
  }
}

/**
 * 判断是否为空
 */
export function validatenull(val: any) {
  if (typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'number') {
    return false;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return true;
  } else if (val instanceof Object) {
    if (JSON.stringify(val) === '{}') return true;
  } else {
    if (
      val === 'null' ||
      val === null ||
      val === 'undefined' ||
      val === undefined ||
      val === ''
    )
      return true;
    return false;
  }
  return false;
}
// 监听一个简单ref数据值的变化，变化后才能继续往下走
export const listenDataChangePromise = (
  listenData: Ref, // 监听的数据
  timeout: number = 2000, // 超时时间
  interval: number = 33, // 轮询间隔
) => {
  return new Promise((resolve) => {
    // console.log('初始值：', listenData.value);
    const originData = listenData.value;
    let nowUseTime = 0;
    // 轮询监控某个响应数据是否改变，改变了就resolve(true)，2s钟内未改变，resolve(false)
    const timer = setInterval(() => {
      if (originData !== listenData.value) {
        clearInterval(timer);
        // console.log('值变了', originData, listenData.value, nowUseTime);
        resolve(true);
      }
      nowUseTime += interval;
      if (nowUseTime > timeout) {
        clearInterval(timer);
        resolve(false);
        // reject(new Error('超时'));
      }
    }, interval);
  });
};

/**
 * 深度去除对象中的空值字段
 * @param {object | Array} obj - 要处理的对象或数组
 * @returns {object | Array} 处理后的对象或数组
 */
export function removeEmptyFields(obj: any) {
  if (Array.isArray(obj)) {
    // 处理数组
    return obj
      .map((value): ((val: any) => any) => {
        if (typeof value === 'object' && value !== null) {
          return removeEmptyFields(value);
        }
        return value;
      })
      .filter((value) => !isEmptyValue(value));
  } else if (typeof obj === 'object' && obj !== null) {
    // 处理对象
    const result: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        const cleanedValue = removeEmptyFields(value);
        if (!isEmptyValue(cleanedValue)) {
          result[key] = cleanedValue;
        }
      } else if (!isEmptyValue(value)) {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}
/**
 * 判断值是否为空值
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为空值
 */
function isEmptyValue(value: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length === 0)
  );
}

/**
 * 判断两个值是否相等 仅处理 数字和字符串
 * 场景为有时id给的是字符串，有时给的是数字，直接判断无法相等
 */
export function isTheSame(a: number | string, b: number | string) {
  if (typeof a === typeof b) {
    return a === b;
  } else {
    return typeof a === 'number' ? String(a) === b : String(b) === a;
  }
}

export const handlePrice: (val: number | string) => {
  numberCountAfterDot: number;
  val: number;
} = (price: any) => {
  // 处理数字或者字符串，返回 val：数字   numberCountAfterDot：小数点后的位数
  let numberCountAfterDot = 0;
  if (typeof price === 'string') {
    const parts = (price.includes('.') ? price.split('.') : [price, '']) as [
      string,
      string,
    ];
    numberCountAfterDot = parts[1].length;
    return { val: Number.parseFloat(price), numberCountAfterDot };
  } else if (typeof price === 'number') {
    const midPrice = String(price);
    const parts = (
      midPrice.includes('.') ? midPrice.split('.') : [midPrice, '']
    ) as [string, string];
    numberCountAfterDot = parts[1].length;
    return { val: price, numberCountAfterDot };
  } else {
    return { val: 0, numberCountAfterDot: 0 };
  }
};

export const handleAllPrice = (
  singlePrice: number | string,
  count: number | string,
) => {
  const priceObj = handlePrice(singlePrice);
  const countObj = handlePrice(count);
  const allPrice =
    priceObj.numberCountAfterDot > 0
      ? (priceObj.val * 10 ** priceObj.numberCountAfterDot * countObj.val) /
        10 ** priceObj.numberCountAfterDot
      : countObj.val * priceObj.val;
  // 截断浮点数精度，保留2位小数
  return Number(allPrice.toFixed(2));
};

export const getTimePeriod = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 将时间转换为分钟数，便于比较
  const totalMinutes = hours * 60 + minutes;

  // 定义时间段边界（以分钟为单位）
  const MORNING_START = 6 * 60; // 6:00
  const MORNING_END = 11 * 60 + 30; // 11:30
  const NOON_START = 11 * 60 + 30; // 11:30
  const NOON_END = 13 * 60 + 30; // 13:30
  const AFTERNOON_START = 13 * 60 + 30; // 13:30
  const AFTERNOON_END = 18 * 60; // 18:00

  if (totalMinutes >= MORNING_START && totalMinutes < MORNING_END) {
    return '早上';
  } else if (totalMinutes >= NOON_START && totalMinutes < NOON_END) {
    return '中午';
  } else if (totalMinutes >= AFTERNOON_START && totalMinutes < AFTERNOON_END) {
    return '下午';
  } else {
    return '晚上';
  }
};

/**
 * 封装promise，返回一个promise，promise成功返回[res, null]，失败返回[null, error]
 * @param fn
 * @param args
 * @returns Promise
 */
export const promiseController = <T extends any[] = any[]>(
  fn: (...args: T) => Promise<any>,
  ...args: T
) => {
  return new Promise<[any, null] | [null, any]>((resolve) => {
    fn(...args)
      .then((res) => {
        resolve([res, null]);
      })
      .catch((error) => {
        resolve([null, error]);
      });
  });
};

/**
 *加密处理
 */
export const encryption = (params: any) => {
  let { data, type, param, key } = params;
  const result = structuredClone(data);
  if (type === 'Base64') {
    param.forEach((ele: string) => {
      result[ele] = btoa(result[ele]);
    });
  } else {
    param.forEach((ele: string) => {
      const data = result[ele];
      key = CryptoJS.enc.Latin1.parse(key);
      const iv = key;
      // 加密
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding,
      });
      result[ele] = encrypted.toString();
    });
  }
  return result;
};

/* 具有最小持续时间的加载状态*/
export function usePersistentLoading(timeout = 200) {
  const loading = ref(false);
  function showLoading() {
    let lock = true;

    loading.value = true;

    setTimeout(() => {
      stop();
    }, timeout);

    function stop() {
      if (lock) {
        lock = false;
      } else {
        loading.value = false;
      }
    }

    return stop;
  }

  return {
    loading,
    showLoading,
  };
}

export function guaranteeDateStyle(date: string) {
  if (date && dayjs(date).isBefore(dayjs().subtract(-30, 'day'))) {
    return {
      color: 'red',
    };
  } else if (date && dayjs(date).isBefore(dayjs().subtract(-60, 'day'))) {
    return {
      color: '#f97316',
    };
  } else if (date && dayjs(date).isBefore(dayjs().subtract(-90, 'day'))) {
    return {
      color: '#faae1a',
    };
  }
}

export function handleShowQty(qty: null | number | string | undefined) {
  return qty || 0;
}

export function hospitalChange(rows: any, formApi: any) {
  // 在函数内部使用解构赋值设置默认值
  function getWarehouseOption() {
    const hospitalId = rows[0].id;
    formApi.getFieldComponentRef('departmentId').params.dependencies = {
      regionId: hospitalId,
      hospitalId,
    };

    formApi?.getFieldComponentRef('departmentId')?.fetchApi();
    // if (setDefaultWarehouse) {
    //   formApi?.setFieldValue(
    //     'warehouseId',
    //     userStore.userInfo.defaultWarehouseId || undefined,
    //   );
    // }
  }

  getWarehouseOption();
}
