<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import { updatePersonByCode, updatePersonByRole } from '../api';

const modalOuterData = ref();
const modalTitle = ref('');

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  showCancelButton: true,
  cancelText: '返回',
  confirmText: '提交',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    // modalOuterData.value.handleBatchChoose(
    //   ChcGridApi.grid.getCheckboxRecords(),
    // );
    // modalApi.close();
    const type = currentType.value;
    const gridApi = currentGridApi.value;
    const records = gridApi.grid.getCheckboxRecords();
    if (records.length === 0) {
      message.error('请选择新增统方敏感人员');
      return;
    }
    if (type === 'role') {
      const ids = records.map((item: any) => item.id);
      const params = {
        ids: ids.join(','),
      };
      await updatePersonByRole(params);
    } else if (type === 'account') {
      const personAccessList = records.map((item: any) => ({
        userId: item.id,
        userCode: item.userCode,
        userName: item.userName,
      }));
      const params = {
        personAccess: JSON.stringify(personAccessList),
      };
      await updatePersonByCode(params);
    }
    message.success('新增成功');
    modalApi.close();
    modalOuterData.value?.callback();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>() || {};
      modalOuterData.value = modalData;
      const commonTitle = '新增统方敏感人员';
      modalTitle.value =
        modalOuterData.value.type === 'role'
          ? `${commonTitle}-按角色`
          : `${commonTitle}-按账号`;
      // setTimeout(() => {
      //   ChcGridApi.setGridOptions({
      //     columns:
      //       modalOuterData.value.type === 'role'
      //         ? gridColumnsToRole
      //         : gridColumnsToAccount,
      //   });
      // }, 0);
    }
  },
});
const searchForm = ref({
  roleName: undefined, // 角色
  userName: undefined, // 账号
});

// 按角色的 Grid
const [RoleGrid, RoleGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: { autoLoad: false },
      checkboxConfig: {},
      pagerConfig: { enabled: true },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'name',
        minWidth: 110,
        sortable: true,
        title: '角色名称',
        formatter: ({ row }: any) => {
          // 当已添加账号数量=未添加账号数量时，此角色名称不展示
          return row.yesNum === row.noNum ? '' : row.name;
        },
      },
      {
        field: 'description',
        minWidth: 110,
        sortable: true,
        title: '描述',
      },
      {
        field: 'yesNum',
        minWidth: 90,
        sortable: true,
        title: '已添加账号数量',
        align: 'right',
      },
      {
        field: 'noNum',
        minWidth: 90,
        sortable: true,
        title: '未添加账号数量',
        align: 'right',
      },
    ],
    id: 'gridToRole',
    queryUrl: '/aptAction/queryUserForRole',
    tableSearchExtraParams: searchForm.value,
    afterFetchFn: (params) => {
      const rows = params.data?.map((item: any) => ({ ...item })) || [];
      return { ...params, records: rows };
    },
  },
);
// 按账号的 Grid
const [AccountGrid, AccountGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: { autoLoad: false },
      checkboxConfig: {},
      pagerConfig: { enabled: true },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'userName',
        minWidth: 110,
        sortable: true,
        title: '姓名',
      },
      {
        field: 'userCode',
        minWidth: 110,
        sortable: true,
        title: '登录名称',
      },
      {
        field: 'userTypeName',
        minWidth: 110,
        sortable: true,
        title: '用户类型',
      },
      {
        field: 'roleName',
        minWidth: 130,
        sortable: true,
        title: '角色',
      },
    ],
    id: 'gridToAccount',
    queryUrl: '/aptAction/queryUserForCode',
    tableSearchExtraParams: searchForm.value,
    afterFetchFn: (params) => {
      const rows = params.data?.map((item: any) => ({ ...item })) || [];
      return { ...params, records: rows };
    },
  },
);

const currentType = computed(() => modalOuterData.value?.type);
const currentGridApi = computed(() =>
  currentType.value === 'role' ? RoleGridApi : AccountGridApi,
);

// 查询
async function handleSearch() {
  // 区分角色还是账户查询
  const params =
    currentType.value === 'role'
      ? { roleName: searchForm.value.roleName }
      : { userName: searchForm.value.userName };
  currentGridApi.value.query(params);
}
</script>
<template>
  <Modal
    class="h-[600px] w-[60%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    :title="modalTitle"
  >
    <div class="h-full">
      <component :is="currentType === 'role' ? RoleGrid : AccountGrid">
        <template #toolbar-actions>
          <template v-if="currentType === 'role'">
            <label for="" class="mr-2">角色:</label>
            <Input
              placeholder="请输入角色名称"
              v-model:value="searchForm.roleName"
              class="mr-[6px] w-[280px]"
              allow-clear
              @keyup.enter="handleSearch"
            />
          </template>
          <template v-else>
            <label for="" class="mr-2">账号:</label>
            <Input
              placeholder="姓名/登录名称"
              v-model:value="searchForm.userName"
              class="mr-[6px] w-[280px]"
              allow-clear
              @keyup.enter="handleSearch"
            />
          </template>
          <Button type="primary" @click="handleSearch">查询</Button>
        </template>
      </component>
    </div>
  </Modal>
</template>
<style scoped>
/* ::v-deep(.vxe-table--render-default .vxe-cell--checkbox.is--disabled) {
  color: #929292;
} */

::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>
