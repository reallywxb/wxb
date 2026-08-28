<script setup lang="ts">
import { type GridColumn, ChcSelect } from '@vben/chc-ui';

import type { CardTableConfig } from './cardTable.vue';

import { computed, ref } from 'vue';

import { Button, Modal, Progress, Tag, message } from 'ant-design-vue';

import { addDeptQuota, deleteDeptQuotas } from '../api';
import CardTable from './cardTable.vue';
import MonthlyUsageTable from './monthlyUsageTable.vue';
import { isEmpty } from '@vben/utils';

const props = defineProps<{
  /** 采集类型列表选中项数据 */
  collectionTypeItem?: Record<string, any>;
  /** 刷新父级产品表格 */
  onRefresh?: () => void;
  /** 是否可以操作（未开始） */
  isActionDisabled?: boolean;
  /** 保存成功后，父表的回调 */
  onSuccess: () => void;
}>();

const queryUrl = '/productVBPAction/queryAllocate';
const vbpProductData = ref<any | undefined>(undefined);

const selectedDeptId = ref<string | number | undefined>(undefined);

// 判断当前表格中已存在的科室 ID
const existingDeptIds = computed(() => {
  const fullData =
    cardTableRef.value?.gridApi?.grid?.getTableData?.()?.fullData || [];
  return new Set(fullData.map((r: any) => r.deptId));
});

const deptExtraParams = computed(() => {
  return {
    parentId: props?.collectionTypeItem?.departmentId || '',
  };
});
// 科室下拉过滤函数：排除已存在的科室
function deptFilterFn(res: any) {
  const ids = existingDeptIds.value;
  const records = (res.rows || []).filter((item: any) => !ids.has(item.deptId));
  return {
    ...res,
    rows: undefined,
    records: isEmpty(props?.collectionTypeItem?.departmentId) ? [] : records,
    total: isEmpty(props?.collectionTypeItem?.departmentId) ? 0 : res?.total,
  };
}

