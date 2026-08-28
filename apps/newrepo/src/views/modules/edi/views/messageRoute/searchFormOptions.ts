import type { VbenFormProps } from '@vben/common-ui';

export const primarySearchFormOptions = {
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  arrayToStringFields: ['noticeTime'],
  showCollapseButton: false,
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/dict/edi.message.msgType',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'msgType',
      label: '消息类型',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: 'datatable/dict/table:edi.site.id',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'fromSiteId',
      label: '发送站点',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: 'datatable/dict/table:edi.site.id',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'toSiteId',
      label: '路由站点',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
  ],
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
} as VbenFormProps;
