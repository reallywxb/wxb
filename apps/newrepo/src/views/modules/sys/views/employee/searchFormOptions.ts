import type { VbenFormProps } from '@vben/common-ui';

export const searchFormOptions: VbenFormProps = {
  actionWrapperClass: 'formActionAreaStyle',
  showCollapseButton: true,
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/dict/entity:sys.org',
        placeholder: '请选择',
        paginate: false,
        afterFetch: (records: any) => ({ records }),
        showChooseAll: '',
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
        dictUrl: '/datatable/dict/entity:sys.dept',
        placeholder: '请选择',
        paginate: false,
        afterFetch: (records: any) => ({ records }),
        showChooseAll: '',
      }),
      fieldName: 'deptId',
      label: '部门',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入角色编码',
      },
      fieldName: 'name',
      label: '姓名',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入角色名称',
      },
      fieldName: 'employeeCode',
      label: '员工编码',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/dict/sys.employee.employeeType',
        placeholder: '请选择',
        paginate: false,
        afterFetch: (records: any) => ({ records }),
        showChooseAll: '',
      }),
      fieldName: 'employeeType',
      label: '员工类别',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/pageDict/entity:sys.user',
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
      }),
      fieldName: 'userId',
      label: '登录用户',
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
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
      },
      fieldName: 'isActive',
      label: '是否启用',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
  ],
  collapsed: true,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
