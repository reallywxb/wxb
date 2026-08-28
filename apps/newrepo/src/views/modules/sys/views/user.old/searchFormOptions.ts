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
        placeholder: '请输入员工名称',
      },
      fieldName: 'name',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '员工名称',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入登录名',
      },
      fieldName: 'username',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '登录名',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ],
  showCollapseButton: false,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
