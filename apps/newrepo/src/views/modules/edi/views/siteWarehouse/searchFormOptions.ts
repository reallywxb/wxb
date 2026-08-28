import type { VbenFormProps } from '@vben/common-ui';

export const primarySearchFormOptions: VbenFormProps = {
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/entity:edi.site',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'siteId',
      label: '站点',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/entity:sys.org',
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
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/entity:md.warehouse',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'warehouseId',
      label: '仓库',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
  ],
  showCollapseButton: false,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
