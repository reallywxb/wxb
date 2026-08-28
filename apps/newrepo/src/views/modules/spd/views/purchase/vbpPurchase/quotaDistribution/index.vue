<script setup lang="ts">
import { ChcSelect, type GridColumn } from '@vben/chc-ui';

import type { CardTableConfig } from './components/cardTable.vue';

import { computed, nextTick, ref, toRaw, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import {
  AntdEditOutlined,
  AntdEyeTwotone,
  AntdFileTextOutlined,
  AntdSearchOutlined,
  EditActionIcon,
  MdiLightDelete,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import {
  Page,
  RadioBtnGroupSplit,
  Splitter,
  useVbenModal,
} from '@vben/common-ui';

import { Button, Input, message, Tag } from 'ant-design-vue';

import { handlePriceToFixedTwo } from '#/utils/util';
import { downloadByData } from '#/utils/file/download';

import { deleteBatchVBPAction, deleteProductVBPAction } from './api';
import CardTable from './components/cardTable.vue';
import DeptQuotaTable from './components/deptQuotaTable.vue';
import HospitalProductTable from './components/hospitalProductTable.vue';
import LoadMoreList from './components/loadMoreList.vue';
import TabsBar from './components/tabsBar.vue';
import AddAndEditBatchFormModalComp from './modals/addAndEditBatchFormModal.vue';
import AddAndEditProductFormModalComp from './modals/addAndEditProductFormModal.vue';
import AutoAllocateModalComp from './modals/autoAllocateModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { isEmpty } from '@vben/utils';
import { ExportActionIcon } from '@vben/chc-icons';
import { VxeUI } from 'vxe-table';
import { requestFormClient } from '#/api/request';
import { useUserStore } from '@vben/stores';
const userStore = useUserStore();
const route = useRoute();
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const type = ref(urlParams.productType || 'H');

const loadMoreListRef =
  useTemplateRef<InstanceType<typeof LoadMoreList>>('loadMoreListRef');
const cardTableRef =
  useTemplateRef<InstanceType<typeof CardTable>>('cardTableRef');
const hospitalProductTableRef = useTemplateRef<
  InstanceType<typeof HospitalProductTable>
>('hospitalProductTableRef');

const tagColorList = ['blue', 'purple', 'green', 'orange'];
const collectType = ref('');
const searchKey = ref('');
const selectedItem = ref<any>(null);
// 产品查询条件统一管理
const productQuery = ref<{
  status: number | undefined;
  ygcgProductNameId: string | undefined;
}>({
  status: undefined,
  ygcgProductNameId: undefined,
});
// 存储 CardTable 当前选中行，用于 tab 切换时传递选中数据
const selectedCardTableRow = ref<any>(null);

function handleSelect(item: any) {
  selectedItem.value = item;
  productQuery.value.status = undefined;
  productQuery.value.ygcgProductNameId = undefined;
  cardTableRef.value?.refresh();
}

const isActionDisabled = computed(() => {
  if (userStore?.userInfo?.isProcurementRepair === true) {
    return false;
  }
  return (
    selectedItem.value?.statusName === '执行中' ||
    selectedItem.value?.statusName === '进行中' ||
    selectedItem.value?.statusName === '已结束' ||
    selectedItem.value?.statusName === '已完成'
  );
});

const STATUS_STYLE: Record<string, { backgroundColor: string; color: string }> =
  {
    执行中: { backgroundColor: '#DCFCE7', color: '#16A34A' },
    未开始: { backgroundColor: '#FEF3C7', color: '#D97706' },
    已完成: { backgroundColor: '#F3F4F6', color: '#6B7280' },
    已结束: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  };

// 新增和编辑弹窗
const [AddAndEditBatchFormModal, addAndEditBatchFormModalApi] = useVbenModal({
  class: 'w-[1000px]',
  closable: true,
  connectedComponent: AddAndEditBatchFormModalComp,
  draggable: true,
});

// 新增产品弹窗
const [AddOrEditProductModal, addOrEditProductModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  connectedComponent: AddAndEditProductFormModalComp,
  draggable: true,
});

// 导入弹窗
const [ImportModal, importModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  connectedComponent: ImportModalComp,
  draggable: true,
});

