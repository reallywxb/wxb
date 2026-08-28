import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { $t } from '#/locales';
// 多语言
export const getFormOptions: (mode: string) => any = function (mode: string) {
  return {
    schema: [
      {
        label: '编号',
        fieldName: 'id',
        component: 'Input',
        rules: 'required',
        hidden: true,
      },
      {
        label: '所属机构',
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
        label: '所属部门',
        fieldName: 'deptId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.dept',
          };
        },
      },
      {
        label: '姓名',
        fieldName: 'name',
        component: 'Input',
      },
      {
        label: '登录名',
        fieldName: 'username',
        component: 'Input',
        rules: 'required',
      },
      {
        label: '密码',
        fieldName: 'password',
        component: 'Input',
        dependencies: {
          show() {
            return mode === 'add';
          },
          triggerFields: ['password'],
        },
      },
      {
        label: '用户类型',
        fieldName: 'userType',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/sys.user.userType',
          };
        },
        rules: 'required',
      },
      {
        label: '数据授权范围',
        fieldName: 'dataScope',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/sys.user.dataScope',
          };
        },
        rules: 'required',
      },
      {
        label: '引用编码',
        fieldName: 'refCode',
        component: 'Input',
      },
      {
        label: '引用名称',
        fieldName: 'refName',
        component: 'Input',
      },
      {
        label: '头像',
        fieldName: 'avatar',
        component: 'Input',
        formItemClass: 'col-span-2',
      },
      {
        label: '性别',
        fieldName: 'sex',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/sys.user.sex',
          };
        },
      },
      {
        label: '身份证号',
        fieldName: 'idcard',
        component: 'Input',
      },
      {
        label: '固话',
        fieldName: 'phone',
        component: 'Input',
      },
      {
        label: '手机',
        fieldName: 'mobile',
        component: 'Input',
      },
      {
        label: '邮箱',
        fieldName: 'email',
        component: 'Input',
      },
      {
        label: '用户编码',
        fieldName: 'code',
        component: 'Input',
      },
      {
        label: '是否管理员',
        fieldName: 'isAdmin',
        component: 'Switch',
        componentProps: {
          class: 'w-[50px]',
        },
        defaultValue: false,
        rules: 'required',
      },
      {
        label: '冻结时间',
        fieldName: 'lockTime',
        component: 'DatePicker',
        componentProps: () => {
          return {
            showTime: true,
            valueFormat: 'YYYY-MM-DD HH:mm',
            format: 'YYYY-MM-DD HH:mm',
          };
        },
        dependencies: {
          show() {
            return mode === 'view';
          },
          triggerFields: ['lockTime'],
        },
      },
      {
        label: '是否冻结',
        fieldName: 'isLocked',
        component: 'Switch',
        componentProps: {
          class: 'w-[50px]',
        },
        defaultValue: false,
        rules: 'required',
      },
      {
        label: '是否有效',
        fieldName: 'isActive',
        component: 'Switch',
        componentProps: {
          class: 'w-[50px]',
        },
        defaultValue: true,
        rules: 'required',
      },
      {
        label: '备注',
        fieldName: 'remark',
        component: 'Input',
        formItemClass: 'col-span-2',
      },
      {
        label: '上次登录机构',
        fieldName: 'lastLoginOrgId',
        component: 'Input',
        hidden: true,
      },
      {
        label: '上次登录时间',
        fieldName: 'lastLoginTime',
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
        label: '上次登录IP',
        fieldName: 'lastLoginIp',
        component: 'Input',
        formItemClass: 'col-span-2',
        hidden: true,
      },
      {
        label: '登录失败次数',
        fieldName: 'loginFailCount',
        component: 'Input',
        defaultValue: 0,
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
      {
        label: '修改人',
        fieldName: 'updatedBy',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.user',
          };
        },
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
        label: '密码修改日期',
        fieldName: 'passwordDate',
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
        label: '密码强度',
        fieldName: 'passwordLevel',
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
};

const useGridOptions: (
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
        title: '编号',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '所属机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '所属部门',
        field: 'deptId',
        formatter: (params: any) => {
          return params.row.deptId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '姓名',
        field: 'name',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '登录名',
        field: 'username',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '用户类型',
        field: 'userType',
        formatter: (params: any) => {
          return params.row.userType_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '数据授权范围',
        field: 'dataScope',
        formatter: (params: any) => {
          return params.row.dataScope_name;
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '引用编码',
        field: 'refCode',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '引用名称',
        field: 'refName',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '头像',
        field: 'avatar',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '性别',
        field: 'sex',
        formatter: (params: any) => {
          return params.row.sex_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '身份证号',
        field: 'idcard',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '固话',
        field: 'phone',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '手机',
        field: 'mobile',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '邮箱',
        field: 'email',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '用户编码',
        field: 'code',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否管理员',
        field: 'isAdmin',
        formatter: (params: any) => {
          return params.row.isAdmin ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 100,
      },
      {
        title: '冻结时间',
        field: 'lockTime',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否冻结',
        field: 'isLocked',
        formatter: (params: any) => {
          return params.row.isLocked ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否有效',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '备注',
        field: 'remark',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '上次登录机构',
        field: 'lastLoginOrgId',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '上次登录时间',
        field: 'lastLoginTime',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '上次登录IP',
        field: 'lastLoginIp',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '登录失败次数',
        field: 'loginFailCount',
        sortable: true,
        minWidth: 30,
        width: 120,
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
        title: '修改人',
        field: 'updatedBy',
        formatter: (params: any) => {
          return params.row.updatedBy_name;
        },
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
        title: '密码修改日期',
        field: 'passwordDate',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '密码强度',
        field: 'passwordLevel',
        sortable: true,
        minWidth: 30,
        width: 90,
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
    formSchema: [
      {
        label: '所属机构',
        fieldName: 'orgId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.org',
          };
        },
      },
      {
        label: '所属部门',
        fieldName: 'deptId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.dept',
          };
        },
      },
      {
        label: '姓名',
        fieldName: 'name',
        component: 'Input',
      },
      {
        label: '登录名',
        fieldName: 'username',
        component: 'Input',
      },
      {
        label: '用户类型',
        fieldName: 'userType',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/sys.user.userType',
          };
        },
      },
      {
        label: '手机',
        fieldName: 'mobile',
        component: 'Input',
      },
      {
        label: '用户编码',
        fieldName: 'code',
        component: 'Input',
      },
      {
        label: '是否有效',
        fieldName: 'isActive',
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
              value: 'false',
            },
          ],
          placeholder: '请选择',
        },
      },
    ],
    id: 'sys.user',
    dataTableId: 'sys.user',
    showToolbar: true,
    addFormOptions: getFormOptions('add'),
    editFormOptions: getFormOptions('edit'),
    viewFormOptions: getFormOptions('view'),
    showCellMenuIconBtn: true,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: true,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
  };
};
export { useGridOptions };
