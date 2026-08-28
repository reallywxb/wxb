<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { nextTick, onMounted, ref, watch } from 'vue';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import {
  EchartsUI,
  useEcharts,
  type EChartsOption,
} from '@vben/plugins/echarts';
import { Tabs, Input, Button } from 'ant-design-vue';
import { ChcTable } from '#/components/chcTable';
import { useDebounceFn } from '@vueuse/core';
import { AntdArrowLeftOutlined, ExportActionIcon } from '@vben/chc-icons';
import { VxeUI } from 'vxe-table';
import { downloadByData } from '#/utils/file/download';

import { getDrugExecuteDetails, getPoProductDetail, getComparisonAnalysis, exportVBPAnalysis } from './api.js';

const props = defineProps<{
  goBack: () => void;
  batchInfo: any;
}>();

const activeTab = ref('drugDetail');

// ---------- 药品执行明细表格配置 ----------
const drugDetailGridRef = ref<InstanceType<typeof ChcTable>>();
const handleDrugDetailSearch = () => {
  drugDetailGridRef.value?.gridApi.commitProxy('query');
};
const debounceDrugDetailSearch = useDebounceFn(handleDrugDetailSearch, 300);
const drugDetailSearchParams = ref({
  vbpBatchId: props.batchInfo?.vbpBatchId,
  keyword: '',
});
const drugDetailGridOptions = {
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
  round: false,
  border: 'inner',
  stripe: false,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    autoLoad: false,
  },
  height: '',
  minHeight: 0,
};

const drugDetailColumns: VxeGridProps['columns'] = [
  {
    title: '序号',
    type: 'seq',
    width: 40,
    align: 'center',
  },
  {
    field: 'productName',
    title: '通用名',
    minWidth: 140,
    align: 'center',
  },
  {
    field: 'productSpec',
    title: '剂型规格',
    minWidth: 120,
    align: 'center',
  },
  {
    field: 'annualTotalTaskQty',
    title: '年度总任务量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'annualTotalConsume',
    title: '年度完成总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'remainTaskQty',
    title: '剩余任务总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'annualCompletionRate',
    title: '年度完成率',
    minWidth: 110,
    align: 'center',
    slots: { default: 'annualCompletionRate' },
  },
  {
    field: 'monthTotalTaskQty',
    title: '当月任务总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'monthTotalConsume',
    title: '当月完成总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'monthCompletionRate',
    title: '当月完成率',
    minWidth: 110,
    align: 'center',
    slots: { default: 'monthCompletionRate' },
  },
  {
    field: 'timeProgress',
    title: '时间进度',
    minWidth: 100,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue != null ? `${cellValue}%` : '--',
  },
  {
    field: 'progressDiff',
    title: '进度差异',
    minWidth: 100,
    align: 'center',
    slots: { default: 'progressDiff' },
  },
  {
    field: 'deptNames',
    title: '涉及科室',
    minWidth: 180,
    align: 'center',
  },
];

// ---------- 中标/非中标对比分析表格配置 ----------
const compareAnalysisGridRef = ref<InstanceType<typeof ChcTable>>();
const handleCompareAnalysisSearch = async () => {
  await compareAnalysisGridRef.value?.gridApi.commitProxy('query');
  const gridData = compareAnalysisGridRef.value?.gridApi.getFullData() || [];
  await compareAnalysisGridRef.value?.gridApi.setAllCheckboxRow(true);
  renderChart(gridData);
};
const debounceCompareAnalysisSearch = useDebounceFn(
  handleCompareAnalysisSearch,
  300,
);
const compareSearchParams = ref({
  vbpBatchId: props.batchInfo?.vbpBatchId,
  keyword: '',
});
const compareGridOptions = {
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
  round: false,
  border: 'inner',
  stripe: false,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    autoLoad: false,
  },
  headerRowClassName: 'bg-[#f9fafb] text-[#6A7282]',
  rowClassName: 'text-[#6A7282]',
  height: '',
  minHeight: 380,
};

