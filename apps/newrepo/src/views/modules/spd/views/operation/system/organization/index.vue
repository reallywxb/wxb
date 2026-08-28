<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

import { AddActionIcon, EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { activeOrg, getRefEntID } from './api';
import addModalUI from './modals/addModal.vue';
import editModalUI from './modals/editModal.vue';
import settingModalUI from './modals/settingModal.vue';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const extParams = ref<any>({});
const router = useRouter();

const [addModal, addModalApi] = useVbenModal({
  connectedComponent: addModalUI,
});

const [editModal, editModalApi] = useVbenModal({
  connectedComponent: editModalUI,
});

const [settingModal, settingModalApi] = useVbenModal({
  connectedComponent: settingModalUI,
});
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/openAccountAction/queryOrgList.do?hiddenOrgId=0',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'ClientName', title: '租户名称', minWidth: '120' },
      { field: 'OrgName', title: '机构名称', minWidth: '140', sortable: true },
      {
        field: 'PrintName',
        title: '机构简称',
        minWidth: '120',
        sortable: true,
      },
      { field: 'Value', title: '机构编码', minWidth: '120', sortable: true },
      {
        field: 'ServerName',
        title: 'HIS系统',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'ProductServerName',
        title: '主数据系统',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'IsActive',
        title: '是否有效',
        align: 'center',
        minWidth: '90',
        sortable: true,
        slots: { default: 'IsActive' },
      },
      {
        field: 'UserCount',
        title: '用户数量',
        align: 'right',
        minWidth: '70',
        slots: { default: 'UserCount' },
        sortable: false,
      },
      {
        field: 'RoleCount',
        title: '角色数量',
        align: 'right',
        minWidth: '70',
        slots: { default: 'RoleCount' },

        sortable: false,
      },
      {
        field: 'WarehousePolicyCount',
        title: '作业策略数量',
        align: 'right',
        minWidth: '100',
        slots: { default: 'WarehousePolicyCount' },

        sortable: false,
      },
      {
        field: 'DepartmentCount',
        title: '科室病区数量',
        align: 'right',
        minWidth: '100',
        slots: { default: 'DepartmentCount' },
        sortable: false,
      },
      {
        field: 'IsConsortiumName',
        title: '是否医共体',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'RefEntID',
        title: '码上放心RefEntID',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'EntID',
        title: '码上放心EntID',
        minWidth: '120',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 280,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'Name',
        label: '机构',
        componentProps: {
          placeholder: '机构编码或名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            defaultValue: 'Y',
            options: [
              { value: '', label: '全选' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'IsActive',
        label: '是否有效',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
    afterFetchFn: (params) => {
      const rows =
        params.rows?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        isActive: params.isActive ? 'Y' : undefined,
      };
    },
  },
);

onMounted(() => {
  handleQuery();
});

const handleEdit = (scope: any) => {
  editModalApi.setData(scope.row).open();
};

const handleAdd = () => {
  addModalApi.open();
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

const handleActiveSwitchChange = (row: any, checked: string) => {
  const params = {
    ...row,
    IsActive: checked,
  };
  activeOrg(params).then((res: any) => {
    if (res && res.success) {
      message.success('操作成功');
      handleQuery();
    }
  });
};

const handleToDetail = (row: any, path: string) => {
  router.push({
    path,
    query: {
      autoLoad: 'Y',
      isReload: 'Y',
      AD_Org_ID: row.AD_Org_ID,
    },
  });
};

const handleSetting = (scope: any) => {
  settingModalApi.setData(scope.row).open();
};

const handleGetRefEntID = (scope: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认获取码上放心码？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      getRefEntID({ orgId: scope.row.AD_Org_ID }).then((res: any) => {
        if (res && res.success) {
          message.success('操作成功');
          handleQuery();
        }
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <addModal @close="handleQuery" />
    <editModal @close="handleQuery" />
    <settingModal @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAdd"
            class="mr-[0.5rem]"
            data-testid="button_add"
          >
            新 建
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
        </template>
        <template #IsActive="{ row }">
          <Switch
            :checked="row.IsActive"
            @change="(checked: any) => handleActiveSwitchChange(row, checked)"
            checked-value="Y"
            checked-children="是"
            un-checked-value="N"
            un-checked-children="否"
            :data-testid="`switch_IsActive_${row._rowIndex}`"
          />
        </template>
        <template #UserCount="{ row }">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleToDetail(row, '/operation/system/user')"
            :data-testid="`button_UserCount_${row._rowIndex}`"
          >
            {{ row.UserCount }}
          </a>
        </template>
        <template #RoleCount="{ row }">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleToDetail(row, '/operation/system/role')"
            :data-testid="`button_RoleCount_${row._rowIndex}`"
          >
            {{ row.RoleCount }}
          </a>
        </template>
        <template #WarehousePolicyCount="{ row }">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="
              handleToDetail(row, '/operation/strategyConfig/warehousePolicy')
            "
            :data-testid="`button_WarehousePolicyCount_${row._rowIndex}`"
          >
            {{ row.WarehousePolicyCount }}
          </a>
        </template>
        <template #DepartmentCount="{ row }">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleToDetail(row, '/operation/system/department')"
            :data-testid="`button_DepartmentCount_${row._rowIndex}`"
          >
            {{ row.DepartmentCount }}
          </a>
        </template>

        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
            :data-testid="`button_edit_${scope.rowIndex}`"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleSetting(scope)"
            :data-testid="`button_setting_${scope.rowIndex}`"
          >
            机构配置
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleGetRefEntID(scope)"
            :data-testid="`button_getentID_${scope.rowIndex}`"
          >
            获取entID
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
  </Page>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
