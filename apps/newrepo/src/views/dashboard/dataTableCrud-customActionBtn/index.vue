<script lang="ts" setup>
import { ref } from 'vue';

import { useAccess } from '@vben/access'; // 权限相关的hook
import {
  EditActionIcon,
  MdiDotsHorizontal,
  SvgDeleteIcon,
  viewActionIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui'; // 页面组件

import { Button, Dropdown, Menu, MenuItem } from 'ant-design-vue';

import { useChcGrid } from '#/adapter/chc-ui'; // 导入生成表格的hook
import { $t } from '#/locales'; // 多语言

import { addFormOptions, viewFormOptions } from './formOptions'; // 导入新增编辑和查看弹窗的表单配置

const { hasAccessByCodes } = useAccess(); // 用于添加权限判断
const deptIdDependencies = ref({ orgId: '' });
const [
  ChcGrid,
  ChcGridApi,
  { LogModal, FormModal, handleDel, handleView, handleEdit },
] = useChcGrid(
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
        minWidth: 100,
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
        minWidth: 120,
        sortable: true,
        title: '是否冻结',
      },
      { field: 'lockTime', minWidth: 120, sortable: true, title: '冻结时间' },
      {
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        minWidth: 120,
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
        minWidth: 160,
        sortable: true,
        title: '登录失败次数',
      },
      {
        field: 'createTime',
        minWidth: 160,
        sortable: true,
        title: '创建时间',
      },
      {
        align: 'center',
        field: 'action',
        fixed: 'right',
        slots: { default: 'action' },
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
            dependencies: deptIdDependencies.value,
            filterField: 'label',
            onSearch: (val: any) => {
              ChcGridApi.formApi.getFieldComponentRef('deptId').params.query =
                val;
              ChcGridApi.formApi.getFieldComponentRef('deptId').params.current =
                1;
              ChcGridApi.formApi?.getFieldComponentRef('deptId')?.fetchApi();
            },
            refreshOptionsWhenOpenDropdown: false,

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
            afterFetch(data: any[]) {
              return { records: data };
            },
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
    dataTableId: 'sys.user',
    showToolbar: true,
    commonFormOptions: addFormOptions,
    viewFormOptions,
    showCellMenuIconBtn: false,
    showAddBtn: true,
  },
);

function onActionClick({ code, row }: OnActionClickParams) {
  switch (code) {
    case 'delete': {
      handleDel(row);
      break;
    }
    case 'edit': {
      handleEdit(row);
      break;
    }
    case 'view': {
      handleView(row);
      break;
    }
    default: {
      break;
    }
  }
}
const handleMenuClick = (e: any, row: any) => {
  if (e.key === 'view') {
    handleView(row);
  } else if (e.key === 'edit') {
    handleEdit(row);
  }
};
</script>

<template>
  <Page auto-content-height content-class="p-[0.5rem]" header-class="px-3 py-2">
    <FormModal />
    <LogModal />
    <ChcGrid>
      <template #action="scope">
        <div class="table-operations flex justify-center">
          <Button
            ghost
            size="middle"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            type="primary"
            @click="onActionClick({ code: 'view', row: scope.row })"
          >
            查看
            <template #icon>
              <viewActionIcon class="mb-[2px] mr-[-3px]" />
            </template>
          </Button>
          <Button
            ghost
            size="middle"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            type="primary"
            @click="onActionClick({ code: 'edit', row: scope.row })"
            v-access:code="['sys.userOrg.edit']"
          >
            编辑
            <template #icon>
              <EditActionIcon class="mb-[2px] mr-[-3px]" />
            </template>
          </Button>
          <Button
            ghost
            size="middle"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            type="primary"
            danger
            @click="onActionClick({ code: 'delete', row: scope.row })"
            v-if="hasAccessByCodes(['sys.user.delete'])"
          >
            删除
            <template #icon>
              <SvgDeleteIcon class="mb-[2px] mr-[-3px]" />
            </template>
          </Button>
          <Dropdown placement="bottomRight" trigger="click">
            <Button size="small" type="link" class="pl-[5px] pr-[5px]">
              <MdiDotsHorizontal class="text-[18px]" />
            </Button>
            <template #overlay>
              <Menu @click="handleMenuClick($event, scope.row)">
                <MenuItem key="view"> 查看 </MenuItem>
                <MenuItem key="edit"> 编辑 </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </div>
      </template>
    </ChcGrid>
  </Page>
</template>