const compareColumns: VxeGridProps['columns'] = [
  {
    title: '',
    type: 'checkbox',
    width: 50,
    align: 'center',
  },
  {
    field: 'productName',
    title: '通用名',
    minWidth: 140,
    align: 'center',
  },
  {
    field: 'productSpec',
    title: '规格',
    minWidth: 120,
    align: 'center',
  },
  {
    field: 'midSelectManufacturer',
    title: '中标生产厂家',
    minWidth: 150,
    align: 'center',
  },
  {
    field: 'midSelectUsageQty',
    title: '中标使用量',
    minWidth: 110,
    align: 'center',
    slots: { default: 'midSelectUsageQty' },
  },
  {
    field: 'midSelectRatio',
    title: '中标占比',
    minWidth: 100,
    align: 'center',
    slots: { default: 'midSelectRatio' },
  },
  {
    field: 'nonMidUsageQty',
    title: '非中标使用量',
    minWidth: 120,
    align: 'center',
    slots: { default: 'nonMidUsageQty' },
  },
  {
    field: 'nonMidRatio',
    title: '非中标占比',
    minWidth: 110,
    align: 'center',
    slots: { default: 'nonMidRatio' },
  },
  {
    field: 'totalUsageQty',
    title: '总用量',
    minWidth: 100,
    align: 'center',
    slots: { default: 'totalUsageQty' },
  },
];

// 完成率颜色计算
const getRateColor = (rate: number) => {
  if (rate >= 90) return '#10b981';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
};

// ---------- 表格查询方法 ----------
const queryDrugDetail = (params: any) => {
  return new Promise((resolve) => {
    getDrugExecuteDetails({
      ...params,
      ...drugDetailSearchParams.value,
    }).then((res) => {
      resolve({ records: res.rows });
    });
  });
};

const queryCompare = (params: any) => {
  return new Promise((resolve) => {
    getComparisonAnalysis({
      ...params,
      ...compareSearchParams.value,
    }).then((res) => {
      resolve({ records: res.rows });
    });
  });
};

// ---------- 图表 ----------
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const renderChart = (gridData: any[] = []) => {
  const xAxisData = gridData.map((item: any) => item.productName || '--');

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let result = `<div style="font-size:12px;">${params[0].axisValue}</div>`;
        params.forEach((item: any) => {
          const value = item.value != null ? item.value : 0;
          const suffix = item.seriesName.includes('占比') ? '%' : '';
          result += `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <span>${item.marker} ${item.seriesName}</span>
            <span style="font-weight:700;text-align:right;">${value}${suffix}</span>
          </div>`;
        });
        return result;
      },
    },
    title: {
      text: `已选 ${gridData.length} 个品种对比分析`,
      left: '0',
      top: '0',
      textStyle: { fontSize: 14, fontWeight: 600, color: '#1f2937' },
    },
    legend: {
      data: ['中标用量', '非中标用量', '中标占比', '非中标占比'],
      left: '20%',
      top: 0,
      itemGap: 16,
      textStyle: { fontSize: 12, color: '#6A7282' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '60px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 11,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '用量',
        axisLabel: { formatter: '{value}' },
        splitLine: {
          lineStyle: { type: 'dashed' },
        },
      },
      {
        type: 'value',
        name: '占比',
        max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '中标用量',
        type: 'bar',
        data: gridData.map((item: any) => item.midSelectUsageQty),
        itemStyle: { color: '#10b981' },
      },
      {
        name: '非中标用量',
        type: 'bar',
        data: gridData.map((item: any) => item.nonMidUsageQty),
        itemStyle: { color: '#ef4444' },
      },
      {
        name: '中标占比',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: gridData.map((item: any) => item.midSelectRatio),
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#3b82f6' },
      },
      {
        name: '非中标占比',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: gridData.map((item: any) => item.nonMidRatio),
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#f97316' },
      },
    ],
  };

  renderEcharts(option);
};

