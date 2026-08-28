import type { VbenFormProps } from '#/adapter/form';

import { h } from 'vue';

import { ResetActionIcon, SearchActionIcon } from '@vben/chc-icons';

export const formDefaultOptions: VbenFormProps = {
  compact: true,
  layout: 'horizontal',
  submitButtonOptions: {
    content: '查询',
    icon: h(SearchActionIcon, { style: 'margin-bottom: 4px;' }),
  },
  resetButtonOptions: {
    content: '重置',
    icon: h(ResetActionIcon, { style: 'margin-bottom: 4px;' }),
  },
  // wrapperClass: 'grid-cols-5',
};
