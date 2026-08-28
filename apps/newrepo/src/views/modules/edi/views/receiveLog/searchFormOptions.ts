import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api';

export const primarySearchFormOptions = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    layout: 'horizontal',
    commonConfig: {
      labelWidth: 70,
    },
    arrayToStringFields: ['noticeTime'],
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
        fieldName: 'requestTime',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '调用时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/dict/itemList/table:edi.site.id',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteId',
        label: '来源站点',
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
        fieldName: 'serviceName',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '接口名称',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'msgNo',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '消息编号',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Select',
        componentProps: () => ({
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: true, label: '是' },
            { value: false, label: '否' },
          ],
          placeholder: '请选择',
        }),
        defaultValue: '',
        fieldName: 'isSuccess',
        label: '是否成功',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