// 自动分配弹窗
const [AutoAllocateModal, autoAllocateModalApi] = useVbenModal({
  class: 'w-[450px]',
  closable: true,
  connectedComponent: AutoAllocateModalComp,
  draggable: true,
});

// 新增
function handleAdd() {
  addAndEditBatchFormModalApi
    .setData({
      title: '新增集采批次',
      type: 'add',
      callback: () => {
        loadMoreListRef.value?.refreshList();
      },
    })
    .open();
}

// 编辑（仅未开始状态可编辑）
function handleEdit(row: any) {
  if (!row || !row.raw.vbpBatchId) {
    return;
  }
  if (row.statusName !== '未开始' && row.statusName !== '未执行') {
    message.warning('当前状态不允许编辑');
    return;
  }
  addAndEditBatchFormModalApi
    .setData({
      title: '编辑集采批次',
      type: 'edit',
      vbpBatchId: row.raw.vbpBatchId,
      callback: () => {
        loadMoreListRef.value?.refreshList();
      },
    })
    .open();
}

// 查看（执行中和已结束状态只能查看）
function handleView(row: any) {
  if (!row || !row.raw.vbpBatchId) {
    return;
  }
  addAndEditBatchFormModalApi
    .setData({
      title: '查看集采批次',
      type: 'view',
      vbpBatchId: row.raw.vbpBatchId,
      callback: () => {
        loadMoreListRef.value?.refreshList();
      },
    })
    .open();
}

