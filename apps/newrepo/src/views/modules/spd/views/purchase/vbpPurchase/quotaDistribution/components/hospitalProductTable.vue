<script setup lang="ts">
import type { GridColumn } from '@vben/chc-ui';

import type { CardTableConfig } from './cardTable.vue';

import { ref } from 'vue';

import { ExportActionIcon, MdiLightDelete } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import {
  Button,
  Input,
  message,
  Modal,
  Segmented,
  Space,
  Tag,
} from 'ant-design-vue';

import { changeBulkPurchaseStatus, deleteProductMapVBPAction } from '../api';
import AddAndEditProductMapModalComp from '../modals/addAndEditProductMapModal.vue';
import CardTable from './cardTable.vue';

const props = defineProps<{
  /** 是否可以操作（未开始） */
  isActionDisabled?: boolean;
}>();
interface HospitalProductRow {
  mapId: string;
  productcode: string;
  markCode: string;
  productName: string;
  productSpec: string;
  manufacturer: string;
  pricePo: string;
  isBulkPurchase: 'N' | 'Y';
  vbpProductId?: string;
  vendorId?: string;
  [key: string]: any;
}

const searchKey = ref('');
const filterType = ref('');

const filterOptions = [
  { label: '全部', value: '' },
  { label: '中标', value: 'Y' },
  { label: '非中标', value: 'N' },
];
const vbpProductData = ref<any | undefined>(undefined);
const selectedParentRow = ref<HospitalProductRow | null>(null);

const queryUrl = 'productVBPAction/queryMap.do';

const gridColumns: GridColumn[] = [
  {
    align: 'center',
    fixed: 'left',
    title: '',
    type: 'checkbox',
    width: 40,
    field: '_checkbox',
    // slots: { header: 'checkbox_header', checkbox: 'checkbox_cell' },
  },
  {
    title: '序号',
    type: 'seq',
    width: 50,
    align: 'center',
  },
  {
    field: 'productcode',
    title: '药品编码',
    minWidth: 120,
    align: 'center',
    sortable: true,
  },
  // {
  //   field: 'markCode',
  //   title: '中标编码',
  //   minWidth: 100,
  //   align: 'center',
  //   sortable: true,
  // },
  {
    field: 'productName',
    title: '药品名称',
    minWidth: 250,
    align: 'center',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    minWidth: 100,
    sortable: true,
    align: 'center',
  },
  {
    field: 'modelNo',
    title: '型号',
    minWidth: 150,
    sortable: true,
    align: 'center',
    visible: false,
  },
  {
    field: 'manufacturer',
    minWidth: 130,
    sortable: true,
    align: 'center',
    title: '厂家',
  },
  {
    field: 'uomName',
    minWidth: 100,
    sortable: true,
    align: 'center',
    title: '单位',
  },
  {
    field: 'baseUomName',
    minWidth: 100,
    sortable: true,
    align: 'center',
    title: '最小单位',
  },
  {
    field: 'pricePo',
    title: '中标价（元）',
    minWidth: 120,
    align: 'right',
    sortable: true,
  },
  {
    field: 'isBulkPurchase',
    title: '是否中标',
    minWidth: 90,
    align: 'center',
    sortable: true,
    slots: { default: 'isBulkPurchase' },
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    minWidth: 80,
  },
];

const gridOptions: Record<string, any> = {
  headerCellConfig: { height: 36 },
  cellConfig: { height: 40 },
  columnConfig: { resizable: false },
  rowConfig: { isCurrent: false },
  round: false,
  border: 'inner',
  stripe: false,
  proxyConfig: { autoLoad: true },
  checkboxConfig: {
    highlight: true,
    checkMethod: () => {
      return !props.isActionDisabled;
    },
  },
  pagerConfig: { enabled: true },
  headerRowClassName: 'bg-[#f9fafb] text-[#6A7282]',
  rowClassName: 'text-[#6A7282]',
  cellStyle: ({ column }: any) => {
    if (column.field === 'productName') return { fontWeight: '700' };
    if (column.field === 'pricePo')
      return { color: '#1D4ED8', fontWeight: '500' };
    return {};
  },
};

const cardTableRef = ref<InstanceType<typeof CardTable>>();

const cardTableConfig: CardTableConfig = {
  id: 'hospitalProductTable',
  queryUrl,
  gridColumns,
  gridOptions,
  beforeFetchFn: (params) => {
    if (!vbpProductData.value?.vbpProductId) {
      return false;
    }
    return {
      ...params,
      vbpProductId: vbpProductData.value?.vbpProductId,
      name: searchKey.value || undefined,
      isBulkPurchase: filterType.value || undefined,
    };
  },
  afterFetchFn: (params: any) => {
    return {
      ...params,
      records: params.rows,
    };
  },
};

// 接收来自 CardTable 单选事件的行数据并触发查询
function handleCardTableSelect(row: HospitalProductRow | undefined) {
  selectedParentRow.value = row || null;
  vbpProductData.value = row;
  cardTableRef.value?.refresh();
}