// 新增科室
const effectiveMonthCodeList = computed(() => {
  const list = monthCodeList.value || [];
  // 正常数据直接返回
  if (list.length > 1 || (list.length === 1 && list[0] !== '0')) {
    return list;
  }
  // monthCodeList 为 ['0'] 或空数组时，根据 dateFrom 和 dateTo 生成
  if (vbpProductData.value.dateFrom && vbpProductData.value.dateTo) {
    const months: string[] = [];
    const startDate = new Date(vbpProductData.value.dateFrom);
    const endDate = new Date(vbpProductData.value.dateTo);
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    // eslint-disable-next-line no-unmodified-loop-condition
    while (current <= endDate) {
      const y = current.getFullYear();
      const m = current.getMonth() + 1;
      months.push(`${y}${String(m).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }
  return list;
});
async function handleAddDept() {
  console.log('selectedDeptId.value', selectedDeptId.value);
  if (isEmpty(selectedDeptId.value)) {
    message.warning('请选择要新增的科室');
    return;
  }
  if (!vbpProductData.value?.vbpProductId) {
    message.warning('请先选择产品');
    return;
  }

  // 检查是否已存在
  if (existingDeptIds.value.has(selectedDeptId.value)) {
    message.warning('该科室已存在，请勿重复添加');
    return;
  }

  const newDeptId = selectedDeptId.value!;
  const monthValueMap: Record<string, number> = {};
  effectiveMonthCodeList.value.forEach((code: string) => {
    monthValueMap[code] = 0;
  });

  const monthDetailList = [
    {
      typeName: '中选用量',
      yearSum: 0,
      monthValueMap,
    },
  ];
  const params = {
    cBPartnerId: newDeptId,
    monthDetailList: monthDetailList,
    vbpBatchId: vbpProductData.value.vbpBatchId,
    vbpProductId: vbpProductData.value.vbpProductId,
  };
  try {
    const res = await addDeptQuota(params);
    if (res?.success) {
      message.success('新增成功');
      selectedDeptId.value = undefined;
      // 刷新后自动展开新增的行
      await refreshAndRestoreExpandById(newDeptId);
      return;
    }
    throw Error(res?.msg || '新增失败');
  } catch (err) {
    console.error(err);
  }
}

// 刷新后根据指定 ID 展开行
async function refreshAndRestoreExpandById(targetId: number | string) {
  const $grid = cardTableRef.value?.gridApi?.grid;
  if (!$grid) {
    cardTableRef.value?.refresh();
    return;
  }

  // 记录目标行 ID
  expandedDeptId.value = targetId;

  cardTableRef.value?.refresh();

  // 等待查询完成
  await new Promise<void>((resolve) => {
    const fallbackTimer = setTimeout(() => {
      ($grid as any).$el?.removeEventListener?.('proxy-query', handler);
      resolve();
    }, 2000);

    const handler = () => {
      clearTimeout(fallbackTimer);
      ($grid as any).$el?.removeEventListener?.('proxy-query', handler);
      resolve();
    };
    ($grid as any).$el?.addEventListener?.('proxy-query', handler);
  });

  // 展开目标行
  const newFullData = $grid.getTableData?.()?.fullData || [];
  const targetRow = newFullData.find(
    (r: any) => String(r.deptId) === String(targetId),
  );
  if (targetRow) {
    ($grid as any).setRowExpand?.(targetRow, true);
    setTimeout(() => {
      const rowIndex = newFullData.findIndex((r: any) => r.deptId === targetId);
      const scrollTop = rowIndex * 40;
      $grid.scrollTo?.(0, scrollTop);
    }, 100);
  }
}

// 批量删除科室
async function handleDeleteDepts() {
  const $grid = cardTableRef.value?.gridApi?.grid;
  const checkedRows = $grid?.getCheckboxRecords?.() || [];
  if (checkedRows.length === 0) {
    message.warning('请先勾选要删除科室数据');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认删除选中的 ${checkedRows.length} 个科室数据吗？`,
    okText: '确定',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await deleteDeptQuotas({
          vbpProductId: vbpProductData.value.vbpProductId,
          vbpBatchId: vbpProductData.value.vbpBatchId,
          cBPartnerIdList: checkedRows.map((r: any) => r.deptId),
        });
        if (res?.success) {
          message.success('删除成功');
          props.onRefresh?.();
          return;
        }
        throw Error(res?.msg || '删除失败');
      } catch (err) {
        console.error(err);
      }
    },
  });
}

const gridColumns: GridColumn[] = [
  {
    type: 'checkbox',
    width: 40,
    align: 'center',
    fixed: 'left',
  },
  {
    type: 'expand',
    width: 40,
    align: 'center',
    slots: { content: 'expand_content' },
  },
  {
    title: '序号',
    width: 50,
    align: 'center',
    field: 'index',
    formatter(scope: any) {
      return scope.rowIndex + 1;
    },
  },
  {
    field: 'deptName',
    title: '科室名称',
    minWidth: 100,
    align: 'center',
    sortable: false,
    slots: { default: 'deptName' },
  },
  {
    field: 'deptCode',
    title: '科室编码',
    minWidth: 80,
    align: 'center',
    sortable: false,
  },
  {
    field: 'orgRegionName',
    title: '院区',
    minWidth: 100,
    align: 'center',
    sortable: false,
  },
  {
    field: 'midSelectTotal',
    title: '科室任务量',
    minWidth: 100,
    align: 'center',
    sortable: false,
  },
  {
    field: 'midRatio',
    title: '科室已完成量占比',
    minWidth: 120,
    align: 'center',
    sortable: false,
  },
  {
    field: 'midTaskRatio',
    title: '科室任务量占比',
    minWidth: 120,
    align: 'center',
    sortable: false,
  },
  {
    field: 'remark',
    title: '备注',
    minWidth: 80,
    align: 'center',
    sortable: false,
  },
  // {
  //   align: 'center',
  //   field: 'action',
  //   slots: { default: 'action' },
  //   fixed: 'right',
  //   headerAlign: 'center',
  //   showOverflow: false,
  //   title: '操作',
  //   minWidth: 100,
  // },
];

