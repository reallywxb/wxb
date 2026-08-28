<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, message, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import addModalUi from './addModal/index.vue';
import { modifyProductFee } from './api';
import { columns } from './gridOptions';
import { searchFormSchemas } from './searchFormSchemas';

const [cols, gridColumns] = handleCommonGridColumns(columns);
const productId = ref<number | string>('');
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
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      showCollapseButton: false,
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
    dataTableId: '/productAction/queryProduct.do',
    id: 'productFeeEditFa',
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
        if (row && row.productId) {
          parentTableParams.value = { productId: row.productId };
          productId.value = row.productId;
          selectedParentRow.value = row; // 存储选中的行数据
          roleGridApi.query({
            productId: row.productId,
            showPrice: 'Y',
          });
        } else {
          selectedParentRow.value = null; // 清除选中
          parentTableParams.value = {};
        }
      },
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
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        { field: 'feeCode', title: '计费编码' },
        { field: 'feeName', title: '计费名称' },
        {
          field: 'isActive',
          title: '有效',
          slots: { default: 'activeSwitch' },
          align: 'center',
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    dataTableId: '/productAction/queryProductFee.do',
    id: 'productFeeEditCh',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.productId)) {
        return false;
      }
      return {
        ...params,
        productId: parentTableParams.value.productId,
      };
    },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

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
      },
      selectedParentRow: selectedParentRow?.value,
    })
    .open();
};

const handleActiveSwitchChange = async (record: any, newValue: boolean) => {
  if (!parentTableParams.value.productId) {
    message.warning('请先选择商品');
    return;
  }
  try {
    const { productFeeId } = record;
    const params = {
      productFeeId,
      isActive: newValue,
    };
    const response = await modifyProductFee(params);
    if (response.success) {
      message.success('更新成功');
      // 重新查询数据
      await roleGridApi.query({
        productId: parentTableParams.value.productId,
        showPrice: 'Y',
      });
    } else {
      message.error(response.message || '更新失败');
    }
  } catch (error) {
    console.error('更新有效状态失败:', error);
    message.error('更新失败');
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
        <ChcGrid />
      </template>
      <template #second>
        <RoleGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd"
              :disabled="!hasSelectedParentRow"
              data-testid="button_add"
            >
              新增
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
          </template>
          <template #activeSwitch="{ row }">
            <Switch
              :checked="isRecordActive(row)"
              @change="
                (checked: any) => handleActiveSwitchChange(row, !!checked)
              "
              checked-children="是"
              un-checked-children="否"
              :data-testid="`switch_active_${row.rowIndex}`"
            />
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
