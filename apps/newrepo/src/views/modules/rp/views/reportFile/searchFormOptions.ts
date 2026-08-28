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
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: 'datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
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
        fieldName: 'reportGroup',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '报表分组',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'reportCode',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '报表编码',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'documentNo',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '单据编号',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'DateGroup',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'reportTime',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '制表时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'entityType',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '实体类型',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'entityId',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '实体ID',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