const gridOptions: Record<string, any> = {
  headerCellConfig: { height: 36 },
  cellConfig: { height: 40 },
  columnConfig: { resizable: false },
  rowConfig: { isCurrent: false },
  expandConfig: {
    expandAll: false,
    accordion: true,
    height: 150,
  },
  virtualXConfig: {
    enabled: false,
  },
  virtualYConfig: {
    enabled: false,
  },
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
  pagerConfig: { enabled: false },
  headerRowClassName: 'bg-[#f9fafb] text-[#6A7282]',
  rowClassName: 'text-[#6A7282]',
  cellStyle: ({ column }: any) => {
    if (column.field === 'midSelectTotal')
      return { color: '#16A34A', fontWeight: '700' };
    if (column.field === 'yearTotal') return { fontWeight: '700' };
    if (column.field === 'midRatio')
      return { color: '#7C3AED', fontWeight: '700' };
    return {};
  },
};

const cardTableRef = ref<InstanceType<typeof CardTable>>();
const monthCodeList = ref<string[]>([]);
// 保存展开行的 deptId，用于刷新后恢复展开状态和滚动位置
const expandedDeptId = ref<null | number | string>(null);

const cardTableConfig: CardTableConfig = {
  id: 'deptQuotaTable',
  queryUrl,
  gridColumns,
  gridOptions,
  gridEvents: {
    'toggle-row-expand': ({ row, expanded }: any) => {
      if (expanded) {
        expandedDeptId.value = row.deptId;
      } else {
        expandedDeptId.value = null;
      }
    },
    cellClick: ({ row }: any) => {
      const $grid = cardTableRef.value?.gridApi?.grid;
      if ($grid) {
        ($grid as any).toggleRowExpand?.(row);
      }
    },
  },
  beforeFetchFn: (params) => {
    if (!vbpProductData.value?.vbpProductId) {
      return false;
    }
    return {
      ...params,
      vbpProductId: vbpProductData.value?.vbpProductId,
      vbpBatchId: vbpProductData.value?.vbpBatchId,
      dateFrom: vbpProductData.value?.dateFrom,
      dateTo: vbpProductData.value?.dateTo,
    };
  },
  afterFetchFn: (params: any) => {
    const { data } = params;
    monthCodeList.value = data.monthCodeList || [];
    expandPrevDeptRow();
    return {
      ...params,
      records: data.data,
    };
  },
};

// 计算分配进度百分比
const progressPercent = computed(() => {
  if (!vbpProductData.value) return 0;
  const assigned = Number(vbpProductData.value.assigned) || 0;
  const total = Number(vbpProductData.value.qtyPlaned) || 0;
  return total > 0 ? Math.round((assigned / total) * 100) : 0;
});
// 刷新表格并恢复展开行状态
async function refreshAndRestoreExpand() {
  const $grid = cardTableRef.value?.gridApi?.grid;
  if (!$grid) {
    cardTableRef.value?.refresh();
    return;
  }

  // 保存当前展开行的 deptId — 通过遍历数据检查展开状态
  const fullData = $grid.getTableData?.()?.fullData || [];
  for (const row of fullData) {
    if (
      ($grid as any).isExpandByRow?.(row) ||
      ($grid as any).isRowExpand?.(row)
    ) {
      expandedDeptId.value = row.deptId;
      break;
    }
  }

  cardTableRef.value?.refresh();

  // 等待 proxy 查询完成后再恢复展开 — 通过监听 proxy-query 事件
  await new Promise<void>((resolve) => {
    const fallbackTimer = setTimeout(() => {
      ($grid as any).$el?.removeEventListener?.('proxy-query', handler);
      resolve();
    }, 2000);

    const handler = () => {
      clearTimeout(fallbackTimer);
      ($grid as any).$el?.removeEventListener?.('proxy-query', handler);
      resolve();
    };
    ($grid as any).$el?.addEventListener?.('proxy-query', handler);
  });

  if (expandedDeptId.value !== null) {
    const newFullData = $grid.getTableData?.()?.fullData || [];
    const targetRow = newFullData.find(
      (r: any) => String(r.deptId) === String(expandedDeptId.value),
    );

    if (targetRow) {
      // 展开行
      ($grid as any).setRowExpand?.(targetRow, true);
      // 计算目标行位置并滚动 — 每行高度 60px
      setTimeout(() => {
        const rowIndex = newFullData.findIndex(
          (r: any) => r.deptId === expandedDeptId.value,
        );
        const scrollTop = rowIndex * 40;
        $grid.scrollTo?.(0, scrollTop);
      }, 100);
    }
  }
}

