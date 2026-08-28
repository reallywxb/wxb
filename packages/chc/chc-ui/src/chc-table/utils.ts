import { cloneDeep } from '@vben/utils';

export function deepMerge(targetori: any, source: any, options: any = {}) {
  const target = cloneDeep(targetori);
  const { concatArrays = true } = options;
  // 如果source不是对象或为null，直接返回source
  if (typeof source !== 'object' || source === null) {
    return target;
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
        // 如果sourceValue为undefined，则使用targetValue
        else if (sourceValue === undefined && targetValue !== undefined) {
          target[key] = targetValue;
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
