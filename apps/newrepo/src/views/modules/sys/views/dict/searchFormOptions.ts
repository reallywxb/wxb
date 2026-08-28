import type { VbenFormProps } from '@vben/common-ui';

export const searchFormOptions: VbenFormProps = {
  actionWrapperClass: 'formActionAreaStyle',
  showCollapseButton: false,
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入字典编码',
      },
      fieldName: 'id',
      label: '字典编码',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入名称',
      },
      fieldName: 'name',
      label: '名称',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [
          {
            label: '全部',
            value: undefined,
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
      fieldName: 'isSystem',
      label: '系统字典',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: undefined,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [
          {
            label: '全部',
            value: undefined,
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
      label: '有效状态',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: undefined,
    },
  ],
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
