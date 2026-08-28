<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui'; // 页面组件

import { useChcGrid } from '#/adapter/chc-ui'; // 导入生成表格的hook
import { $t } from '#/locales'; // 多语言

import { addFormOptions, viewFormOptions } from './formOptions'; // 导入新增编辑和查看弹窗的表单配置

const deptIdDependencies = ref({ orgId: '' });
const [ChcGrid, ChcGridApi] = useChcGrid(
  {
    formOptions: {
      commonConfig: {
        labelClass: 'w-[60px]',
      },
    },
  },
  {
    // TODOs 后续需要处理cols参数逻辑
    // cols: [
    //   { id: 'id' },
    //   { dict: true, id: 'orgId' },
    //   { dict: true, id: 'deptId' },
    //   { id: 'name' },
    //   { id: 'username' },
    //   { dict: true, id: 'userType' },
    //   { dict: true, id: 'dataScope' },
    //   { id: 'code' },
    //   { id: 'avatar' },
    //   { dict: true, id: 'sex' },
    //   { id: 'mobile' },
    //   { id: 'email' },
    //   { id: 'isLocked' },
    //   { id: 'lockTime' },
    //   { id: 'isActive' },
    //   { id: 'remark' },
    //   { id: 'lastLoginTime' },
    //   { id: 'loginFailCount' },
    //   { id: 'createTime' },
    // ],
    gridColumns: [
      { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
      {
        field: 'id',
        minWidth: 100,
        sortable: true,
        title: '用户',
        key: true,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'deptId',
        formatter: (params: any) => {
          return params.row.deptId_name;
        },
        minWidth: 100,
        sortable: true,
        title: '部门',
      },
      { field: 'name', minWidth: 100, sortable: true, title: '姓名' },
      { field: 'username', minWidth: 100, sortable: true, title: '登录名' },
      { field: 'userType', minWidth: 120, sortable: true, title: '用户类型' },
      {
        field: 'dataScope',
        formatter: (params: any) => {
          return params.row.dataScope_name;
        },
        minWidth: 120,
        sortable: true,
        title: '机构权限',
      },
      { field: 'code', minWidth: 120, sortable: true, title: '用户编码' },
      { field: 'avatar', minWidth: 100, sortable: true, title: '头像' },
      {
        field: 'sex',
        formatter: (params: any) => {
          return params.row.sex_name;
        },
        minWidth: 60,
        sortable: true,
        title: '性别',
      },
      { field: 'mobile', minWidth: 100, sortable: true, title: '手机' },
      { field: 'email', minWidth: 100, sortable: true, title: '邮箱' },
      {
        field: 'isLocked',
        formatter: (params: any) => {
          return params.row.isLocked ? '是' : '否';
        },
        minWidth: 90,
        sortable: true,
        title: '是否冻结',
      },
      { field: 'lockTime', minWidth: 120, sortable: true, title: '冻结时间' },
      {
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        minWidth: 90,
        sortable: true,
        title: '是否有效',
      },
      { field: 'remark', minWidth: 100, sortable: true, title: '备注' },
      {
        field: 'lastLoginTime',
        minWidth: 160,
        sortable: true,
        title: '上次登录时间',
      },
      {
        field: 'loginFailCount',
        minWidth: 120,
        sortable: true,
        title: '登录失败次数',
        align: 'right',
      },
      {
        field: 'createTime',
        minWidth: 160,
        sortable: true,
        title: '创建时间',
      },
      {
        align: 'center',
        cellRender: {
          attrs: {
            onClick: onActionClick,
          },
          name: 'CustomCellMenu',
          options: [
            'view',
            'edit',
            'delete',
            'log',
            {
              code: 'resetPassword',
              text: '重置密码',
            },
          ],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 256,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/sys/org/pageOrgList',
            showSearch: true,
            placeholder: '请选择',
            allowClear: true,
            paginate: true,
            filterByFrontEnd: false,
            showChooseAll: '',
            immediate: true,
            'data-testid': 'ChcSelect-orgId', // 用于UI自动化的属性
          };
        },
        defaultValue: '',
        fieldName: 'orgId',
        label: '机构',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            'data-testid': 'ChcSelect-deptId', // 用于UI自动化的属性
            onlySearchDataWhenDependencesChange: true,
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            dictUrl: 'sys/dept/deptList/{{orgId}}', // 数据接口地址
            showSearch: true,
            triggerFields: ['orgId'],
            triggerFieldKeys: {
              orgId: 'orgId',
            },
            filterByFrontEnd: true,
            dependencies: deptIdDependencies.value,
            // filterField: 'label',
            // onSearch: (val: any) => {
            //   ChcGridApi.formApi.getFieldComponentRef('deptId').params.query =
            //     val;
            //   ChcGridApi.formApi.getFieldComponentRef('deptId').params.current =
            //     1;
            //   ChcGridApi.formApi?.getFieldComponentRef('deptId')?.fetchApi();
            // },
            // refreshOptionsWhenOpenDropdown: false,

            formatInterfaceData: (data: any) => {
              return { records: data };
            },
          };
        },
        dependencies: {
          triggerFields: ['orgId'],
          trigger(values: any) {
            deptIdDependencies.value.orgId = values.orgId;
            ChcGridApi.formApi?.setFieldValue?.('deptId', undefined);
          },
        },
        fieldName: 'deptId',
        label: '部门',
      },
      {
        component: 'Input',
        componentProps: {
          'data-testid': 'Input-name', // 用于UI自动化的属性
        },
        fieldName: 'name',
        label: '姓名',
      },
      {
        component: 'Input',
        componentProps: {
          'data-testid': 'Input-username', // 用于UI自动化的属性
        },
        fieldName: 'username',
        label: '登录名',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            'data-testid': 'ChcSelect-userType', // 用于UI自动化的属性
            dictUrl: '/datatable/getDict/sys.user.userType',
            paginate: false,
            // afterFetch(data: any[]) {
            //   // console.log('afterFetch', data);

            //   return { records: data };
            // },
          };
        },
        fieldName: 'userType',
        label: '用户类型',
      },
      {
        component: 'Input',
        componentProps: {
          'data-testid': 'Input-code', // 用于UI自动化的属性
        },
        fieldName: 'code',
        label: '用户编码',
      },
      {
        component: 'Input',
        componentProps: {
          'data-testid': 'Input-mobile', // 用于UI自动化的属性
        },
        fieldName: 'mobile',
        label: '手机',
      },
      {
        component: 'Select',
        componentProps: {
          'data-testid': 'Select-isLocked', // 用于UI自动化的属性
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
        fieldName: 'isLocked',
        label: '是否冻结',
      },
      {
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
          'data-testid': 'Select-isActive', // 用于UI自动化的属性
        },
        fieldName: 'isActive',
        label: '是否有效',
      },
    ],
    id: 'sys.user',
    permissions: {
      // edit: 'sys.user.edit1',
      // delete: 'sys.user.delete',
      log: 'sys.user.delete',
      export: 'sys.user.delete',
    },
    dataTableId: 'sys.user',
    showToolbar: true,
    commonFormOptions: addFormOptions,
    viewFormOptions,
    showCellMenuIconBtn: false,
    showAddBtn: true,
    showExportBtn: true,
  },
);

function onActionClick({ code, row }: OnActionClickParams) {
  switch (code) {
    case 'resetPassword': {
      handleResetPassword(row);
      break;
    }

    default: {
      break;
    }
  }
}
function handleResetPassword(row: any) {
  console.warn(row);
}
</script>

<template>
  <Page auto-content-height content-class="p-[0.5rem]" header-class="px-3 py-2">
    <ChcGrid />
  </Page>
</template>