// 监听 Tab 切换，切换到对比分析 Tab 时渲染图表
const drugDetailGridIsLoaded = ref(false);
const compareAnalysisGridIsLoaded = ref(false);
const purchaseDetailGridIsLoaded = ref(false);
watch(
  activeTab,
  (newTab) => {
    if (newTab === 'drugDetail') {
      nextTick(() => {
        if (!drugDetailGridIsLoaded.value) {
          drugDetailGridRef.value?.gridApi.commitProxy('query');
          drugDetailGridIsLoaded.value = true;
        }
      });
    }
    if (newTab === 'compareAnalysis') {
      nextTick(async () => {
        if (!compareAnalysisGridIsLoaded.value) {
          await compareAnalysisGridRef.value?.gridApi.commitProxy('query');
          const gridData =
            compareAnalysisGridRef.value?.gridApi.getFullData() || [];
          await compareAnalysisGridRef.value?.gridApi.setAllCheckboxRow(true);
          console.log('对比分析 gridData:', gridData);
          renderChart(gridData);
          compareAnalysisGridIsLoaded.value = true;
        }
      });
    }
    if (newTab === 'purchaseDetail') {
      nextTick(() => {
        if (!purchaseDetailGridIsLoaded.value) {
          purchaseDetailGridRef.value?.gridApi.commitProxy('query');
          purchaseDetailGridIsLoaded.value = true;
        }
      });
    }
  },
  {
    immediate: true,
  },
);
const checkBoxChange = () => {
  const checkedRows =
    compareAnalysisGridRef.value?.gridApi.getCheckboxRecords(true);
  console.log(checkedRows);
  renderChart(checkedRows);
};

// ---------- 药品采购执行明细表格配置 ----------
const purchaseDetailGridRef = ref<InstanceType<typeof ChcTable>>();
const handlePurchaseDetailSearch = () => {
  purchaseDetailGridRef.value?.gridApi.commitProxy('query');
};
const debouncePurchaseDetailSearch = useDebounceFn(handlePurchaseDetailSearch, 300);
const purchaseDetailSearchParams = ref({
  vbpBatchId: props.batchInfo?.vbpBatchId,
  keyword: '',
});
const purchaseDetailGridOptions = {
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
  round: false,
  border: 'inner',
  stripe: false,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    autoLoad: false,
  },
  height: '',
  minHeight: 0,
};

const purchaseDetailColumns: VxeGridProps['columns'] = [
  {
    title: '序号',
    type: 'seq',
    width: 40,
    align: 'center',
  },
  {
    field: 'productName',
    title: '通用名',
    minWidth: 140,
    align: 'center',
  },
  {
    field: 'productSpec',
    title: '剂型规格',
    minWidth: 120,
    align: 'center',
  },
  {
    field: 'annualTotalTaskQty',
    title: '年度总任务量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'annualTotalConsume',
    title: '年度总采购量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'remainTaskQty',
    title: '剩余任务总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'annualCompletionRate',
    title: '年度完成率',
    minWidth: 110,
    align: 'center',
    slots: { default: 'annualCompletionRate' },
  },
  {
    field: 'monthTotalTaskQty',
    title: '当月任务总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'monthTotalConsume',
    title: '当月完成总量',
    minWidth: 120,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'monthCompletionRate',
    title: '当月完成率',
    minWidth: 110,
    align: 'center',
    slots: { default: 'monthCompletionRate' },
  },
  {
    field: 'timeProgress',
    title: '时间进度',
    minWidth: 100,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue != null ? `${cellValue}%` : '--',
  },
  {
    field: 'progressDiff',
    title: '进度差异',
    minWidth: 100,
    align: 'center',
    slots: { default: 'progressDiff' },
  },
  // {
  //   field: 'deptNames',
  //   title: '涉及科室',
  //   minWidth: 180,
  //   align: 'center',
  // },
];

const queryPurchaseDetail = (params: any) => {
  return new Promise((resolve) => {
    getPoProductDetail({
      ...params,
      ...purchaseDetailSearchParams.value,
    }).then((res) => {
      resolve({ records: res.rows });
    });
  });
};

