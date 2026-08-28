import type { VbenFormProps } from '@vben/common-ui';

export const primarySearchFormOptions: VbenFormProps = {
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
      fieldName: 'name',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '站点名称',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'siteCode',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '站点编码',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/sys/org/orgList',
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
        dictUrl: '/datatable/getDict/edi.site.siteType',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'siteType',
      label: '站点类型',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/edi.site.siteCategory',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'siteCategory',
      label: '站点类别',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
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
  showCollapseButton: true,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};

export const siteWarehouseSearchFormOptions: VbenFormProps = {
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/sys/org/orgList',
        placeholder: '请选择',
        // paginate: false,
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
export const siteUsersSearchFormOptions: VbenFormProps = {
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
      label: '用户编码',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'openId',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: 'Open ID',
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
      label: '姓名',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'deptCode',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '部门编码',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'mobile',
      formItemClass: 'pl-[10px] pr-[10px]',
      label: '手机',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ],
  showCollapseButton: true,
  collapsed: true,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