// 删除（仅未开始状态可删除）
function handleDelete(row: any) {
  if (!row || !row.raw.vbpBatchId) {
    return;
  }
  if (row?.statusName !== '未开始' && row.statusName !== '未执行') {
    message.warning('当前状态不允许删除');
    return;
  }
  import('ant-design-vue').then(({ Modal: AntModal, message }) => {
    AntModal.confirm({
      title: '提示',
      content: `确认删除${row.title}吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBatchVBPAction({ id: row.raw.vbpBatchId });
          message.success('删除成功');
          loadMoreListRef.value?.refreshList();
        } catch {
          message.error('删除失败');
        }
      },
    });
  });
}

// 新增产品
function handleBatchAdd() {
  if (!selectedItem.value || !selectedItem.value.raw.vbpBatchId) {
    return;
  }
  addOrEditProductModalApi
    .setData({
      title: '新增产品',
      type: 'add',
      treeNodeData: {
        id: selectedItem.value.id,
        key: selectedItem.value.id,
        text: selectedItem.value.title,
        type: selectedItem.value.raw.type,
        vbpBatchId: selectedItem.value.raw.vbpBatchId,
      },
      parent: undefined,
      callback: () => {
        cardTableRef.value?.refresh();
      },
    })
    .open();
}

// 导入
function handleImport() {
  importModalApi
    ?.setData({
      row: toRaw(selectedItem.value?.raw),
    })
    ?.open();
}

// 自动分配
function handleAutoAllocate() {
  if (!selectedItem.value?.raw?.vbpBatchId) {
    message.warning('请先选择批次');
    return;
  }

  // 获取表格勾选的数据
  const $grid = cardTableRef.value?.gridApi?.grid;
  const checkedRows = $grid?.getCheckboxRecords?.() || [];

  if (checkedRows.length === 0) {
    message.warning('请先勾选需要自动分配的产品');
    return;
  }

  autoAllocateModalApi
    .setData({
      vbpBatchId: selectedItem.value.raw.vbpBatchId,
      vbpProductIds: checkedRows.map((row: any) => row.vbpProductId),
      dateFrom: selectedItem.value.raw.beginDate,
      dateTo: selectedItem.value.raw.endDate,
      afterSubmit: () => {
        cardTableRef.value?.refresh();
      },
    })
    .open();
}

// 编辑产品
function handleProductEdit(row: any) {
  addOrEditProductModalApi
    .setData({
      title: `${row.name}编辑`,
      type: 'edit',
      treeNodeData: {
        id: selectedItem.value?.id,
        key: selectedItem.value?.id,
        text: selectedItem.value?.title,
        type: selectedItem.value?.raw?.type,
        vbpBatchId: selectedItem.value?.raw?.vbpBatchId,
      },
      parent: row,
      callback: () => {
        cardTableRef.value?.refresh();
      },
    })
    .open();
}

// 删除产品
function handleProductDelete(row: any) {
  import('ant-design-vue').then(({ Modal: AntModal, message }) => {
    AntModal.confirm({
      title: '提示',
      content: '确认删除该产品吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteProductVBPAction({ id: row.vbpProductId });
          message.success('删除成功');
          cardTableRef.value?.refresh();
        } catch {
          message.error('删除失败');
        }
      },
    });
  });
}

const queryUrl = 'productVBPAction/query.do';

const gridColumns: GridColumn[] = [
  {
    align: 'center',
    fixed: 'left',
    title: '',
    type: 'checkbox',
    width: 40,
    // slots: { header: 'checkbox_header', checkbox: 'checkbox_cell' },
  },
  {
    type: 'radio',
    width: 40,
    align: 'center',
    visible: false,
  },
  {
    title: '序号',
    type: 'seq',
    width: 50,
    align: 'center',
  },
  {
    field: 'name',
    title: '通用名',
    minWidth: '100',
    align: 'center',
    sortable: false,
    slots: { default: 'commonName' },
  },
  {
    field: 'productSpec',
    title: '规格',
    minWidth: '50',
    sortable: false,
    align: 'center',
  },
  {
    field: 'manufacturer',
    minWidth: 80,
    sortable: false,
    align: 'center',
    title: '厂家',
  },
  {
    field: 'qtyTypeName',
    title: '使用量类型',
    minWidth: '100',
    align: 'center',
    sortable: false,
  },
  {
    field: 'qtyPlaned',
    title: '全院任务量',
    minWidth: '100',
    align: 'center',
    sortable: false,
  },
  {
    field: 'baseUomName',
    title: '使用单位',
    align: 'center',
    minWidth: '100',
    sortable: false,
  },
  {
    field: 'assigned',
    title: '已分配/总量',
    align: 'center',
    minWidth: '100',
    sortable: false,
    formatter: (params: any) => {
      return `${params.row.assigned || 0}/${params.row.qtyPlaned || 0}`;
    },
  },
  {
    field: 'status',
    title: '状态',
    minWidth: '80',
    align: 'center',
    sortable: false,
  },
  {
    field: 'price',
    title: '中标价格',
    minWidth: '80',
    align: 'center',
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.price);
    },
    sortable: false,
  },
  {
    field: 'remark',
    title: '备注',
    minWidth: '80',
    align: 'center',
    sortable: false,
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    minWidth: 100,
  },
] as GridColumn[];

const gridOptions: Record<string, any> = {
  headerCellConfig: {
    height: 36,
  },
  cellConfig: {
    height: 30,
  },
  columnConfig: {
    resizable: false,
  },
  rowConfig: {
    isCurrent: false,
  },
  round: false,
  border: 'inner',
  stripe: false,
  proxyConfig: {
    autoLoad: false,
  },

  radioConfig: {
    trigger: 'row',
    highlight: true,
  },
  checkboxConfig: {
    highlight: true,
  },
  pagerConfig: {
    enabled: true,
  },
  headerRowClassName: 'bg-[#f9fafb] text-[#6A7282]',
  rowClassName: 'text-[#6A7282]',
  cellStyle: ({ column }: any) => {
    if (column.field === 'qtyPlaned') return { fontWeight: '700' };
    if (column.field === 'price')
      return { color: '#1D4ED8', fontWeight: '600' };
    if (column.field === 'assigned')
      return { color: '#16A34A', fontWeight: '600' };
    return {};
  },
};
// 导出
async function exportFileApi(body: Record<string, any>) {
  console.log('exportFileApi body', body);
  try {
    const res1 = await requestFormClient.post(
      '/productVBPAction/exportQuery',
      body,
      {
        responseType: 'blob',
      },
    );
    // 检查是否是错误响应（blob 可能是 JSON 错误信息）
    if (res1.type === 'application/json') {
      const text = await res1.text();
      const json = JSON.parse(text);
      VxeUI.modal.message({
        content: json?.msg || '导出失败',
        status: 'error',
      });
      return;
    }

    downloadByData(res1, `${body.title}.xls`, 'application/vnd.ms-excel');
    VxeUI.modal.message({
      content: '导出成功，开始下载',
      status: 'success',
    });
  } catch (err: any) {
    console.error('导出失败:', err);
    VxeUI.modal.message({
      content: err?.message || '导出失败！',
      status: 'error',
    });
  }
}
const currentRadioRowKey = ref<string | undefined>(undefined);
// 科室月度明细保存的回调，用于选中之前选中的通用名
function onDeptSuccess() {
  console.log('onDeptSuccess', activeTab.value);
  if (activeTab.value === 'department') {
    const radioRow = cardTableRef?.value?.gridApi?.grid?.getRadioRecord(true);
    if (isEmpty(radioRow)) {
      console.warn('radiorow is not exist');
      return;
    }
    currentRadioRowKey.value = radioRow.vbpProductId;
    cardTableRef.value?.refresh?.();
  }
}
const isRestoringRadioRow = ref(false); // 标志位：是否正在恢复单选行

// CardTable 单选事件：触发查询
function handleCardTableRadio({ row }: any) {
  // 如果是恢复单选行过程中触发的，不触发子表查询
  if (isRestoringRadioRow.value) {
    console.warn('handleCardTableRadio skipped (restoring)');
    return;
  }
  if (row?.vbpProductId) {
    const data = {
      ...row,
      dateFrom: selectedItem.value.raw.beginDate,
      dateTo: selectedItem.value.raw.endDate,
    };
    selectedCardTableRow.value = data;

    hospitalProductTableRef.value?.handleCardTableSelect(data);
  } else {
    selectedCardTableRow.value = null;
    hospitalProductTableRef.value?.handleCardTableSelect(undefined);
  }
}
const cardTableConfig: CardTableConfig = {
  id: 'productVBPTable',
  queryUrl,
  gridColumns,
  gridOptions,
  showRadioRowTag: true,
  beforeFetchFn: (params) => ({
    ...params,
    vbpBatchId: selectedItem.value?.raw?.vbpBatchId,
    status: productQuery.value.status,
    ygcgProductNameId: productQuery.value.ygcgProductNameId || undefined,
  }),
  afterFetchFn: (res: Record<string, any>) => {
    // 先清除单选状态，防止表格刷新时默认选中第一行触发子表查询
    const $grid = cardTableRef?.value?.gridApi?.grid;
    $grid?.clearRadioRow?.();

    if (!isEmpty(currentRadioRowKey.value)) {
      isRestoringRadioRow.value = true;
      setTimeout(() => {
        const fullData = $grid?.getFullData?.() || [];
        const targetRow = fullData.find(
          (r: any) => r.vbpProductId === currentRadioRowKey.value,
        );

        if (targetRow) {
          $grid?.setRadioRow?.(targetRow);
          // 恢复完成后，允许后续的 radioChange 事件
          isRestoringRadioRow.value = false;
          handleCardTableRadio({ row: targetRow });
        } else {
          console.warn('targetRow not found');
          isRestoringRadioRow.value = false;
        }
        currentRadioRowKey.value = undefined;
      }, 300);
    }
    return {
      ...res,
      records: res.rows,
      total: res.total,
    };
  },
  gridEvents: {
    radioChange: handleCardTableRadio,
  },
};

const tabs = [
  { key: 'hospital', label: '院内品种明细' },
  { key: 'department', label: '科室指标明细' },
];
const activeTab = ref('hospital');

const tabComponentMap: Record<string, any> = {
  hospital: HospitalProductTable,
  department: DeptQuotaTable,
};

function handleTabChange(key: string) {
  activeTab.value = key;
  // 切换 tab 后用选中的行数据触发对应组件查询
  nextTick(() => {
    hospitalProductTableRef.value?.handleCardTableSelect?.(
      selectedCardTableRow.value,
    );
  });
}
const computeStatusName = (statusName: string | undefined) => {
  if (isEmpty(statusName)) {
    return statusName;
  }
  if (statusName === '已完成') {
    return '已结束';
  }
  if (statusName === '未执行') {
    return '未开始';
  }
  return statusName;
};
// 导出
function handleExport() {
  cardTableRef.value?.gridApi.grid.exportData({
    remote: true,
    async exportMethod({ options }: { options: Record<string, any> }) {
      // 处理条件参数
      const body = {
        vbpBatchId: selectedItem.value?.raw?.vbpBatchId,
        title: options.filename,
      };
      try {
        const res1 = await requestFormClient.post(
          '/productVBPAction/exportAllocate',
          body,
          {
            responseType: 'blob',
          },
        );
        // 检查是否是错误响应（blob 可能是 JSON 错误信息）
        if (res1.type === 'application/json') {
          const text = await res1.text();
          const json = JSON.parse(text);
          VxeUI.modal.message({
            content: json?.msg || '导出失败',
            status: 'error',
          });
          return;
        }

        downloadByData(res1, `${body.title}.xls`, 'application/vnd.ms-excel');
        VxeUI.modal.message({
          content: '导出成功，开始下载',
          status: 'success',
        });
      } catch (err: any) {
        console.error('导出失败:', err);
        VxeUI.modal.message({
          content: err?.message || '导出失败！',
          status: 'error',
        });
      }
    },
  });
  // console.warn('exportMethod options', options);
  // let ids: string[] = [];
  // if (options.mode === 'current') {
  //   const checkedRows =
  //     cardTableRef?.value?.gridApi?.grid?.getCheckboxRecords(true) || [];
  //   console.log('checkedRows', checkedRows);
  //   ids = checkedRows.map((item) => item?.vbpProductId);
  // } else if (options.mode === 'selected') {
  //   ids = options.data.map((item: Record<string, any>) => item.id);
  // } else {
  // }
  // // 处理条件参数
  // const body = {
  //   vbpBatchId: selectedItem.value?.raw?.vbpBatchId,
  //   title: options.filename,
  //   sheetName: options.sheetName,
  //   mode: options.mode === 'current' ? 'selected' : options.mode,
  //   ids: ids.join(','),
  //   columns: JSON.stringify(
  //     options.columns.map((column: Record<string, any>) => {
  //       return {
  //         name: column.title,
  //         id: column.field,
  //         width: 100,
  //       };
  //     }),
  //   ),
  // };
  // exportFileApi(body);
}
</script>
<template>
  <Page content-class="p-0" auto-content-height>
    <div class="figma-style">
      <!-- border-r -->
      <div
        class="flex h-full w-[340px] shrink-0 grow-0 flex-col border-r border-solid border-r-[hsl(var(--border))] bg-[#fff]"
      >
        <header
          class="w-full shrink-0 grow-0 border-b border-solid border-b-[hsl(var(--border))] p-4 pb-3"
        >
          <div class="mb-3 flex w-full justify-between">
            <h3 class="text-[15px] font-[700] leading-[30px]">集采类型列表</h3>
            <!--  -->
            <Button
              type="primary"
              size="middle"
              :style="{ borderRadius: 'calc(var(--radius))' }"
              @click="handleAdd"
            >
              新增
            </Button>
          </div>
          <RadioBtnGroupSplit
            class="mb-3"
            v-model="collectType"
            :options="[
              { label: '全部', value: '' },
              { label: '执行中', value: 'Y' },
              { label: '未开始', value: 'N' },
              { label: '已结束', value: 'CO' },
            ]"
          />
          <Input
            v-model:value="searchKey"
            class="mb-0"
            placeholder="搜索名称"
            :style="{ borderRadius: 'var(--radius)' }"
          >
            <template #prefix>
              <AntdSearchOutlined class="mr-1" />
            </template>
          </Input>
        </header>

        <LoadMoreList
          ref="loadMoreListRef"
          :filter-status="collectType"
          :search-key="searchKey"
          @select="handleSelect"
        >
          <template #listItem="scope">
            <div
              @click="scope.itemClick(scope.row)"
              class="relative mb-[10px] h-[auto] w-full cursor-pointer select-none overflow-hidden rounded-[14px] border border-solid border-[#e6eefa] p-3 pl-5 text-[13px]"
              :class="scope.row.id === scope.current?.id ? 'itemActive' : ''"
            >
              <div
                class="absolute left-[-5px] top-[50%] h-[32px] w-[8px] translate-y-[-50%] rounded-[4px] bg-[hsl(var(--primary))]"
              ></div>
              <div class="mb-[6px] flex w-full items-center justify-between">
                <div class="itemTitle font-[700]">{{ scope.row.title }}</div>
                <Tag
                  :color="tagColorList[scope.index % 4]"
                  class="mr-0 text-[11px] font-[700] leading-[20px]"
                >
                  {{ scope.row.typeName }}
                </Tag>
              </div>
              <div class="flex leading-[20px]">
                <div
                  class="mr-[6px] rounded-[9px] px-2 text-[11px]"
                  :style="STATUS_STYLE[scope.row.statusName]"
                >
                  {{ computeStatusName(scope.row.statusName) }}
                </div>
                <div class="mr-[6px] text-[11px] text-[#99a1af]">
                  {{ `${scope.row.productCount} 品规 ` }}
                </div>
                <div class="text-[11px] text-[#D1D5DC]">
                  {{ scope.row.time }}
                </div>
              </div>
              <div
                class="manualBtns absolute bottom-[8px] right-[8px] flex gap-[6px]"
                v-if="scope.row.id === scope.current?.id"
              >
                <!-- 未开始：显示编辑和删除 -->
                <template
                  v-if="
                    scope.row.statusName === '未开始' ||
                    scope.row.statusName === '未执行' ||
                    userStore?.userInfo?.isProcurementRepair === true
                  "
                >
                  <div
                    @click.stop.prevent="handleEdit(scope.row)"
                    class="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[var(--radius)] bg-[#DBEAFE] text-[#155DFC]"
                  >
                    <EditActionIcon />
                  </div>
                  <div
                    class="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[var(--radius)] bg-[#FEF2F2] text-[#FF6467]"
                    @click.stop.prevent="handleDelete(scope.row)"
                  >
                    <SvgDeleteIcon />
                  </div>
                </template>
                <!-- 执行中、已结束：只显示查看 -->
                <template v-else>
                  <div
                    @click.stop.prevent="handleView(scope.row)"
                    class="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[var(--radius)] bg-[#E8F5E9] text-[#4CAF50]"
                  >
                    <AntdEyeTwotone />
                  </div>
                </template>
              </div>
            </div>
          </template>
        </LoadMoreList>
      </div>
      <div class="h-full flex-1 overflow-hidden">
        <Splitter type="TB" class="h-full">
          <template #top>
            <CardTable
              ref="cardTableRef"
              :config="cardTableConfig"
              :show-header="true"
            >
              <template #title>
                <div class="flex items-center gap-2 pl-4">
                  <div
                    class="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#eff6ff] text-[#1D4ED8]"
                  >
                    <AntdFileTextOutlined class="text-[18px]" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-[14px] font-[700]">
                        {{ selectedItem?.title || '请选择批次' }}
                      </div>
                      <Tag
                        :color="tagColorList[0]"
                        class="mr-0 text-[10px] font-[700] leading-[18px]"
                      >
                        {{ selectedItem?.typeName || '' }}
                      </Tag>
                      <div
                        class="rounded-[9px] px-2 text-[10px] leading-[18px]"
                        :style="
                          selectedItem
                            ? STATUS_STYLE[selectedItem.statusName]
                            : STATUS_STYLE['执行中']
                        "
                      >
                        {{ computeStatusName(selectedItem?.statusName) }}
                      </div>
                    </div>
                    <div class="text-[12px] text-[#99A1AF]">
                      {{ selectedItem?.time || '' }}
                    </div>
                  </div>
                </div>
              </template>
              <template #toolbar-actions>
                <div class="flex w-full items-center justify-between px-4">
                  <div class="flex items-center">
                    <ChcSelect
                      v-model="productQuery.ygcgProductNameId"
                      dict-url="/ygcgProductNameAction/query"
                      placeholder="搜索通用名"
                      class="mr-2 w-[200px]"
                      :paginate="true"
                      :immediate="true"
                      :filter-by-front-end="false"
                      :show-search="true"
                      filter-field="productName"
                      label-field="productName"
                      value-field="productNameId"
                      query-model-value-field="productNameId"
                      :show-choose-all="false"
                      allow-clear
                      :after-fetch="
                        (res: any) => {
                          return { ...res, rows: undefined, records: res.rows };
                        }
                      "
                    />
                    <ChcSelect
                      v-model="productQuery.status"
                      placeholder="请选择状态"
                      class="mr-2 w-[200px]"
                      label-field="label"
                      value-field="value"
                      allow-clear
                      :options="[
                        // { label: '全部', value: '' },
                        { label: '未分配', value: 0 },
                        { label: '已分配', value: 1 },
                      ]"
                    />
                    <Button type="primary" @click="cardTableRef?.refresh()">
                      查询
                    </Button>
                  </div>
                  <div class="flex items-center">
                    <Button
                      type="primary"
                      class="mr-2"
                      :disabled="isActionDisabled"
                      @click="handleBatchAdd"
                    >
                      新增产品
                    </Button>
                    <Button
                      :disabled="isActionDisabled"
                      type="primary"
                      class="mr-2"
                      @click="handleImport"
                    >
                      批量导入
                    </Button>
                    <Button
                      :disabled="isActionDisabled"
                      type="primary"
                      class="mr-2"
                      @click="handleAutoAllocate"
                    >
                      自动分配
                    </Button>
                    <Button type="primary" @click="handleExport">
                      导出
                      <template #icon>
                        <ExportActionIcon />
                      </template>
                    </Button>
                  </div>
                </div>
              </template>
              <template #commonName="{ row }">
                <Tag
                  color="blue"
                  class="inline-flex max-w-[calc(100%-16px)] items-center justify-center rounded-full px-2 font-[600]"
                >
                  <span
                    :title="row.name"
                    class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {{ row.name }}
                  </span>
                </Tag>
              </template>
              <template #action="{ row }">
                <Button
                  :disabled="isActionDisabled"
                  type="link"
                  @click="handleProductEdit(row)"
                >
                  <AntdEditOutlined class="text-[18px]" />
                </Button>
                <Button
                  :disabled="isActionDisabled"
                  type="link"
                  danger
                  @click="handleProductDelete(row)"
                >
                  <MdiLightDelete class="text-[18px]" />
                </Button>
              </template>
            </CardTable>
          </template>
          <template #bottom>
            <div class="h-full w-full">
              <TabsBar :tabs="tabs" @change="handleTabChange" />
              <div class="h-[calc(100%-50px)] w-full">
                <component
                  :is="tabComponentMap[activeTab]"
                  ref="hospitalProductTableRef"
                  :is-action-disabled="isActionDisabled"
                  v-bind="
                    activeTab === 'department'
                      ? {
                          collectionTypeItem: selectedItem?.raw,
                          onRefresh: () => cardTableRef?.refresh(),
                          onSuccess: () => onDeptSuccess(),
                        }
                      : {}
                  "
                />
              </div>
            </div>
          </template>
        </Splitter>
      </div>
    </div>
    <!-- 新增/编辑批次弹窗 -->
    <AddAndEditBatchFormModal />
    <!-- 新增产品弹窗 -->
    <AddOrEditProductModal />
    <!-- 导入弹窗 -->
    <ImportModal
      :params="{
        type: urlParams.productType || 'H',
        vbpBatchId: selectedItem?.raw?.vbpBatchId,
      }"
      :after-submit="() => cardTableRef?.refresh()"
    />
    <!-- 自动分配弹窗 -->
    <AutoAllocateModal />
  </Page>
</template>
<style scoped>
.figma-style {
  --radius: calc(0.25rem);

  display: flex;

  /* color: #e6eefa; */
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.itemActive {
  background-color: #eff6ff;
  border-color: #8ec5ff;
}

.itemActive .itemTitle {
  color: #193cb8;
}
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>
