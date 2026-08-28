<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import type { VbenFormProps } from '#/adapter/form';

import { computed, onMounted, ref, watch, nextTick } from 'vue';

import {
  // AntdFundProjectionScreenOutlined,
  AntdTeamOutlined,
} from '@vben/chc-icons';
import { useVbenForm } from '#/adapter/form';
import { ChcTable } from '#/components/chcTable';
import {
  EchartsUI,
  useEcharts,
  type EChartsOption,
  type EchartsUIType,
} from '@vben/plugins/echarts';
import { Tabs } from 'ant-design-vue';

import {
  getDeptExecuteDetails,
  getDeptMonthlyAnalysis,
  getVBPAnalysis,
} from './api';

// ========== 批次列表 ==========

const batchList = ref<any[]>([]);

const selectedBatchId = ref<string | number>('');
const selectedBatch = computed(() =>
  batchList.value.find((b) => b.vbpBatchId === selectedBatchId.value),
);

// 获取批次数据
async function fetchBatchList() {
  try {
    const res = await getVBPAnalysis();
    if (res?.success && res.data?.batchOverviews) {
      batchList.value = res.data.batchOverviews;
      // 默认选中第一个批次
      if (batchList.value.length > 0) {
        selectedBatchId.value = batchList.value[0].vbpBatchId;
      }
    }
  } catch (e) {
    console.error('获取集采批次失败:', e);
  }
}

const activeTab = ref('department');

// ========== 搜索表单 ==========

const defaultFormProps: VbenFormProps = {
  collapsed: false,
  showCollapseButton: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    hideLabel: true,
    formItemClass: 'mr-2 pb-0',
  },
  actionWrapperClass: 'pb-0 col-span-1 text-left pt-[2px]',
  actionPosition: 'left',
  layout: 'horizontal',
  submitButtonOptions: {
    content: '查询',
  },
  resetButtonOptions: {
    show: true,
  },
  wrapperClass: 'grid-cols-4',
};

