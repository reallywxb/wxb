import type { VbenFormProps } from '#/adapter/form';

import { h } from 'vue';

import { ResetActionIcon, SearchActionIcon } from '@vben/chc-icons';

export const formDefaultOptions: VbenFormProps = {
  compact: true,
  commonConfig: {
    labelClass: 'w-[80px]',
  },
  submitButtonOptions: {
    content: '查询',
    icon: h(SearchActionIcon, {
      style: 'margin-bottom: 4px;',
    }),
    'data-testid': 'button_search',
  },
  resetButtonOptions: {
    content: '重置',
    icon: h(ResetActionIcon, {
      style: 'margin-bottom: 4px;',
    }),
    'data-testid': 'button_reset',
  },
  rangeFieldFromSuffix: 'From', // 范围字段起始值后缀
  rangeFieldToSuffix: 'To', // 范围字段结束值后缀
  // wrapperClass: 'grid-cols-5',
  // showCollapseButton: true,
};
