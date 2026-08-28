import type { VxeGridProps } from '@vben//plugins/src/vxe-table/types';
import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { useChcGrid } from '#/adapter/chc-ui';
import { deepMerge } from '#/utils/util';

import { formDefaultOptions } from '../config/formDefaultOptions';
import { gridDefaultOptions } from '../config/gridDefaultOptions';

export const useSpdGrid = (
  options: VxeGridProps,
  chcOptions?: SchemaColumnAndOptions,
) => {
  const originFormOptions = options.formOptions || {};
  options.formOptions = deepMerge(formDefaultOptions, originFormOptions);
  const originGridOptions = options.gridOptions || {};
  options.gridOptions = deepMerge(gridDefaultOptions, originGridOptions);
  return useChcGrid(options, {
    defaultRequestOptions: {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    },
    ...chcOptions,
  },
  (res: any) => {
    return res.records && res.records.length > 0
      ? {
          total: res.total,
          records: res.records,
        }
      : {
          total: res.total,
          records: res.rows,
        };
  }, // 用于接口出参转换
  (params: any) => {
    return {
      ...params,
      pageSize: params.size,
      pageNum: params.current,
      limit: params.size,
      start: (params.current - 1) * params.size || 0,
      cols: undefined,
      current: undefined,
      size: undefined,
      sort:
        params.sort && params.sort.length > 0
          ? params.sort[0].split(' ')[0]
          : undefined,
      dir:
        params.sort && params.sort.length > 0
          ? params.sort[0].split(' ')[1]
          : undefined,
      dep: undefined,
      __v_isRef: undefined,
      __v_isShallow: undefined,
      _rawValue: undefined,
      _value: undefined,
    };
  }, // 用于接口入参转换
  );
};
