<script lang="ts" setup>
import type { ParentTableType, PriceAdjDetailsRowType } from './type';

import { nextTick, onMounted, provide, ref, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Modal as AntModal,
  Button,
  message,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepClone, deepMerge } from '#/utils/util';

import priceAdjDetailsCom from './table/priceAdjDetails.vue'; // 调价明细
import priceAdjResultCom from './table/priceAdjResult.vue'; // 调价结果
import { requestClient, requestFormClient } from '#/api/request';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
// 存储当前选中的父表行数据
const selectedParentRow = ref<null | ParentTableType>(null);
// 存储当前选中的调价明细行数据(子表2依赖子表1的选中)
const selectedDetailRow = ref<any>(null);
const tableExtraParams = ref<Record<string, any>>({
  page: urlParams.page || '',
  docStatus: 'CO',
});
const isFirstLoaded = ref(false); // 是否已初次加载完
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  const formValues = (await ChcGridApi?.formApi?.getValues()) || {};
  ChcGridApi.query({ ...formValues });
  isFirstLoaded.value = true;
});

// 父表行切换的逻辑
const handleParentRadioChange = ({ row }: { row: null | ParentTableType }) => {
  console.warn('父表选中行变化 ===>', row);
  selectedParentRow.value = row ? deepClone(row) : null;
  // 清空下游所有数据和状态
  selectedDetailRow.value = null;
  priceAdjDetailsComRef.value?.clear();
  priceAdjResultComRef.value?.clear();
  // 触发第一个子表(调价明细)查询
  if (selectedParentRow.value?.priceListAdjId) {
    priceAdjDetailsComRef.value?.query();
  }
};
onMounted(() => {
  searchController.sign(1);
});
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      proxyConfig: {
        autoLoad: false,
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
    id: 'priceListAdjQuery_parent',
    queryUrl: '/productAction/queryPriceListAdj.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      {
        field: 'sitePriceListAdjId',
        minWidth: 130,
        sortable: true,
        title: '调价单号',
      },
      {
        field: 'docDate',
        minWidth: 120,
        sortable: true,
        title: '单据日期',
      },

      {
        field: 'adjNo',
        minWidth: 160,
        sortable: true,
        title: '调价文号',
      },
      {
        field: 'adjTypeName',
        minWidth: 100,
        sortable: true,
        title: '调价类型',
      },
      {
        field: 'effectiveTime',
        title: '生效时间',
        sortable: true,
        width: '140',
      },
      {
        field: 'productCount',
        title: '品种数',
        sortable: true,
        width: '100',
        align: 'right',
      },
      {
        field: 'docStatusName',
        width: '100',
        sortable: true,
        title: '单据状态',
      },
      {
        field: 'adjReason',
        width: '200',
        sortable: true,
        title: '调价原因',
      },
      {
        field: 'createdByName',
        width: '100',
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        width: '120',
        sortable: true,
        title: '创建时间',
      },
      {
        field: 'approveUserName',
        width: '100',
        sortable: true,
        title: '审批人',
      },
      {
        field: 'approveTime',
        width: '160',
        sortable: true,
        title: '审批时间',
      },
      {
        field: 'description',
        width: '200',
        sortable: true,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '单据日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            // .subtract(2, 'week')
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'sitePriceListAdjId',
        label: '调价单号',
        componentProps: () => {
          return {
            placeholder: '请输入调价单号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入编码/搜索码/名称',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: handleParentRadioChange,
      // 添加行样式处理选中行高亮
      // rowStyle: ({ row }: { row: any }) => {
      // },
    },
    tableSearchExtraParams: tableExtraParams.value, // 接口额外参数
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn===>', params);
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      // const records = params.rows || [];
      // // 数据加载后，自动选中第一行
      // if (records.length > 0) {
      //   nextTick(() => {
      //     ChcGridApi.grid.setRadioRow(records[0]);
      //     // 主动调用行切换处理函数，触发子表加载
      //     handleParentRadioChange({ row: records[0] });
      //   });
      // } else {
      //   // 【优化点】如果主表没有数据，确保清空所有子表
      //   handleParentRadioChange({ row: null });
      // }
      priceAdjDetailsComRef.value?.clear();
      priceAdjResultComRef.value?.clear();
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 明细表数据加载完成后的处理逻辑
const handleDetailDataLoaded = (row: null | PriceAdjDetailsRowType) => {
  console.warn('handleDetailDataLoaded===>', row);
  selectedDetailRow.value = row;
  if (currentTab.value === TabVal.PriceAdjResult && selectedDetailRow.value) {
    priceAdjResultComRef.value?.query();
  }
};

// 子表组件隐射
const TabVal = {
  PriceAdjDetails: 'priceAdjDetails', // 调价明细
  PriceAdjResult: 'priceAdjResult', // 调价结果
} as const;

// 子表头部切换
const headerTabs = ref([
  {
    label: '调价明细',
    value: 'priceAdjDetails',
    disabled: false,
  },
  {
    label: '调价结果',
    value: 'priceAdjResult',
    disabled: false,
  },
]);

// 子表头部切换默认值
const currentTab = ref<(typeof TabVal)[keyof typeof TabVal]>(
  TabVal.PriceAdjDetails,
);

const priceAdjDetailsComRef = useTemplateRef<
  InstanceType<typeof priceAdjDetailsCom>
>('priceAdjDetailsComRef');

const priceAdjResultComRef = useTemplateRef<
  InstanceType<typeof priceAdjResultCom>
>('priceAdjResultComRef');

// 打印
const handlePrint = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrint row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const priceListAdjId = (row as ParentTableType).priceListAdjId;
  AntModal.confirm({
    title: '打印提示',
    content: '确认打印调价单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printOutputDoc.do?id=${priceListAdjId}`,
      });
    },
    onCancel() {},
  });
};
// 执行
const handleExecutor = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrint row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const priceListAdjId = (row as ParentTableType).priceListAdjId;
  AntModal.confirm({
    title: '执行提示',
    content: '确认执行调价单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      requestFormClient.get(
        `/productAction/doAdj.do?priceListAdjId=${priceListAdjId}`,
      );
    },
    onCancel() {},
  });
};

