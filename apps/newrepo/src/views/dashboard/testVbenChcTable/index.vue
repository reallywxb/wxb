<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { VbenChcTable } from '#/adapter/vxe-table.js';

const deptIdDependencies = ref({ orgId: '' });
const searchFormSchema = ref([
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
        formatInterfaceData: (data: any) => {
          return { records: data };
        },
      };
    },
    dependencies: {
      triggerFields: ['orgId'],
      trigger(values: any) {
        deptIdDependencies.value.orgId = values.orgId;
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
]);
const handleChangeForm = () => {
  searchFormSchema.value.pop();
};
function handleEdit(e: MouseEvent, scope: any) {
  console.warn('handleEdit:', e, scope);
}
</script>
<template>
  <Page auto-content-height content-class="p-[0.5rem]" header-class="px-3 py-2">
    <VbenChcTable
      id="123"
      :form-constructor="useVbenForm"
      :search-form-schema="searchFormSchema"
    >
      <template #action="scope">
        <Button @click="handleEdit($event, scope)">编辑</Button>
      </template>
      <template #toolbar-tools>
        <Button @click="handleChangeForm">切换表单</Button>
      </template>
      <template #toolbar-actions>
        <Button @click="handleChangeForm">切换表单</Button>
      </template>
    </VbenChcTable>
  </Page>
</template>
<style scoped></style>
