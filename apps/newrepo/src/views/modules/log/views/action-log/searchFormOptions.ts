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
        label: '日志时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'title',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '日志标题',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/log.actionLog.type',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'type',
        label: '日志类型',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },

      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'requestUri',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '请求地址',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'createdByName',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '操作人名',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
