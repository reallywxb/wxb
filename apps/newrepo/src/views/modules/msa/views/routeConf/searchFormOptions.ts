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
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        label: '路由名称',
        fieldName: 'routeName',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        label: '路由ID',
        fieldName: 'routeId',
        formItemClass: 'pl-[10px] pr-[10px]',
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
        label: '是否有效',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
    ],
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
