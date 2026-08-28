import type { VbenFormProps } from '@vben/common-ui';

export const searchFormOptions: VbenFormProps = {
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'code',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '租户编码',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '租户名称',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
      },
      fieldName: 'isActive',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '是否启用',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
  ],
  showCollapseButton: false,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