// 新增品种
function handleAddProductMap() {
  if (!selectedParentRow.value) {
    return;
  }
  addOrEditProductMapModalApi
    .setData({
      parent: selectedParentRow.value,
      callback: () => {
        cardTableRef.value?.refresh();
      },
    })
    .open();
}

// 新增品种弹窗
const [AddOrEditProductMapModal, addOrEditProductMapModalApi] = useVbenModal({
  class: 'w-[950px]',
  closable: true,
  connectedComponent: AddAndEditProductMapModalComp,
  draggable: true,
});

// 搜索按钮触发查询
function handleSearch() {
  cardTableRef.value?.refresh();
}

// 导出
function handleExport() {
  cardTableRef.value?.handleExport?.({});
}

// 修改中标属性
function handleChangeBulkPurchase() {
  const gridApi = cardTableRef.value?.gridApi;
  if (!gridApi) return;
  const records: HospitalProductRow[] = gridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择记录');
    return;
  }
  // 一次遍历判断状态
  let hasY = false;
  let hasN = false;
  for (const item of records) {
    if (item.isBulkPurchase === 'Y') hasY = true;
    else if (item.isBulkPurchase === 'N') hasN = true;
    if (hasY && hasN) break;
  }
  if (hasY && hasN) {
    message.error('不能同时选择中标和非中标商品，请重新选择');
    return;
  }
  const bulkPurchaseFlag: 'N' | 'Y' = hasY ? 'N' : 'Y';
  const confirmMsg = bulkPurchaseFlag === 'Y' ? '中标' : '非中标';
  Modal.confirm({
    title: '提示',
    content: `确认修改为${confirmMsg}商品吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const ids = records.map((item) => item.mapId);
        const params = {
          ids: JSON.stringify(ids),
          isBulkPurchase: bulkPurchaseFlag,
        };
        await changeBulkPurchaseStatus(params);
        message.success('修改成功');
        cardTableRef.value?.refresh();
      } catch {
        message.error('修改失败');
      }
    },
  });
}

// 批量删除
function handleBatchDelete() {
  const gridApi = cardTableRef.value?.gridApi;
  if (!gridApi) return;
  const records: HospitalProductRow[] = gridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择记录');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '确认删除关联商品？',
    centered: true,
    okType: 'danger',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const ids = records.map((item) => item.mapId);
        const params = { ids: JSON.stringify(ids) };
        await deleteProductMapVBPAction(params);
        message.success('删除成功');
        cardTableRef.value?.refresh();
      } catch {
        message.error('操作失败');
      }
    },
  });
}

// 单行删除
function handleDel(row: HospitalProductRow) {
  Modal.confirm({
    title: '提示',
    content: '确认删除该关联商品？',
    centered: true,
    okType: 'danger',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const params = { ids: JSON.stringify([row.mapId]) };
        await deleteProductMapVBPAction(params);
        message.success('删除成功');
        cardTableRef.value?.refresh();
      } catch {
        message.error('操作失败');
      }
    },
  });
}

defineExpose({ handleCardTableSelect });
</script>
<template>
  <div class="h-full w-full">
    <!-- 搜索和按钮栏 -->
    <div
      class="flex items-center justify-between rounded-lg bg-[white] px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <Input
          v-model:value="searchKey"
          placeholder="药品名称/编码/规格"
          class="w-[200px]"
          allow-clear
          @keyup.enter="handleSearch"
        />
        <!-- Segmented 筛选 -->
        <Segmented
          v-model:value="filterType"
          :options="filterOptions"
          @change="handleSearch"
        />
      </div>
      <div class="flex items-center gap-2">
        <Button
          :disabled="isActionDisabled"
          type="primary"
          @click="handleAddProductMap"
          >新增品种</Button
        >
        <Button
          :disabled="isActionDisabled"
          type="primary"
          @click="handleChangeBulkPurchase"
        >
          修改中标属性
        </Button>
        <Button
          :disabled="isActionDisabled"
          type="primary"
          danger
          @click="handleBatchDelete"
        >
          批量删除
        </Button>
        <Button v-if="false" type="primary" @click="handleExport">
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </div>
    </div>
    <!-- 表格 -->
    <div class="h-[calc(100%-60px)]">
      <CardTable ref="cardTableRef" :config="cardTableConfig">
        <template #isBulkPurchase="{ row }">
          <Tag
            v-if="row.isBulkPurchase === 'Y'"
            color="success"
            class="rounded-full px-2 font-[700]"
          >
            <span class="mr-1">✓</span>中标
          </Tag>
          <Tag v-else color="default" class="rounded-full px-2"> 非中标 </Tag>
        </template>
        <template #action="{ row }">
          <Space>
            <Button
              :disabled="isActionDisabled"
              type="link"
              danger
              @click="handleDel(row)"
            >
              <MdiLightDelete class="text-[18px]" />
            </Button>
          </Space>
        </template>
      </CardTable>
    </div>
  </div>
  <!-- 新增品种弹窗 -->
  <AddOrEditProductMapModal />
</template>
<style scoped></style>