const deptSearchSchema = [
  {
    component: 'ChcSelect',
    fieldName: 'wardArea',
    label: '院区',
    componentProps: {
      placeholder: '请选择院区名称',
      allowClear: true,
      options: [
        { label: '东院区', value: '东院区' },
        { label: '西院区', value: '西院区' },
        { label: '南院区', value: '南院区' },
      ],
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'deptLevel',
    label: '科室等级',
    componentProps: {
      placeholder: '一级科室',
      allowClear: true,
      options: [
        { label: '一级科室', value: '1' },
        { label: '二级科室', value: '2' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'keyword',
    label: '科室',
    componentProps: {
      placeholder: '搜索科室名称/编码...',
      allowClear: true,
    },
  },
];

const [SearchForm, searchFormApi] = useVbenForm({
  ...defaultFormProps,
  schema: deptSearchSchema,
  handleSubmit: () => {
    handleSearch();
  },
});

function handleSearch() {
  deptGridRef.value?.gridApi?.commitProxy('query', { hahaha: 123 });
}

function handleReset() {
  searchFormApi?.resetForm?.();
  deptGridRef.value?.gridApi?.commitProxy('query');
}

// ========== 月度搜索表单 ==========

const monthlySearchSchema = [
  {
    component: 'ChcSelect',
    fieldName: 'wardArea',
    label: '院区',
    componentProps: {
      placeholder: '请选择院区名称',
      allowClear: true,
      options: [
        { label: '东院区', value: '东院区' },
        { label: '西院区', value: '西院区' },
        { label: '南院区', value: '南院区' },
      ],
    },
  },
  {
    component: 'Input',
    fieldName: 'keyword',
    label: '关键词',
    componentProps: {
      placeholder: '搜索科室/通用名...',
      allowClear: true,
    },
  },
];

const [MonthlySearchForm, monthlySearchFormApi] = useVbenForm({
  ...defaultFormProps,
  schema: monthlySearchSchema,
  handleSubmit: () => {
    handleMonthlySearch();
  },
});

function handleMonthlySearch() {
  monthlyGridRef.value?.gridApi?.commitProxy('query');
}

function handleMonthlyReset() {
  monthlySearchFormApi?.resetForm?.();
  monthlyGridRef.value?.gridApi?.commitProxy('query');
}

// ========== 完成率/进度差颜色 ==========

function getRateColor(val: number): string {
  if (val >= 80) return '#16A34A';
  if (val >= 60) return '#D97706';
  return '#EF4444';
}

function getDiffColor(val: number): string {
  if (val >= 0) return '#16A34A';
  return '#EF4444';
}

// ========== ChcTable refs ==========

const deptGridRef = ref<InstanceType<typeof ChcTable>>();
const monthlyGridRef = ref<InstanceType<typeof ChcTable>>();

// ========== Tab 1: 科室汇总分析列配置 ==========

const deptGridOptions: VxeGridProps = {
  headerCellConfig: { height: 36 },
  cellConfig: { height: 40 },
  columnConfig: { resizable: false },
  rowConfig: { isCurrent: false },
  round: false,
  border: 'inner',
  stripe: false,
  pagerConfig: { enabled: false },
  proxyConfig: { autoLoad: false },
  height: 'auto',
  virtualXConfig: {
    enabled: false,
  },
  virtualYConfig: {
    enabled: false,
  },
  // maxHeight:500
  // minHeight: 380,
};

const deptColumns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
  {
    field: 'deptName',
    title: '科室名称',
    minWidth: 120,
    align: 'center',
    slots: { default: 'deptName' },
  },
  {
    field: 'deptCode',
    title: '科室编码',
    width: 90,
    align: 'center',
  },
  {
    field: 'annualTargetQty',
    title: '年度目标量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'cumulativeComplete',
    title: '累计完成量',
    width: 100,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'remainTaskQty',
    title: '剩余任务量',
    width: 100,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'completionRate',
    title: '完成率',
    width: 90,
    align: 'center',
    slots: { default: 'completionRate' },
  },
  {
    field: 'timeProgress',
    title: '时间进度',
    width: 90,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue != null ? cellValue + '%' : '--',
  },
  {
    field: 'progressDiff',
    title: '进度差异',
    width: 90,
    align: 'center',
    slots: { default: 'progressDiff' },
  },
  {
    field: 'midSelectUsageQty',
    title: '中标使用量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'midSelectUsageRate',
    title: '中标使用率',
    width: 100,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue != null ? cellValue + '%' : '--',
  },
  {
    field: 'nonMidUsageQty',
    title: '非中标用量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'nonMidUsageRate',
    title: '非中标使用率',
    width: 120,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue != null ? cellValue + '%' : '--',
  },
  {
    field: 'warningCount',
    title: '预警数',
    width: 70,
    align: 'center',
    slots: { default: 'warningCount' },
  },
];

// ========== 图表 refs ==========

const deptCompletionChartRef = ref<EchartsUIType>();
const { renderEcharts: renderDeptCompletionChart } = useEcharts(
  deptCompletionChartRef,
);

const deptUsageChartRef = ref<EchartsUIType>();
const { renderEcharts: renderDeptUsageChart } = useEcharts(deptUsageChartRef);

const monthlyTrendChartRef = ref<EchartsUIType>();
const { renderEcharts: renderMonthlyChart } = useEcharts(monthlyTrendChartRef);

// ========== 渲染图表 ==========

function renderDeptCharts() {
  let tableData = deptGridRef.value?.gridApi.getFullData();
  if (!tableData || tableData.length === 0) {
    tableData = [];
  }
  const deptNames = tableData.map((d: any) => d.deptName);
  const completedData = tableData.map((d: any) => d.cumulativeComplete || 0);

  // 图1: 中标药品完成分析（柱状图 + 折线图双轴）
  const completionOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: {
      data: ['累计完成量', '完成率'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '14%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: deptNames,
      axisLabel: { fontSize: 11, rotate: 30 },
    },
    yAxis: [
      {
        type: 'value',
        name: '完成量',
        axisLabel: {
          fontSize: 11,
          formatter: (v: number) =>
            v >= 10000
              ? `${(v / 10000).toFixed(0)}k`
              : v >= 1000
                ? `${(v / 1000).toFixed(0)}k`
                : `${v}`,
        },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      {
        type: 'value',
        name: '完成率',
        min: 0,
        max: 100,
        axisLabel: { fontSize: 11, formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '累计完成量',
        type: 'bar',
        yAxisIndex: 0,
        data: completedData,
        barWidth: '36%',
        itemStyle: { color: '#5B8FF9', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '完成率',
        type: 'line',
        yAxisIndex: 1,
        data: tableData.map((d: any) => d.completionRate ?? 0),
        smooth: false,
        symbol: 'diamond',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#5AD8A6' },
        itemStyle: { color: '#5AD8A6' },
      },
    ],
  };
  renderDeptCompletionChart(completionOption);

  // 图2: 中标药品使用分析
  const midSelectData = tableData.map((d: any) => d.midSelectUsageQty || 0);
  const nonMidData = tableData.map((d: any) => d.nonMidUsageQty || 0);

  const usageOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['中标用量', '非中标用量'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: deptNames,
      axisLabel: { fontSize: 11, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        formatter: (v: number) =>
          v >= 10000
            ? `${(v / 10000).toFixed(0)}k`
            : v >= 1000
              ? `${(v / 1000).toFixed(0)}k`
              : `${v}`,
      },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
    },
    series: [
      {
        name: '中标用量',
        type: 'bar',
        stack: 'total',
        data: midSelectData,
        barWidth: '30%',
        itemStyle: { color: '#5AD8A6' },
      },
      {
        name: '非中标用量',
        type: 'bar',
        stack: 'total',
        data: nonMidData,
        barWidth: '30%',
        itemStyle: { color: '#F66', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
  renderDeptUsageChart(usageOption);
}

function renderMonthlyTrendChart() {
  let tableData = monthlyGridRef.value?.gridApi.getFullData();
  if (!tableData || tableData.length === 0) {
    tableData = [];
  }
  const months = tableData.map((d: any) => {
    const m = d.month;
    return m ? `${m.slice(0, 4)}-${m.slice(4, 6)}` : '';
  });
  const taskData = tableData.map((d: any) => d.monthTaskQty || 0);
  const actualData = tableData.map((d: any) => d.monthActualUsage || 0);
  const cumActualData = tableData.map((d: any) => d.cumActualUsage || 0);

  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['月度任务量', '实际中标用量', '累计实际用量'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '8%',
      containLabel: true,
    },
    xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
    series: [
      {
        name: '月度任务量',
        type: 'bar',
        stack: 'total',
        data: taskData,
        barWidth: '30%',
        itemStyle: { color: '#5B8FF9' },
      },
      {
        name: '实际中标用量',
        type: 'bar',
        stack: 'total',
        data: actualData,
        itemStyle: { color: '#1D4ED8', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '累计实际用量',
        type: 'line',
        data: cumActualData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#16A34A', type: 'dashed' },
        itemStyle: { color: '#16A34A' },
      },
    ],
  };
  renderMonthlyChart(option);
}

// ========== Tab 2: 月度执行分析列配置 ==========

const monthlyColumns: VxeGridProps['columns'] = [
  { title: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
  { field: 'parentName', title: '院区', width: 100, align: 'center' },
  { field: 'deptName', title: '科室名称', minWidth: 100, align: 'center' },
  { field: 'deptCode', title: '科室编码', width: 90, align: 'center' },
  { field: 'productName', title: '通用名', minWidth: 120, align: 'center' },
  {
    field: 'month',
    title: '月份',
    width: 90,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue ? `${cellValue.slice(0, 4)}-${cellValue.slice(4, 6)}` : '--',
  },
  {
    field: 'monthTaskQty',
    title: '月度任务量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'monthActualUsage',
    title: '当月中标用量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'monthCompletionRate',
    title: '当月完成率',
    width: 100,
    align: 'center',
    slots: { default: 'monthlyCompletionRate' },
  },
  {
    field: 'monthTimeProgress',
    title: '当月时间进度',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) =>
      cellValue != null ? cellValue + '%' : '--',
  },
  {
    field: 'monthProgressDiff',
    title: '月度进度差异',
    width: 110,
    align: 'center',
    slots: { default: 'monthlyProgressDiff' },
  },
  {
    field: 'cumTaskQty',
    title: '累计任务量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'cumActualUsage',
    title: '累计实际用量',
    width: 110,
    align: 'center',
    formatter: ({ cellValue }: any) => cellValue?.toLocaleString() ?? '--',
  },
  {
    field: 'cumCompletionRate',
    title: '累计完成率',
    width: 100,
    align: 'center',
    slots: { default: 'cumulativeCompletionRate' },
  },
];

const monthlyGridOptions: VxeGridProps = {
  headerCellConfig: { height: 36 },
  cellConfig: { height: 40 },
  columnConfig: { resizable: false },
  rowConfig: { isCurrent: false },
  round: false,
  border: 'inner',
  stripe: false,
  pagerConfig: { enabled: false },
  proxyConfig: { autoLoad: false },
  // minHeight: 200,
  minHeight: 380,
};

// 月度查询数据函数
const queryMonthlyData = (params: any) => {
  return new Promise((resolve) => {
    monthlySearchFormApi?.getValues().then((formValues: any) => {
      getDeptMonthlyAnalysis({
        ...params,
        vbpBatchId: selectedBatchId.value,
        departmentId: formValues?.wardArea || undefined,
        keyword: formValues?.keyword || undefined,
      }).then((res: any) => {
        resolve({ records: res.rows || [] });
      });
    });
  });
};

// ========== 查询操作 ==========

// 包装 API 供 ChcTable 使用
const queryDeptData = (params: any) => {
  return new Promise((resolve) => {
    searchFormApi?.getValues().then((formValues: any) => {
      getDeptExecuteDetails({
        ...params,
        vbpBatchId: selectedBatchId.value,
        keyword: formValues?.keyword || undefined,
        wardArea: formValues?.wardArea || undefined,
      }).then((res: any) => {
        resolve({ records: res.rows || [] });
      });
    });
  });
};

// 切换批次时重新查询
watch(
  () => selectedBatchId.value,
  (val) => {
    console.log('selectedBatchId:', val);
    if (activeTab.value === 'department') {
      deptGridRef.value?.gridApi?.commitProxy('query').then(() => {
        renderDeptCharts();
      });
    } else if (activeTab.value === 'monthly') {
      //  nextTick();
      console.log('monthlyGridRef.value:', monthlyGridRef.value);
      monthlyGridRef.value?.gridApi?.commitProxy('query').then(() => {
        renderMonthlyTrendChart();
      });
    }
  },
);

// 切换 Tab 时重新渲染月度图表
watch(
  () => activeTab.value,
  (newTab) => {
    console.log('activeTab:', newTab);
    if (newTab === 'department') {
      deptGridRef.value?.gridApi?.commitProxy('query').then(() => {
        renderDeptCharts();
      });
    } else if (newTab === 'monthly') {
      if (monthlyGridRef.value) {
        monthlyGridRef.value?.gridApi?.commitProxy('query').then(() => {
          renderMonthlyTrendChart();
        });
      } else {
        nextTick(() => {
          monthlyGridRef.value?.gridApi?.commitProxy('query').then(() => {
            renderMonthlyTrendChart();
          });
        });
      }
    }
  },
);

onMounted(async () => {
  await fetchBatchList();
});
</script>

<template>
  <div class="flex h-full flex-col bg-[#f0f4fb]">
    <!-- ===== 顶部批次选择 + 统计信息 ===== -->
    <div class="shrink-0 border-b border-[#e5e7eb] bg-white px-6 pb-3 pt-4">
      <div class="mb-3 flex items-center gap-3">
        <span class="text-[13px] text-[#6B7280]">批次：</span>
        <button
          v-for="batch in batchList"
          :key="batch.vbpBatchId"
          class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-[600] transition-all"
          :class="
            selectedBatchId === batch.vbpBatchId
              ? 'bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#1D4ED8]/30'
              : 'bg-[#f9fafb] text-[#6B7280] hover:bg-[#f3f4f6]'
          "
          @click="selectedBatchId = batch.vbpBatchId"
        >
          <span
            class="rounded px-1.5 py-0.5 text-[10px]"
            :class="
              batch.batchType === 'N'
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-[#7C3AED] text-white'
            "
          >
            {{ batch.batchTypeName }}
          </span>
          {{ batch.batchName }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
        <div class="flex items-center gap-1.5 text-[#9CA3AF]">
          <!-- <AntdCalendarOutlined class="text-[#9CA3AF]" /> -->
          {{ selectedBatch?.beginDate }} ~ {{ selectedBatch?.endDate }}
        </div>
        <div class="text-[#6B7280]">
          年度总任务量
          <span class="ml-1 font-[700] text-[#1D4ED8]">
            {{ selectedBatch?.annualTotalTaskQty?.toLocaleString() }}
          </span>
          盒
        </div>
        <div class="text-[#6B7280]">
          累计完成
          <span class="ml-1 font-[700] text-[#1D4ED8]">
            {{ selectedBatch?.totalConsumeQty?.toLocaleString() }}
          </span>
        </div>
        <div class="text-[#6B7280]">
          完成率
          <span
            class="ml-1 font-[700]"
            :style="{
              color: getRateColor(selectedBatch?.overallCompletionRate || 0),
            }"
          >
            {{ selectedBatch?.overallCompletionRate }}%
          </span>
        </div>
        <div class="text-[#6B7280]">
          中标用量
          <span class="ml-1 font-[700] text-[#16A34A]">
            {{
              selectedBatch?.midSelectUsageRatio != null
                ? (
                    (selectedBatch.totalConsumeQty *
                      selectedBatch.midSelectUsageRatio) /
                    100
                  )?.toLocaleString(undefined, { maximumFractionDigits: 0 })
                : '--'
            }}
          </span>
        </div>
        <div class="text-[#6B7280]">
          非中标用量
          <span class="ml-1 font-[700] text-[#F66]">
            {{
              selectedBatch?.midSelectUsageRatio != null
                ? (
                    (selectedBatch.totalConsumeQty *
                      (100 - selectedBatch.midSelectUsageRatio)) /
                    100
                  )?.toLocaleString(undefined, { maximumFractionDigits: 0 })
                : '--'
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- ===== 分析类型 Tabs ===== -->
    <div class="bg-white pb-3">
      <Tabs v-model:activeKey="activeTab" class="detailTab">
        <Tabs.TabPane key="department">
          <template #tab>
            <div class="flex items-center gap-1.5">
              <AntdTeamOutlined class="text-[14px]" />
              <span>科室汇总分析</span>
            </div>
          </template>
          <!-- 科室汇总分析 -->
          <div>
            <!-- 表格 -->
            <ChcTable
              ref="deptGridRef"
              id="deptAnalysis"
              :gridColumns="deptColumns"
              :gridOptions="deptGridOptions"
              :queryTableDataApi="queryDeptData"
              :tableContainerStyles="{ height: 'auto' }"
              style="padding: 0 10px 0 10px"
            >
              <template #toolbar-left>
                <SearchForm class="w-full" />
              </template>
              <template #deptName="{ row }">
                <span class="font-[600] text-[#7C3AED]">{{
                  row.deptName
                }}</span>
              </template>
              <template #completionRate="{ row }">
                <span
                  v-if="row.completionRate != null"
                  class="font-[700]"
                  :style="{ color: getRateColor(row.completionRate) }"
                >
                  {{ row.completionRate }}%
                </span>
                <span v-else>--</span>
              </template>
              <template #progressDiff="{ row }">
                <span
                  v-if="row.progressDiff != null"
                  class="rounded px-1.5 py-0.5 font-[700]"
                  :style="{
                    color: getDiffColor(row.progressDiff),
                    backgroundColor:
                      row.progressDiff < 0 ? '#FEF2F2' : '#DCFCE7',
                  }"
                >
                  {{ row.progressDiff > 0 ? '+' : '' }}{{ row.progressDiff }}%
                </span>
                <span v-else>--</span>
              </template>
              <template #warningCount="{ row }">
                <span
                  v-if="row.warningCount > 0"
                  class="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FEE2E2] text-[11px] font-[700] text-[#EF4444]"
                >
                  {{ row.warningCount }}
                </span>
                <span v-else class="text-[#9CA3AF]">0</span>
              </template>
            </ChcTable>

            <!-- 两个图表（上下布局） -->
            <div class="flex shrink-0 flex-col gap-4 px-6 py-4">
              <div
                class="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
              >
                <div class="mb-2 flex items-center gap-2">
                  <div class="h-[16px] w-[3px] rounded-full bg-[#1D4ED8]"></div>
                  <span class="text-[14px] font-[700] text-[#374151]"
                    >中标药品完成分析</span
                  >
                </div>
                <EchartsUI ref="deptCompletionChartRef" height="280px" />
              </div>
              <div
                class="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
              >
                <div class="mb-2 flex items-center gap-2">
                  <div class="h-[16px] w-[3px] rounded-full bg-[#1D4ED8]"></div>
                  <span class="text-[14px] font-[700] text-[#374151]"
                    >中标药品使用分析</span
                  >
                </div>
                <EchartsUI ref="deptUsageChartRef" height="280px" />
              </div>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane key="monthly">
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
              <span>月度执行分析</span>
            </div>
          </template>
          <!-- 月度执行分析 -->
          <div class="flex h-full flex-col">
            <!-- 筛选区域 -->
            <div
              class="monthlySearchForm shrink-0 border-b border-[#e5e7eb] bg-white pb-2 pl-3"
            >
              <MonthlySearchForm class="w-full" />
            </div>

            <!-- 月度执行趋势图 -->
            <div class="shrink-0 border-b border-[#e5e7eb] bg-white px-6 py-4">
              <div class="mb-3 flex items-center gap-2">
                <div class="h-[16px] w-[3px] rounded-full bg-[#1D4ED8]"></div>
                <span class="text-[14px] font-[700] text-[#374151]"
                  >月度执行趋势（任务量 vs 实际中标用量）</span
                >
              </div>
              <EchartsUI ref="monthlyTrendChartRef" height="260px" />
            </div>

            <!-- 月度数据表格 -->
            <div class="flex-1 overflow-hidden px-6 pt-4">
              <ChcTable
                ref="monthlyGridRef"
                id="monthlyAnalysis"
                :gridColumns="monthlyColumns"
                :gridOptions="monthlyGridOptions"
                :queryTableDataApi="queryMonthlyData"
                :tableContainerStyles="{ height: 'auto' }"
                style="padding: 0"
              >
                <template #monthlyCompletionRate="{ row }">
                  <span
                    v-if="row.monthCompletionRate != null"
                    class="font-[700]"
                    :style="{ color: getRateColor(row.monthCompletionRate) }"
                  >
                    {{ row.monthCompletionRate }}%
                  </span>
                  <span v-else>--</span>
                </template>
                <template #monthlyProgressDiff="{ row }">
                  <span
                    v-if="row.monthProgressDiff != null"
                    class="rounded px-1.5 py-0.5 font-[700]"
                    :style="{
                      color: getDiffColor(row.monthProgressDiff),
                      backgroundColor:
                        row.monthProgressDiff < 0 ? '#FEF2F2' : '#DCFCE7',
                    }"
                  >
                    {{ row.monthProgressDiff > 0 ? '+' : ''
                    }}{{ row.monthProgressDiff }}%
                  </span>
                  <span v-else>--</span>
                </template>
                <template #cumulativeCompletionRate="{ row }">
                  <span
                    v-if="row.cumCompletionRate != null"
                    class="font-[700]"
                    :style="{ color: getRateColor(row.cumCompletionRate) }"
                  >
                    {{ row.cumCompletionRate }}%
                  </span>
                  <span v-else>--</span>
                </template>
              </ChcTable>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
/* :deep(.vxe-table--header) {
  background: #f9fafb;
}
:deep(.vxe-table--header .vxe-cell) {
  font-weight: 600;
  font-size: 12px;
}
:deep(.vxe-body--row) {
  height: 44px;
}
:deep(.vxe-body--row .vxe-cell) {
  font-size: 12px;
  white-space: nowrap;
}
:deep(.vxe-table) {
  font-size: 12px;
} */
::v-deep(.detailTab .ant-tabs-nav-wrap) {
  margin-left: 20px;
}
::v-deep(
  .monthlySearchForm
    .ant-select-single:not(.ant-select-customize-input)
    .ant-select-selector
) {
  height: 30px;
}
</style>
