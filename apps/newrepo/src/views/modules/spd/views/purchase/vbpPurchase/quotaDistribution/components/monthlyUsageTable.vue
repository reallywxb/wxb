<script setup lang="ts">
import type { GridColumn } from '@vben/chc-ui';

import type { CardTableConfig } from './cardTable.vue';

import { computed, onMounted, useTemplateRef } from 'vue';

import { InputNumber, message, Button as AntdButton } from 'ant-design-vue';

import { saveAllocate } from '../api';
import CardTable from './cardTable.vue';

interface MonthDetailItem {
  typeName: string;
  yearSum: number;
  monthValueMap: Record<string, number>;
}

const props = defineProps<{
  cBPartnerId?: number | string;
  dateFrom?: string;
  dateTo?: string;
  index?: number;
  monthCodeList?: string[];
  onSuccess?: (data: { expandedId?: string | null }) => void;
  vbpBatchId?: number | string;
  vbpProductId?: number | string;
  /** 是否可以操作（未开始） */
  isActionDisabled?: boolean;
}>();

const emit = defineEmits<{
  ready: [methods: { loadData: (data: MonthDetailItem[]) => void }];
}>();

const cardTableRef =
  useTemplateRef<InstanceType<typeof CardTable>>('cardTableRef');

// 当 monthCodeList 只有一个值且为 '0'，或为空时，根据 dateFrom 和 dateTo 生成月份列表
const effectiveMonthCodeList = computed(() => {
  const list = props.monthCodeList || [];
  // 正常数据直接返回
  if (list.length > 1 || (list.length === 1 && list[0] !== '0')) {
    return list;
  }
  // monthCodeList 为 ['0'] 或空数组时，根据 dateFrom 和 dateTo 生成
  if (props.dateFrom && props.dateTo) {
    const months: string[] = [];
    const startDate = new Date(props.dateFrom);
    const endDate = new Date(props.dateTo);
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

// 根据 monthCodeList 动态生成列
const gridColumns = computed<GridColumn[]>(() => {
  if (!effectiveMonthCodeList.value?.length) return [];
  const monthCols: GridColumn[] = effectiveMonthCodeList.value.map((code) => {
    let m: number, y: number;
    if (code.length >= 6) {
      y = Number.parseInt(code.slice(0, 4));
      m = Number.parseInt(code.slice(4, 6));
    } else {
      const baseDate = props.dateFrom ? new Date(props.dateFrom) : new Date();
      y = baseDate.getFullYear();
      m = baseDate.getMonth() + Number(code);
      if (m > 12) {
        y += Math.floor((m - 1) / 12);
        m = ((m - 1) % 12) + 1;
      }
    }
    return {
      field: `month_${code}`,
      title: `${y}年${m}月`,
      minWidth: 86,
      align: 'center',
      sortable: false,
      slots: { default: `month_${code}` },
    };
  });
  return [
    ...monthCols,
    {
      field: 'yearSum',
      title: '月度合计',
      minWidth: 80,
      align: 'center',
      sortable: false,
      slots: { default: 'yearSum' },
    },
    {
      field: 'action',
      title: '操作',
      minWidth: 60,
      fixed: 'right',
      align: 'center',
      slots: { default: 'action' },
    },
  ];
});

const gridOptions: Record<string, any> = {
  columnConfig: { resizable: false },
  rowConfig: { isCurrent: false, drag: false },
  cellConfig: {
    height: 60,
  },
  round: false,
  border: false,
  stripe: false,
  pagerConfig: { enabled: false },
  showOverflow: false,
  // height: 'auto',
  // maxHeight: 180,
  // minHeight: 168,
  height: 90,
  maxHeight: 90,
};

const cardTableConfig: CardTableConfig = {
  id: `monthlyUsageTable_${props.index}`,
  queryUrl: '',
  gridColumns: gridColumns.value,
  gridOptions,
};

// 将 monthDetailList 转换为表格 records
function buildRecords(
  monthDetailList: MonthDetailItem[],
): Record<string, any>[] {
  return (monthDetailList || []).map((item) => {
    const record: Record<string, any> = {
      typeName: item.typeName,
      yearSum: item.yearSum,
    };
    effectiveMonthCodeList.value.forEach((code) => {
      record[`month_${code}`] = item.monthValueMap[code] || 0;
    });
    return record;
  });
}

// 进入编辑模式
function handleEdit(row: any) {
  row.isEdit = true;
}

// 保存当前行数据
async function handleSave(row: any) {
  if (!props.vbpBatchId || !props.vbpProductId || !props.cBPartnerId) {
    message.warning('缺少必要参数');
    return;
  }

  const monthValueMap: Record<string, number> = {};
  effectiveMonthCodeList.value.forEach((code) => {
    monthValueMap[code] = Number(row[`month_${code}`]) || 0;
  });

  const monthDetailList = [
    {
      typeName: row.typeName,
      yearSum: Number(row.yearSum) || 0,
      monthValueMap,
    },
  ];

  try {
    await saveAllocate({
      vbpBatchId: props.vbpBatchId,
      vbpProductId: props.vbpProductId,
      cBPartnerId: props.cBPartnerId,
      monthDetailList,
    });
    message.success('保存成功');
    props.onSuccess?.({ expandedId: props?.deptId });
    row.isEdit = false;
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  }
}

// 暴露方法供父组件调用
function loadData(monthDetailList: MonthDetailItem[]) {
  (cardTableRef.value?.gridApi as any)?.grid?.reloadData?.(
    buildRecords(monthDetailList),
  );
}

defineExpose({ loadData });

// 组件挂载时暴露方法给父组件
onMounted(() => {
  emit('ready', { loadData });
});
</script>
<template>
  <!-- border border-[#e2e8f0] rounded-lg p-3-->
  <div class="monthlyUsageTable bg-[#fcfcff] p-2">
    <!-- 表格外层 — 加圆角和阴影 -->
    <div
      class="overflow-hidden rounded-lg border border-[#dbeafe] bg-[#f5f7ff] shadow-sm"
    >
      <div class="p-2 text-[13px] font-[700] text-[#4338CA]">月度用量明细</div>
      <CardTable ref="cardTableRef" :config="cardTableConfig">
        <!-- 月份列插槽 — 非编辑态展示数据，编辑态展示输入框 -->
        <template
          v-for="code in effectiveMonthCodeList"
          :key="code"
          #[`month_${code}`]="{ row }"
        >
          <template v-if="row.isEdit">
            <InputNumber
              v-model:value="row[`month_${code}`]"
              :min="0"
              :controls="false"
              class="w-full text-[12px]"
            />
          </template>
          <template v-else>
            <span class="text-[12px] text-[#374151]">
              {{ Number(row[`month_${code}`] || 0).toLocaleString() }}
            </span>
          </template>
        </template>
        <!-- 年度合计列插槽 -->
        <template #yearSum="{ row }">
          <template v-if="row.isEdit">
            <span class="text-[12px] font-[600] text-[#374151]">
              {{
                effectiveMonthCodeList
                  .reduce(
                    (sum, code) => sum + (Number(row[`month_${code}`]) || 0),
                    0,
                  )
                  .toLocaleString()
              }}
            </span>
          </template>
          <template v-else>
            <span class="text-[12px] font-[600] text-[#374151]">
              {{ Number(row.yearSum || 0).toLocaleString() }}
            </span>
          </template>
        </template>
        <!-- 操作列插槽 -->
        <template #action="{ row }">
          <template v-if="row.isEdit">
            <AntdButton
              :disabled="isActionDisabled"
              type="link"
              @click="handleSave(row)"
              :style="
                isActionDisabled
                  ? 'color: hsl(var(--foreground) / 50%); cursor: not-allowed;'
                  : 'color: #16A34A;'
              "
              class="text-[12px]"
            >
              保存
            </AntdButton>
          </template>
          <template v-else>
            <AntdButton
              :disabled="isActionDisabled"
              type="link"
              @click="handleEdit(row)"
              :style="
                isActionDisabled
                  ? 'color: hsl(var(--foreground) / 50%); cursor: not-allowed;'
                  : 'color: #3B82F6;'
              "
              class="text-[12px]"
            >
              编辑
            </AntdButton>
          </template>
        </template>
      </CardTable>
    </div>
  </div>
</template>
<style scoped>
::v-deep(.monthlyUsageTable .vxe-table--body td) {
  padding: 4px 2px !important;
}
</style>
