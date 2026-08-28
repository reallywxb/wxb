<script setup lang="ts">
import type { GridColumn } from '@vben/chc-ui';

import { computed } from 'vue';

// import {
//   MdiCheckboxBlankOutline,
//   MdiCheckboxMarkedOutline,
// } from '@vben/chc-icons';

import { Card } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

/** CardTable 配置对象，可拓展 */
export interface CardTableConfig {
  /** 唯一标识 */
  id?: string;
  /** 查询接口地址 */
  queryUrl: string;
  /** 表格列配置 */
  gridColumns: GridColumn[];
  /** 请求前参数处理 */
  beforeFetchFn?: (params: Record<string, any>) => false | Record<string, any>;
  /** 请求后数据处理 */
  afterFetchFn?: (params: Record<string, any>) => {
    records: any[];
    total: number;
  };
  /** 表格事件配置 */
  gridEvents?: Record<string, (...args: any[]) => any>;
  /** 表格选项 */
  gridOptions?: Record<string, any>;
  /** 其他拓展配置 */
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    config?: CardTableConfig;
    /** 是否显示标题栏，默认 true */
    showHeader?: boolean;
  }>(),
  {
    config: () => ({ queryUrl: '', gridColumns: [] }),
    showHeader: false,
  },
);

const emit = defineEmits<{
  radioChange: [row: any];
}>();
// 合并默认 gridOptions 与传入的 gridOptions
const defaultGridOptions: Record<string, any> = {
  headerCellConfig: {
    height: 36,
  },
  cellConfig: {
    height: 40,
  },
  columnConfig: {
    resizable: false,
  },
  rowConfig: {
    isCurrent: false,
  },
  virtualXConfig:{
    enabled:false
  },
  virtualYConfig:{
    enabled:false
  },
  round: false,
  border: 'inner',
  stripe: false,
  pagerConfig: {
    layouts: [
      'Total',
      'Sizes',
      'PrevJump',
      'PrevPage',
      'Number',
      'NextPage',
      'NextJump',
      'FullJump',
      'PageCount',
    ],
    border: true,
    align: 'center',
    className: 'w-full card-pager',
  },
  headerRowClassName: 'bg-[#f9fafb] text-[#6A7282]',
  rowClassName: 'text-[#6A7282]',
};
const mergedGridOptions = deepMerge(
  defaultGridOptions,
  props.config.gridOptions || {},
);

// 解构配置对象到表格配置
const {
  queryUrl,
  gridColumns,
  beforeFetchFn,
  afterFetchFn,
  gridEvents: configGridEvents,
  id,
  ...extraConfig
} = props.config;

// 从传入的 gridEvents 中取出 radioChange（如有），避免被后续 spread 覆盖
const { radioChange: configRadioChange, ...otherGridEvents } =
  configGridEvents || {};

// 合并内部 radioChange 与传入的 radioChange
function handleRadioChange({ row }: { row: any }) {
  emit('radioChange', row);
  if (configRadioChange) {
    configRadioChange({ row });
  }
}

// 从 gridColumns 中提取所有需要透传的插槽名（列的 slots.default 值，仅字符串类型）
const forwardedSlotNames = computed<string[]>(() => {
  const names: string[] = [];
  for (const col of gridColumns || []) {
    const slotName = (col as any).slots?.default;
    if (typeof slotName === 'string') {
      names.push(slotName);
    }
  }
  return names;
});

const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    gridOptions: mergedGridOptions,
    gridClass: 'p-0 text-[#6A7282]',
  },
  {
    id: id || 'rightViewComponentParent',
    queryUrl,
    gridColumns,
    beforeFetchFn,
    afterFetchFn:
      afterFetchFn ||
      ((params: Record<string, any>) => ({
        ...params,
        records: params.rows,
        total: params.total,
      })),
    gridEvents: {
      radioChange: handleRadioChange,
      ...otherGridEvents,
    },
    ...extraConfig,
  },
);

function refresh() {
  chcGridApi.reload();
}

defineExpose({ refresh, gridApi: chcGridApi, handleExport });

// function toggleAllCheckboxEvent() {
//   const $grid = chcGridApi.grid;
//   if ($grid) {
//     $grid.toggleAllCheckboxRow();
//   }
// }

// function toggleCheckboxEvent(row: any, _: any) {
//   const $grid = chcGridApi.grid;
//   if ($grid) {
//     $grid.toggleCheckboxRow(row);
//   }
// }

// type AlignType = 'center' | 'left' | 'right';
// const ALIGN_MAP = {
//   left: 'flex-start',
//   center: 'center',
//   right: 'flex-end',
// };
</script>
<template>
  <Card
    :bordered="false"
    style="border-radius: 0"
    class="cardTableContainer rounded-0 h-full w-full"
    :head-style="
      showHeader
        ? {
            borderRadius: '0px 0px 0px 0px',
            padding: 0,
            flexGrow: 0,
            flexShrink: 0,
            height: '78px',
          }
        : { display: 'none' }
    "
    :body-style="{
      borderRadius: '0px 0px 0px 0px',
      padding: 0,
      height: showHeader ? 'calc(100% - 78px)' : '100%',
    }"
  >
    <template v-if="showHeader" #title>
      <slot name="title"></slot>
    </template>
    <ChcGrid class="quotaGrid w-full p-0">
      <template #toolbar-actions>
        <slot name="toolbar-actions"></slot>
      </template>
      <!-- <template #checkbox_header="{ checked, indeterminate, column }">
        <span
          :style="{
            display: 'flex',
            justifyContent: ALIGN_MAP[column.align as AlignType],
          }"
          @click.stop="toggleAllCheckboxEvent"
        >
          <i v-if="indeterminate" class="vxe-icon-square-minus-fill"></i>
          <MdiCheckboxMarkedOutline
            class="text-[18px]"
            color="#1D4ED8"
            v-else-if="checked"
          />
          <MdiCheckboxBlankOutline class="text-[18px]" color="#B0BCCE" v-else />
        </span>
      </template> -->

      <!-- <template #checkbox_cell="{ row, checked, indeterminate, column }">
        <span
          :style="{
            display: 'flex',
            justifyContent: ALIGN_MAP[column.align as AlignType],
          }"
          @click.stop="toggleCheckboxEvent(row, column)"
        >
          <i v-if="indeterminate" class="vxe-icon-square-minus-fill"></i>
          <MdiCheckboxMarkedOutline
            class="text-[18px]"
            color="#1D4ED8"
            v-else-if="checked"
          />
          <MdiCheckboxBlankOutline class="text-[18px]" color="#B0BCCE" v-else />
        </span>
      </template> -->

      <template #action="slotProps">
        <slot name="action" v-bind="slotProps"></slot>
      </template>

      <template #expand_content="slotProps">
        <slot name="expand_content" v-bind="slotProps"></slot>
      </template>

      <!-- 动态插槽透传：将 forwardedSlotNames 中的插槽转发给 ChcGrid -->
      <template
        v-for="slotName in forwardedSlotNames"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </ChcGrid>
  </Card>
</template>
<style scoped lang="scss">
::v-deep(.card-pager) {
  padding: 4px 0;

  /* background-color: #bfdbfe; */
  background-color: #fafbff;

  button {
    border: 1px solid #d1d5db;
  }

  .vxe-pager--sizes {
    margin-right: 0;
  }

  .vxe-pager--jump-prev {
    margin-left: auto;
  }

  .vxe-pager--jump-next {
    margin-right: auto;
  }

  .vxe-pager--count {
    // line-height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