// ---------- 导出功能 ----------
const handleExportDrugDetail = async () => {
  try {
    const res = await exportVBPAnalysis('consume', props.batchInfo?.vbpBatchId);
    if (res.type === 'application/json') {
      const text = await res.text();
      const json = JSON.parse(text);
      VxeUI.modal.message({
        content: json?.msg || '导出失败',
        status: 'error',
      });
      return;
    }
    downloadByData(res, '药品执行明细.xls', 'application/vnd.ms-excel');
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
};

const handleExportPurchaseDetail = async () => {
  try {
    const res = await exportVBPAnalysis('procurement', props.batchInfo?.vbpBatchId);
    if (res.type === 'application/json') {
      const text = await res.text();
      const json = JSON.parse(text);
      VxeUI.modal.message({
        content: json?.msg || '导出失败',
        status: 'error',
      });
      return;
    }
    downloadByData(res, '药品采购执行明细.xls', 'application/vnd.ms-excel');
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
};

onMounted(() => {
  // 默认选中所有行（在数据加载后处理）
});
</script>

<template>
  <div class="bg-[#f5f7fa] font-sans">
    <!-- 顶部返回和批次信息 -->
    <div class="border-b border-[hsl(var(--border))] bg-white px-6 py-4">
      <!-- 返回按钮 + 批次信息 -->
      <div class="flex items-center gap-2">
        <div
          class="group flex cursor-pointer items-center gap-1"
          @click="props.goBack()"
        >
          <AntdArrowLeftOutlined
            class="text-gray-500 group-hover:text-blue-600"
          />
          <span class="text-sm text-gray-500 group-hover:text-blue-600"
            >返回总览</span
          >
        </div>
        <span
          class="rounded px-2 py-0.5 text-xs font-medium"
          :class="
            batchInfo?.batchType === 'N'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-purple-50 text-purple-600'
          "
        >
          {{ batchInfo?.batchTypeName }}
        </span>
        <span class="text-lg font-bold text-gray-800">{{
          batchInfo?.batchName
        }}</span>
        <span
          class="rounded px-2 py-0.5 text-xs font-medium"
          :class="
            batchInfo?.status === '执行中'
              ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-500'
          "
        >
          {{ batchInfo?.status }}
        </span>
        <span class="text-sm text-gray-400"
          >{{ batchInfo?.beginDate }} ~ {{ batchInfo?.endDate }}</span
        >
      </div>

      <!-- 统计卡片 -->
      <div class="mt-4 flex gap-6">
        <div class="flex flex-col">
          <span class="text-xs text-gray-400">年度总任务量</span>
          <span class="text-xl font-bold text-blue-600">{{
            batchInfo?.annualTotalTaskQty?.toLocaleString() ?? '--'
          }}</span>
        </div>
        <!-- <div class="flex flex-col">
          <span class="text-xs text-gray-400">总体完成率</span>
          <span class="text-xl font-bold text-green-600">{{
            batchInfo?.overallCompletionRate != null
              ? `${batchInfo.overallCompletionRate}%`
              : '--'
          }}</span>
        </div> -->
        <div class="flex flex-col">
          <span class="text-xs text-gray-400">中标使用比例</span>
          <span class="text-xl font-bold text-blue-500">{{
            batchInfo?.midSelectUsageRatio != null
              ? `${batchInfo.midSelectUsageRatio}%`
              : '--'
          }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-400">中标完成比例</span>
          <span class="text-xl font-bold text-cyan-600">{{
            batchInfo?.midSelectCompletionRatio != null
              ? `${batchInfo.midSelectCompletionRatio}%`
              : '--'
          }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-400">预警品规</span>
          <span class="text-xl font-bold text-red-500"
            >{{ batchInfo?.warningSpecCount ?? 0 }}个</span
          >
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="bg-white">
      <Tabs v-model:activeKey="activeTab" class="detailTab">
        <!-- 药品执行明细 -->
        <Tabs.TabPane key="drugDetail" class="px-2">
          <template #tab>
            <div class="flex items-center gap-1.5">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>药品执行明细</span>
            </div>
          </template>

          <!-- 搜索框 & 完成率图例 -->
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Input
                placeholder="搜索通用名或规格"
                v-model:value="drugDetailSearchParams.keyword"
                class="w-64"
                allow-clear
                @keyup.enter="handleDrugDetailSearch"
                @change="debounceDrugDetailSearch"
              />
              <Button type="primary" @click="handleExportDrugDetail">
                导出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </div>

            <!-- 完成率图例 -->
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>完成率：</span>
              <div class="flex items-center gap-1">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-green-500"
                ></span>
                <span>≥90%</span>
              </div>
              <div class="flex items-center gap-1">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-yellow-500"
                ></span>
                <span>50%~89%</span>
              </div>
              <div class="flex items-center gap-1">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-red-500"
                ></span>
                <span>&lt;50%</span>
              </div>
            </div>
          </div>

          <!-- 表格 -->
          <ChcTable
            ref="drugDetailGridRef"
            id="drugDetail"
            :gridColumns="drugDetailColumns"
            :gridOptions="drugDetailGridOptions"
            :queryTableDataApi="queryDrugDetail"
            style="padding: 0"
            :tableContainerStyles="{ height: 'auto' }"
          >
            <!-- 年度完成率 -->
            <template #annualCompletionRate="{ row }">
              <span
                v-if="row.annualCompletionRate != null"
                :style="{
                  color: getRateColor(row.annualCompletionRate),
                  fontWeight: '600',
                }"
              >
                {{ row.annualCompletionRate }}%
              </span>
              <span v-else>--</span>
            </template>
            <!-- 当月完成率 -->
            <template #monthCompletionRate="{ row }">
              <span
                v-if="row.monthCompletionRate != null"
                :style="{
                  color: getRateColor(row.monthCompletionRate),
                  fontWeight: '600',
                }"
              >
                {{ row.monthCompletionRate }}%
              </span>
              <span v-else>--</span>
            </template>
            <!-- 进度差异 -->
            <template #progressDiff="{ row }">
              <span
                v-if="row.progressDiff != null"
                class="rounded px-2 py-0.5 font-semibold"
                :class="
                  row.progressDiff >= 0
                    ? 'bg-green-50 text-green-500'
                    : 'bg-red-50 text-red-500'
                "
              >
                {{ row.progressDiff }}%
              </span>
              <span v-else>--</span>
            </template>
          </ChcTable>
        </Tabs.TabPane>

        <!-- 中标/非中标对比分析 -->
        <Tabs.TabPane key="compareAnalysis" class="px-2">
          <template #tab>
            <div class="flex items-center gap-1.5">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>中标/非中标对比分析</span>
            </div>
          </template>

          <!-- 搜索框 -->
          <div class="mb-2">
            <Input
              placeholder="搜索通用名或规格"
              v-model:value="compareSearchParams.keyword"
              class="w-64"
              allow-clear
              @keyup.enter="handleCompareAnalysisSearch"
              @change="debounceCompareAnalysisSearch"
            />
          </div>

          <!-- 对比表格 -->
          <ChcTable
            ref="compareAnalysisGridRef"
            id="compareAnalysis"
            :gridColumns="compareColumns"
            :gridOptions="compareGridOptions"
            :queryTableDataApi="queryCompare"
            style="padding: 0"
            :tableContainerStyles="{ height: 'auto' }"
            @checkbox-change="checkBoxChange"
            @checkbox-all="checkBoxChange"
          >
            <!-- 中标使用量 -->
            <template #midSelectUsageQty="{ row }">
              <span class="font-semibold text-green-600">
                {{ row.midSelectUsageQty?.toLocaleString() ?? '--' }}
              </span>
            </template>
            <!-- 中标占比 -->
            <template #midSelectRatio="{ row }">
              <span
                v-if="row.midSelectRatio != null"
                :style="{
                  color: getRateColor(row.midSelectRatio),
                  fontWeight: '600',
                }"
              >
                {{ row.midSelectRatio }}%
              </span>
              <span v-else>--</span>
            </template>
            <!-- 非中标使用量 -->
            <template #nonMidUsageQty="{ row }">
              <span class="font-semibold text-red-500">
                {{ row.nonMidUsageQty?.toLocaleString() ?? '--' }}
              </span>
            </template>
            <!-- 非中标占比 -->
            <template #nonMidRatio="{ row }">
              <span
                v-if="row.nonMidRatio != null"
                :style="{
                  color: getRateColor(100 - row.nonMidRatio),
                  fontWeight: '600',
                }"
              >
                {{ row.nonMidRatio }}%
              </span>
              <span v-else>--</span>
            </template>
            <!-- 总用量 -->
            <template #totalUsageQty="{ row }">
              <span class="font-semibold">
                {{ row.totalUsageQty?.toLocaleString() ?? '--' }}
              </span>
            </template>
          </ChcTable>

          <!-- 图表 -->
          <div class="mt-6">
            <EchartsUI ref="chartRef" height="400px" />
          </div>
        </Tabs.TabPane>

        <!-- 药品采购执行明细 -->
        <Tabs.TabPane key="purchaseDetail" class="px-2">
          <template #tab>
            <div class="flex items-center gap-1.5">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>药品采购执行明细</span>
            </div>
          </template>

          <!-- 搜索框 & 完成率图例 -->
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Input
                placeholder="搜索通用名或规格"
                v-model:value="purchaseDetailSearchParams.keyword"
                class="w-64"
                allow-clear
                @keyup.enter="handlePurchaseDetailSearch"
                @change="debouncePurchaseDetailSearch"
              />
              <Button type="primary" @click="handleExportPurchaseDetail">
                导出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </div>

            <!-- 完成率图例 -->
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>完成率：</span>
              <div class="flex items-center gap-1">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-green-500"
                ></span>
                <span>≥90%</span>
              </div>
              <div class="flex items-center gap-1">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-yellow-500"
                ></span>
                <span>50%~89%</span>
              </div>
              <div class="flex items-center gap-1">
                <span
                  class="inline-block h-2 w-2 rounded-full bg-red-500"
                ></span>
                <span>&lt;50%</span>
              </div>
            </div>
          </div>

          <!-- 表格 -->
          <ChcTable
            ref="purchaseDetailGridRef"
            id="purchaseDetail"
            :gridColumns="purchaseDetailColumns"
            :gridOptions="purchaseDetailGridOptions"
            :queryTableDataApi="queryPurchaseDetail"
            style="padding: 0"
            :tableContainerStyles="{ height: 'auto' }"
          >
            <!-- 年度完成率 -->
            <template #annualCompletionRate="{ row }">
              <span
                v-if="row.annualCompletionRate != null"
                :style="{
                  color: getRateColor(row.annualCompletionRate),
                  fontWeight: '600',
                }"
              >
                {{ row.annualCompletionRate }}%
              </span>
              <span v-else>--</span>
            </template>
            <!-- 当月完成率 -->
            <template #monthCompletionRate="{ row }">
              <span
                v-if="row.monthCompletionRate != null"
                :style="{
                  color: getRateColor(row.monthCompletionRate),
                  fontWeight: '600',
                }"
              >
                {{ row.monthCompletionRate }}%
              </span>
              <span v-else>--</span>
            </template>
            <!-- 进度差异 -->
            <template #progressDiff="{ row }">
              <span
                v-if="row.progressDiff != null"
                class="rounded px-2 py-0.5 font-semibold"
                :class="
                  row.progressDiff >= 0
                    ? 'bg-green-50 text-green-500'
                    : 'bg-red-50 text-red-500'
                "
              >
                {{ row.progressDiff }}%
              </span>
              <span v-else>--</span>
            </template>
          </ChcTable>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </div>
</template>
<style scoped>
::v-deep(.detailTab .ant-tabs-nav-wrap) {
  margin-left: 20px;
}
::v-deep(.detailTab .vxe-grid) {
  padding: 0;
}
::v-deep(
  .detailTab
    .vxe-grid
    .vxe-table--render-default.border--full
    .vxe-table--main-wrapper
) {
  border-bottom: none !important;
}
</style>