// 接收来自 CardTable 单选事件的行数据并触发查询
function handleCardTableSelect(row: any) {
  vbpProductData.value = row;
  cardTableRef.value?.refresh();
}
// 获取当前保存的行数据科室id
function setCurrentexpandedDeptId({
  expandedId,
}: {
  expandedId?: string | null;
}) {
  const $grid = cardTableRef.value?.gridApi?.grid;
  if (!$grid) {
    expandedDeptId.value = expandedId || null;
    console.warn('$grid is not exist!');
    return;
  }

  // 保存当前展开行的 deptId — 通过遍历数据检查展开状态
  const fullData = $grid.getTableData?.()?.fullData || [];
  for (const row of fullData) {
    if (
      ($grid as any).isExpandByRow?.(row) ||
      ($grid as any).isRowExpand?.(row)
    ) {
      expandedDeptId.value = row.deptId;
      break;
    }
  }
  if (!isEmpty(expandedId) && isEmpty(expandedDeptId.value)) {
    expandedDeptId.value = expandedId!;
  }
}
// 展开之前行数据
async function expandPrevDeptRow() {
  if (isEmpty(expandedDeptId.value)) {
    return;
  }

  const $grid = cardTableRef.value?.gridApi?.grid;
  if (!$grid) {
    console.warn('$grid is not exist!');
    return;
  }

  // 使用定时器等待表格数据渲染完成
  const tryExpand = (retry = 0) => {
    const newFullData = $grid.getTableData?.()?.fullData || [];
    const targetRow = newFullData.find(
      (r: any) => String(r.deptId) === String(expandedDeptId.value),
    );

    if (!targetRow) {
      if (retry < 10) {
        setTimeout(() => tryExpand(retry + 1), 100);
      } else {
        console.warn('targetRow is not exist after retries!');
      }
      return;
    }

    // 先收起再展开，确保触发重新渲染
    ($grid as any).setRowExpand?.(targetRow, false);
    setTimeout(() => {
      ($grid as any).setRowExpand?.(targetRow, true);
      // 验证是否展开成功
      setTimeout(() => {
        const isExpanded = ($grid as any).isRowExpandByRow?.(targetRow);

        if (!isExpanded) {
          // 如果还是没展开，再试一次
          ($grid as any).setRowExpand?.(targetRow, true);
        }
        const rowIndex = newFullData.findIndex(
          (r: any) => String(r.deptId) === String(expandedDeptId.value),
        );
        const scrollTop = rowIndex * 40;
        $grid.scrollTo?.(0, scrollTop);
      }, 200);
    }, 50);
  };

  // 等 200ms 后开始尝试展开
  setTimeout(() => tryExpand(), 200);
}

// 保存成功的回调
const onSuccess = ({ expandedId }: { expandedId?: string | null }) => {
  setCurrentexpandedDeptId({ expandedId });

  props?.onSuccess?.();
};

