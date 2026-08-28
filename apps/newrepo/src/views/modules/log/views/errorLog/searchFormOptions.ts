import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api';

export const primarySearchFormOptions = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    layout: 'horizontal',
    commonConfig: {
      labelClass: 'w-[80px]',
    },
    handleSubmit(values: any) {
      fn().reload(values);
    },
    showCollapseButton: false,
    schema: [
      {
        component: 'DateGroup',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'createTime',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '错误时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'error',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '错误',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'classname',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '类名',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'method',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '方法名',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
