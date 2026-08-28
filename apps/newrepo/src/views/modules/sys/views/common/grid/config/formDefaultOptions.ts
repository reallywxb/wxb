import type { VbenFormProps } from '#/adapter/form';

export const formDefaultOptions: VbenFormProps = {
  compact: true,
  layout: 'horizontal',
  commonConfig: {
    labelClass: 'w-[70px]',
  },
  // submitButtonOptions: {
  //   content: '查询',
  //   icon: h(SearchActionIcon, { style: 'margin-bottom: 4px;' }),
  // },
  // resetButtonOptions: {
  //   content: '重置',
  //   icon: h(ResetActionIcon, { style: 'margin-bottom: 4px;' }),
  // },
  // rangeFieldFromSuffix: 'From', // 范围字段起始值后缀
  // rangeFieldToSuffix: 'To', // 范围字段结束值后缀
  // wrapperClass: 'grid-cols-5',
  showCollapseButton: false,
};
