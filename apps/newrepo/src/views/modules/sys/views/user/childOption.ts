import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { $t } from '#/locales'; // 多语言

export const UserRoleFormOptions: any = {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '用户',
      fieldName: 'userId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
      rules: 'required',
    },
    {
      label: '角色',
      fieldName: 'roleId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.role',
        };
      },
      rules: 'required',
    },
    {
      label: '创建人',
      fieldName: 'createdBy',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
      hidden: true,
    },
    {
      label: '创建时间',
      fieldName: 'createTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
      hidden: true,
    },
    {
      label: '机构',
      fieldName: 'orgId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      rules: 'required',
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      component: 'Input',
      defaultValue: 0,
      rules: 'required',
      hidden: true,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};

const useUserRoleGridOptions: (
  handleAction: any,
  parentTableParams?: any,
) => SchemaColumnAndOptions = function (
  handleAction: any,
  parentTableParams: any,
) {
  return {
    gridColumns: [
      {
        fixed: 'left',
        title: '选择',
        type: 'radio',
        width: 50,
        visible: false,
      },
      { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
      {
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '用户',
        field: 'userId',
        formatter: (params: any) => {
          return params.row.userId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 150,
      },
      {
        title: '角色',
        field: 'roleId',
        formatter: (params: any) => {
          return params.row.roleId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 150,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 150,
      },
      {
        title: '创建人',
        field: 'createdBy',
        formatter: (params: any) => {
          return params.row.createdBy_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '租户',
        field: 'tenantId',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view', 'edit', 'delete', 'log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [],
    id: 'sys.userRole',
    dataTableId: 'sys.userRole',
    showToolbar: true,
    commonFormOptions: UserRoleFormOptions,
    showCellMenuIconBtn: true,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: false,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
  };
};

export const UserOrgFormOptions: any = {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '用户',
      fieldName: 'userId',
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
    },
    {
      label: '机构',
      fieldName: 'orgId',
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
    },
    {
      label: '允许修改',
      fieldName: 'allowWrite',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: '允许登录',
      fieldName: 'allowLogin',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: '允许查询下级',
      fieldName: 'allowReadChildren',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '允许修改下级',
      fieldName: 'allowWriteChildren',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '允许登录下级',
      fieldName: 'allowLoginChildren',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否启用',
      fieldName: 'isActive',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: '创建人',
      fieldName: 'createdBy',
      component: 'Input',
      hidden: true,
    },
    {
      label: '创建时间',
      fieldName: 'createTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
      hidden: true,
    },
    {
      label: '修改人',
      fieldName: 'updatedBy',
      component: 'Input',
      hidden: true,
    },
    {
      label: '修改时间',
      fieldName: 'updateTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
      hidden: true,
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      component: 'Input',
      defaultValue: 0,
      rules: 'required',
      hidden: true,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};

const useUserOrgGridOptions: (
  handleAction: any,
  parentTableParams?: any,
) => SchemaColumnAndOptions = function (
  handleAction: any,
  parentTableParams: any,
) {
  return {
    gridColumns: [
      {
        fixed: 'left',
        title: '选择',
        type: 'radio',
        width: 50,
        visible: false,
      },
      { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
      {
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '用户',
        field: 'userId',
        sortable: true,
        minWidth: 30,
        width: 150,
        formatter: (params: any) => {
          return params.row.userId_name;
        },
      },
      {
        title: '机构',
        field: 'orgId',
        sortable: true,
        minWidth: 30,
        width: 150,
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
      },
      {
        title: '允许修改',
        field: 'allowWrite',
        formatter: (params: any) => {
          return params.row.allowWrite ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '允许登录',
        field: 'allowLogin',
        formatter: (params: any) => {
          return params.row.allowLogin ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否启用',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '创建人',
        field: 'createdBy',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '修改人',
        field: 'updatedBy',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '修改时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '允许查询下级',
        field: 'allowReadChildren',
        formatter: (params: any) => {
          return params.row.allowReadChildren ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '允许修改下级',
        field: 'allowWriteChildren',
        formatter: (params: any) => {
          return params.row.allowWriteChildren ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '允许登录下级',
        field: 'allowLoginChildren',
        formatter: (params: any) => {
          return params.row.allowLoginChildren ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '租户',
        field: 'tenantId',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view', 'edit', 'delete', 'log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [],
    id: 'sys.userOrg',
    dataTableId: 'sys.userOrg',
    showToolbar: true,
    commonFormOptions: UserOrgFormOptions,
    showCellMenuIconBtn: true,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: false,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
  };
};

export const UserTenantFormOptions: any = {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.tenant',
        };
      },
      rules: 'required',
    },
    {
      label: '用户',
      fieldName: 'userId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
      rules: 'required',
      hidden: true,
    },
    {
      label: '创建人',
      fieldName: 'createdBy',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
      hidden: true,
    },
    {
      label: '创建时间',
      fieldName: 'createTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
      hidden: true,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};

const useUserTenantGridOptions: (
  handleAction: any,
  parentTableParams?: any,
) => SchemaColumnAndOptions = function (
  handleAction: any,
  parentTableParams: any,
) {
  return {
    gridColumns: [
      {
        fixed: 'left',
        title: '选择',
        type: 'radio',
        width: 50,
        visible: false,
      },
      { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
      {
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '用户',
        field: 'userId',
        formatter: (params: any) => {
          return params.row.userId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 150,
      },
      {
        title: '租户',
        field: 'tenantId',
        formatter: (params: any) => {
          return params.row.tenantId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: true,
      },
      {
        title: '创建人',
        field: 'createdBy',
        formatter: (params: any) => {
          return params.row.createdBy_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view', 'edit', 'delete', 'log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [],
    id: 'sys.userTenant',
    dataTableId: 'sys.userTenant',
    showToolbar: true,
    commonFormOptions: UserTenantFormOptions,
    showCellMenuIconBtn: true,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: false,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
  };
};

export {
  useUserOrgGridOptions,
  useUserRoleGridOptions,
  useUserTenantGridOptions,
};