// 【新增逻辑】监听 tab 切换，确保切换时能主动刷新数据
watch(currentTab, (newTab, oldTab) => {
  console.warn(` Tab从 ${oldTab} 切换到: ${newTab}`);
  // 确保子组件已经渲染完成
  nextTick(() => {
    if (newTab === TabVal.PriceAdjDetails) {
      // 切换到明细 tab 时，如果父行存在，就刷新
      if (selectedParentRow.value) {
        priceAdjDetailsComRef.value?.query();
      }
    } else if (
      newTab === TabVal.PriceAdjResult && // 切换到结果 tab 时，如果明细行存在，就刷新
      selectedDetailRow.value
    ) {
      priceAdjResultComRef.value?.query();
    }
  });
});

// 定义子表接口入参
provide('currentReport', selectedParentRow);
// 将调价明细的选中行也注入给调价明细组件
provide('selectedDetailRow', selectedDetailRow);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handlePrint"
                class="mr-[0.5rem]"
                data-testid="button_print"
              >
                打 印
              </Button>

              <Button
                type="primary"
                @click="handleExecutor"
                class="mr-[0.5rem]"
                data-testid="button_executor"
              >
                执行
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <div
            class="relative box-border flex h-full w-full flex-col items-start justify-start bg-white"
          >
            <div class="box-border w-full bg-white p-[8.4px_8px]">
              <RadioGroup v-model:value="currentTab" button-style="solid">
                <template v-for="item in headerTabs" :key="item.value">
                  <RadioButton
                    :value="item.value"
                    :disabled="item.disabled"
                    :data-testid="`radio_tab_${item.value}_child`"
                  >
                    {{ item.label }}
                  </RadioButton>
                </template>
              </RadioGroup>
            </div>
            <div class="bg-pink relative box-border w-full flex-1">
              <div class="absolute box-border h-full w-full">
                <!-- <component :is="component"></component> -->
                <priceAdjDetailsCom
                  ref="priceAdjDetailsComRef"
                  v-show="currentTab === TabVal.PriceAdjDetails"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[0] as PageTab"
                  @data-loaded="handleDetailDataLoaded"
                />
                <priceAdjResultCom
                  ref="priceAdjResultComRef"
                  v-show="currentTab === TabVal.PriceAdjResult"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[1] as PageTab"
                />
              </div>
            </div>
          </div>
        </template>
      </PageSplitLazy>
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

/* 父表选中行高亮样式 */
::v-deep(.vxe-row--radio-active) {
  background-color: #d1ecea !important;
}

::v-deep(.vxe-body--row:hover .vxe-cell) {
  background-color: #f0f9ff !important;
}

/* 确保radio列可见 */
::v-deep(.vxe-column--type-radio) {
  display: table-cell !important;
}

::v-deep(
  .vxe-table--render-default .vxe-body--row.row--current > .vxe-body--column
) {
  background-color: #d1ecea !important;
}
</style>
