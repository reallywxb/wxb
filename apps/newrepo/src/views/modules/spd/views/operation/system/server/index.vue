<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { activeServer } from './api';
import typeModalUI from './modals/typeModal.vue';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const extParams = ref<any>({});

const [typeModal, typeModalApi] = useVbenModal({
  connectedComponent: typeModalUI,
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
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/serverAction/query.do?IsHideSelfServer=Y',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'AD_Server_ID',
        title: 'AD_Server_ID',
        visible: false,
        sortable: true,
      },
      {
        field: 'AD_Client_ID',
        title: 'AD_Client_ID',
        visible: false,
        sortable: true,
      },
      {
        field: 'AD_Org_ID',
        title: 'AD_Org_ID',
        visible: false,
        sortable: true,
      },
      {
        field: 'clientName',
        title: '集团',
        width: '80',
        visible: false,
        sortable: true,
      },
      {
        field: 'orgName',
        title: '机构',
        width: '80',
        visible: false,
        sortable: true,
      },
      { field: 'Name', title: '名称', minWidth: '140', sortable: true },
      { field: 'Value', title: '编码', minWidth: '120', sortable: true },
      { field: 'Protocol', title: '协议', minWidth: '80', sortable: true },
      {
        field: 'HostAddress',
        title: '主机地址',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'HostPort',
        title: '主机端口',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'ServerPath',
        title: '服务器路径',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'IsActive',
        title: '是否有效',
        align: 'center',
        width: '100',
        sortable: true,
        slots: { default: 'IsActive' },
      },
      { field: 'PublicKey', title: '公钥', minWidth: '80', sortable: true },
      {
        field: 'ServerUser',
        title: '服务器用户',
        minWidth: '100',
        sortable: true,
      },
      { field: 'Password', title: '密码', minWidth: '80', sortable: true },
      { field: 'Description', title: '描述', minWidth: '300', sortable: true },
      { field: 'Param', title: '扩展参数', minWidth: '100', sortable: false },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'key',
        label: '系统',
        componentProps: {
          placeholder: '系统名称或编码',
        },
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

const typeData = ref<any>({});

const handleEdit = (scope: any) => {
  typeData.value = scope.row;
  typeModalApi.setData(typeData.value).open();
};

const handleAdd = () => {
  typeData.value = {};
  typeModalApi.setData({ IsActive: 'Y' }).open();
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
  activeServer(params).then((res: any) => {
    if (res && res.success) {
      message.success('操作成功');
      handleQuery();
    }
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <typeModal :type-data="typeData" @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAdd"
            class="mr-[0.5rem]"
            data-testid="button_add_server"
          >
            新 建
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
        </template>
        <template #IsActive="scope">
          <Switch
            :checked="scope.row.IsActive"
            @change="
              (checked: any) => handleActiveSwitchChange(scope.row, checked)
            "
            checked-value="Y"
            checked-children="是"
            un-checked-value="N"
            un-checked-children="否"
            :data-testid="`switch_IsActive_${scope.rowIndex}`"
          />
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
