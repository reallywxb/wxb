<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue';

import { AddActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import addModalUi from './addModal/index.vue';
import { delVendorProductControl, modifyVendorProductControl } from './api';
import { columns } from './gridOptions';
import { searchFormSchemas } from './searchFormSchemas';

const [cols, gridColumns] = handleCommonGridColumns(columns);
const bpartnerID = ref<number | string>('');
const userStore = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});
const isFirstLoaded = ref(false); // 是否已初次加载完
const selectedParentRow = ref<any>(null); // 存储选中的父表行数据
const hasSelectedParentRow = computed(() => !!selectedParentRow.value);

// 定义查询控制器 用于控制表格的查询在页面加载后自
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
const [ChcGrid, ChcGridApi, { FormModal, LogModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      showCollapseButton: false,
      fieldMappingTime: [
        ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    // 表格配置
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true, // 选中行时高亮
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    dataTableId: '/vendorAction/query.do?isActive=Y',
    id: 'SupplierProductGroupMaintenanceFa',
    gridColumns: [
      {
        type: 'radio',
        width: 60,
        fixed: 'left',
        visible: false,
        label: '单选',
      },
      ...gridColumns,
    ],
    formSchema: searchFormSchemas,
    cols,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.bpartnerID) {
          parentTableParams.value = { bpartnerID: row.bpartnerID };
          bpartnerID.value = row.bpartnerID;
          selectedParentRow.value = row; // 存储选中的行数据
          roleGridApi.query({ bpartnerID: row.bpartnerID });
        } else {
          selectedParentRow.value = null; // 清除选中
          parentTableParams.value = {};
        }
      },
    },
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [RoleGrid, roleGridApi, { FormModal: RoleFormModal }] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        { field: 'productControlLevelName', title: '商品组' },
        {
          field: 'isActive',
          title: '有效',
          slots: { default: 'activeSwitch' },
          align: 'center',
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: $t('system.menu.operation'),
          width: 230,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    dataTableId: '/vendorAction/queryVendorProductControl.do',
    id: 'SupplierProductGroupMaintenanceCh',
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.bpartnerID)) {
        return false;
      }
      return params;
    },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleDel = (scope: any) => {
  console.warn('删除', scope, parentTableParams.value);
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        const { vendorProductControlId } = scope;
        const params = { vendorProductControlId };
        const response = await delVendorProductControl(params);
        if (response.success) {
          message.success('删除成功');
          await roleGridApi.query({
            bpartnerID: parentTableParams.value.bpartnerID,
          });
        } else {
          message.error(response.msg || '删除失败');
        }
      } catch {
        message.error('删除失败');
      }
    },
  });
};

const [addModal, addModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addModalUi,
  draggable: true,
});

// 新增 编辑 表单提交之后执行
function refreshTable() {
  ChcGridApi.query();
}

const handleAdd = () => {
  addModalApi
    .setData({
      ChcGridApi,
      roleGridApi,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
        bpartnerID: parentTableParams.value.bpartnerID || 1,
      },
      selectedParentRow: selectedParentRow.value,
    })
    .open();
};

const handleActiveSwitchChange = async (record: any, newValue: boolean) => {
  if (!parentTableParams.value.bpartnerID) {
    message.warning('请先选择供应商');
    return;
  }
  try {
    const { vendorProductControlId } = record;
    const params = {
      vendorProductControlId,
      isActive: newValue,
    };
    const response = await modifyVendorProductControl(params);
    if (response.success) {
      message.success('状态更新成功');
      // 重新查询数据
      await roleGridApi.query({
        bpartnerID: parentTableParams.value.bpartnerID,
      });
    } else {
      message.error(response.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新有效状态失败:', error);
    message.error('网络错误，更新失败');
  }
};
const isRecordActive = (record: any) => {
  return (
    record.isActive === 'Y' || record.isActive === true || record.isActive === 1
  );
};

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <addModal :after-submit="refreshTable" />
        <LogModal />
        <FormModal />
        <ChcGrid />
      </template>
      <template #second>
        <RoleFormModal />
        <RoleGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd"
              :disabled="!hasSelectedParentRow"
              style="margin-top: 10px"
              data-testid="button_add"
            >
              新增
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
          </template>
          <template #activeSwitch="{ row, rowIndex }">
            <Switch
              :checked="isRecordActive(row)"
              @change="
                (checked: any) => handleActiveSwitchChange(row, !!checked)
              "
              checked-children="是"
              un-checked-children="否"
              :data-testid="`switch_active_${rowIndex}`"
            />
          </template>
          <template #action="scope">
            <Button
              danger
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleDel(scope.row)"
              :data-testid="`button_delete_${scope.rowIndex}`"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
          </template>
        </RoleGrid>
      </template>
    </PageSplit>
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