defineExpose({ handleCardTableSelect });
</script>
<template>
  <div class="h-full w-full bg-[#fff]">
    <!-- 分配进度条 -->
    <div class="flex w-full items-center justify-between bg-[#fff] px-4 py-3">
      <div
        class="inline-flex items-center gap-3 rounded-[12px] border border-[#e5e7eb] bg-[#fff] px-2 py-1"
      >
        <span class="text-[13px] text-[#6B7280]">分配进度：</span>
        <Progress
          :percent="progressPercent"
          :stroke-color="
            progressPercent >= 100
              ? { from: '#10B981', to: '#34D399' }
              : { from: '#3B82F6', to: '#60A5FA' }
          "
          :show-info="false"
          class="w-[200px]"
        />
        <span class="text-[13px] font-[600]">
          {{ Number(vbpProductData?.assigned || 0).toLocaleString() }} /
          {{ Number(vbpProductData?.qtyPlaned || 0).toLocaleString() }}
          {{ vbpProductData?.baseUomName || '' }}
        </span>
        <Tag v-if="progressPercent >= 100" color="success" class="text-[12px]">
          已全部分配
        </Tag>
      </div>
      <!-- 科室筛选和操作按钮 -->
      <div
        class="ml-3 inline-flex items-center gap-2 rounded-[12px] border border-[#e5e7eb] bg-[#fff] px-2 py-1"
      >
        <span class="text-[13px] text-[#6B7280]">科室：</span>
        <ChcSelect
          :key="props.collectionTypeItem?.departmentId || 'empty'"
          v-model="selectedDeptId"
          placeholder="请选择科室"
          class="w-[200px]"
          dict-url="/depHandleAction/queryDepartment.do"
          :paginate="true"
          :show-choose-all="false"
          :immediate="true"
          label-field="name"
          value-field="cBPartnerId"
          filter-field="name"
          allow-clear
          show-search
          :filter-by-front-end="false"
          :extraParams="deptExtraParams"
          :after-fetch="deptFilterFn"
          :disabled="isActionDisabled"
        />
        <Button
          :disabled="isActionDisabled"
          type="primary"
          @click="handleAddDept"
        >
          新增
        </Button>
        <Button :disabled="isActionDisabled" danger @click="handleDeleteDepts">
          删除
        </Button>
      </div>
    </div>
    <!-- 表格 -->
    <div class="h-[calc(100%-60px)]">
      <CardTable
        ref="cardTableRef"
        :config="cardTableConfig"
        class="deptQuotaTable"
      >
        <template #deptName="{ row }">
          <Tag
            color="purple"
            class="inline-flex max-w-[calc(100%-16px)] items-center justify-center rounded-full px-2 font-[700]"
          >
            <span
              :title="row.deptName"
              class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {{ row.deptName }}
            </span>
          </Tag>
        </template>
        <template #expand_content="{ row, rowIndex }">
          <MonthlyUsageTable
            :month-code-list="monthCodeList"
            :index="rowIndex"
            :vbp-batch-id="vbpProductData?.vbpBatchId"
            :vbp-product-id="vbpProductData?.vbpProductId"
            :c-b-partner-id="row.deptId || 11"
            :date-from="vbpProductData?.dateFrom"
            :date-to="vbpProductData?.dateTo"
            :on-success="onSuccess"
            :is-action-disabled="isActionDisabled"
            @ready="
              (api: any) =>
                api.loadData(
                  row.monthDetailList?.filter(
                    (item: any) => item.typeName === '中选用量',
                  ) || [],
                )
            "
          />
        </template>
      </CardTable>
    </div>
  </div>
</template>
<style scoped>
/* 展开/折叠图标 — 圆角背景 */
::v-deep(.deptQuotaTable .vxe-body-cell--wrapper .is--active) {
  display: block;
  padding: 1px;
  overflow: hidden;
  color: #1d4ed8 !important;
  background-color: #e0e7ff !important;
  border-radius: 4px !important;
  width: 22px !important;
  height: 22px !important;
}

::v-deep(.deptQuotaTable .vxe-body-cell--wrapper .is--active::before) {
}

::v-deep(.deptQuotaTable .vxe-cell--expand-btn:hover) {
  background-color: #bfdbfe;
}
</style>
