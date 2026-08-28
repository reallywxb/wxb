<template>
  <div
    class="min-h-full bg-[#f0f4fb] font-sans dark:bg-[hsl(var(--background))]"
  >
    <VbenLoading :spinning="pageLoading" />
    <div v-show="!showDetail" class="p-4">
      <!-- 顶部四个统计卡片 -->
      <Row :gutter="[16, 16]" class="mb-4">
        <!-- 进行中批次 -->
        <Col :span="6">
          <Card
            class="stat-card rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[hsl(var(--card))] dark:hover:shadow-lg"
          >
            <div class="flex items-center gap-4">
              <div
                class="stat-icon flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(79,70,229,0.1)] text-2xl text-[#4f46e5]"
              >
                <component :is="markRaw(AntdAppstoreOutlined)" />
              </div>
              <div class="flex-1">
                <div
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  进行中批次
                </div>
                <div class="flex items-baseline gap-1">
                  <span
                    class="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100"
                  >
                    {{ summaryData?.ongoingBatchCount ?? 0 }}
                  </span>
                  <span
                    class="text-sm font-medium text-gray-400 dark:text-gray-500"
                  >
                    个
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <!-- 参与科室 -->
        <Col :span="6">
          <Card
            class="stat-card rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[hsl(var(--card))] dark:hover:shadow-lg"
          >
            <div class="flex items-center gap-4">
              <div
                class="stat-icon flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(16,185,129,0.1)] text-2xl text-[#10b981]"
              >
                <component :is="markRaw(AntdTeamOutlined)" />
              </div>
              <div class="flex-1">
                <div
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  参与科室
                </div>
                <div class="flex items-baseline gap-1">
                  <span
                    class="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100"
                  >
                    {{ summaryData?.participatingDeptCount ?? 0 }}
                  </span>
                  <span
                    class="text-sm font-medium text-gray-400 dark:text-gray-500"
                  >
                    个
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <!-- 总预警品规 -->
        <Col :span="6">
          <Card
            class="stat-card rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[hsl(var(--card))] dark:hover:shadow-lg"
          >
            <div class="flex items-center gap-4">
              <div
                class="stat-icon flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(239,68,68,0.1)] text-2xl text-[#ef4444]"
              >
                <component :is="markRaw(AntdExclamationCircleOutlined)" />
              </div>
              <div class="flex-1">
                <div
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  总预警品规
                </div>
                <div class="flex items-baseline gap-1">
                  <span
                    class="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100"
                  >
                    {{ summaryData?.totalWarningSpecCount ?? 0 }}
                  </span>
                  <span
                    class="text-sm font-medium text-gray-400 dark:text-gray-500"
                  >
                    个
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <!-- 平均完成率 -->
        <Col :span="6">
          <Card
            class="stat-card rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[hsl(var(--card))] dark:hover:shadow-lg"
          >
            <div class="flex items-center gap-4">
              <div
                class="stat-icon flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(16,185,129,0.1)] text-2xl text-[#10b981]"
              >
                <component :is="markRaw(AntdLineChartOutlined)" />
              </div>
              <div class="flex-1">
                <div
                  class="text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  平均完成率
                </div>
                <div class="flex items-baseline gap-1">
                  <span
                    class="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100"
                  >
                    {{ summaryData?.avgCompletionRate?.toFixed(1) ?? '--' }}
                  </span>
                  <span
                    class="text-sm font-medium text-gray-400 dark:text-gray-500"
                  >
                    %
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <!-- 进行中批次概览标题 -->
      <h2 class="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
        进行中批次概览
      </h2>

      <!-- Swiper 滑动卡片区域 -->
      <div class="relative mb-8 select-none">
        <swiper
          :slides-per-view="3"
          :spaceBetween="16"
          class="batch-swiper"
          :modules="[Navigation]"
          navigation
        >
          <swiper-slide v-for="batch in batchList" :key="batch.vbpBatchId">
            <div
              @click="goToDetail(batch)"
              class="batch-card relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[hsl(var(--card))] dark:shadow-md"
            >
              <!-- 右上角箭头 -->
              <RightOutlined
                class="absolute right-4 top-4 text-gray-300 dark:text-gray-500"
              />

              <!-- 批次类型标签 + 状态标签 -->
              <div class="mb-2 flex flex-wrap gap-2">
                <span
                  class="rounded px-2 py-0.5 text-xs font-medium"
                  :class="
                    batch.batchType === 'N'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  "
                >
                  {{ batch.batchTypeName }}
                </span>
                <span
                  v-if="batch.hasWarning"
                  class="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500 dark:bg-red-900/30 dark:text-red-400"
                >
                  有预警
                </span>
                <span
                  v-if="batch.status === '执行中'"
                  class="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400"
                >
                  进行中
                </span>
              </div>

              <!-- 批次名称 -->
              <div class="mb-1">
                <span
                  class="text-xl font-bold text-gray-800 dark:text-gray-100"
                  >{{ batch.batchName }}</span
                >
              </div>
              <!-- 日期范围 -->
              <div class="mb-4 text-sm text-gray-400 dark:text-gray-500">
                {{ batch.beginDate }} ~ {{ batch.endDate }}
              </div>

              <!-- 任务量 / 品规 / 金额 - 共同背景 -->
              <div
                class="mb-4 rounded-lg bg-[#f6faff] px-4 py-3 dark:bg-gray-800/50"
              >
                <div class="grid grid-cols-3 gap-4 text-center">
                  <!-- 年度总任务量 -->
                  <div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      年度总任务量
                    </div>
                    <div
                      class="text-xl font-bold text-blue-700 dark:text-blue-400"
                    >
                      {{ batch.annualTotalTaskQty?.toLocaleString() }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      总品规
                    </div>
                    <div
                      class="text-lg font-bold text-gray-700 dark:text-gray-200"
                    >
                      {{ batch.totalSpecCount }}个
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      总金额
                    </div>
                    <div
                      class="text-lg font-bold text-gray-700 dark:text-gray-200"
                    >
                      {{ formatAmount(batch.totalAmount) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 总体完成率 & 进度条 -->
              <div class="mb-4">
                <div class="mb-2 flex items-center justify-between">
                  <div class="text-xs text-gray-400 dark:text-gray-500">
                    总体完成率
                  </div>
                  <div
                    class="text-3xl font-bold leading-none"
                    :style="{
                      color: getCompletionColor(batch.overallCompletionRate),
                    }"
                  >
                    {{ batch.overallCompletionRate }}%
                  </div>
                </div>
                <!-- 进度条 -->
                <div
                  class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700"
                >
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{
                      width: batch.overallCompletionRate + '%',
                      maxWidth: '100%',
                      backgroundColor: getCompletionColor(
                        batch.overallCompletionRate,
                      ),
                    }"
                  ></div>
                </div>
              </div>

              <!-- 本月完成情况 -->
              <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                本月完成情况：<span class="font-semibold text-red-500">{{
                  batch.monthCompletedSpecCount
                }}</span>
                /{{ batch.monthTotalSpecCount }} 品规
              </div>

              <!-- 中标使用比例 & 中标完成比例 - 彩色背景卡片 -->
              <div class="mb-4 grid grid-cols-2 gap-4 text-center">
                <div class="rounded-lg bg-purple-50 py-3 dark:bg-purple-900/30">
                  <div class="text-xs text-purple-400 dark:text-purple-300">
                    中标使用比例
                  </div>
                  <div
                    class="text-lg font-bold text-purple-600 dark:text-purple-400"
                  >
                    {{ batch.midSelectUsageRatio }}%
                  </div>
                </div>
                <div class="rounded-lg bg-blue-50 py-3 dark:bg-blue-900/30">
                  <div class="text-xs text-blue-400 dark:text-blue-300">
                    非中标使用比例
                  </div>
                  <div
                    class="text-lg font-bold text-blue-600 dark:text-blue-400"
                  >
                    {{
                      isEmpty(batch.midSelectUsageRatio)
                        ? '--'
                        : 100 - batch.midSelectUsageRatio + '%'
                    }}
                  </div>
                </div>
              </div>

              <!-- 右下角预警 -->
              <div class="flex items-center justify-between text-xs">
                <div
                  class="flex items-center gap-1 text-gray-500 dark:text-gray-400"
                >
                  <AntdCloseCircleOutlined class="text-red-500" />
                  <span>本月完成率为0</span>
                </div>
                <span
                  class="rounded-[4px] bg-red-100 px-2 py-0.5 font-bold text-red-500 dark:bg-red-900/50"
                >
                  {{ batch.monthZeroCompletionCount }}
                </span>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>

      <!-- 各批次关键指标对比图表区域 - 并排布局 -->
      <div
        class="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-[hsl(var(--card))]"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
            各批次关键指标对比
          </h2>
          <!-- 自定义图例 -->
          <div class="flex flex-wrap items-center gap-4 text-xs">
            <div
              v-for="item in legendConfig"
              :key="item.key"
              class="cursor-pointer select-none"
              @click="toggleLegend(item.key)"
            >
              <div class="flex items-center gap-1.5">
                <!-- block 类型图标 -->
                <template v-if="item.type === 'block'">
                  <span
                    class="inline-block h-3 w-3 rounded-sm"
                    :class="legendVisibility[item.key] ? '' : 'opacity-30'"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                </template>
                <!-- line 类型图标 -->
                <template v-else-if="item.type === 'line'">
                  <span
                    class="inline-block h-0.5 w-4"
                    :class="legendVisibility[item.key] ? '' : 'opacity-30'"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                </template>
                <!-- dashed 类型图标 -->
                <template v-else>
                  <span
                    class="inline-block h-0.5 w-4 border-t-2 border-dashed"
                    :class="legendVisibility[item.key] ? '' : 'opacity-30'"
                    :style="{ borderColor: item.color }"
                  ></span>
                </template>
                <span
                  class="text-gray-500 dark:text-gray-400"
                  :class="!legendVisibility[item.key] && 'opacity-50'"
                >
                  {{ item.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Row :gutter="[16, 16]" v-if="!isLargeBatch">
          <!-- 左侧图表 -->
          <Col :span="12">
            <EchartsUI ref="chartRef" height="400px" />
          </Col>
          <!-- 右侧表格 -->
          <Col :span="12">
            <Table
              :columns="tableColumns"
              :data-source="tableData"
              :pagination="false"
              rowClassName="h-[48px]"
              size="small"
              class="batch-table"
            >
              <template #headerCell="{ column }">
                <template v-if="column.key !== 'name'">
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-xs font-semibold">{{
                      batchList.find(
                        (b) => `batch${b.vbpBatchId}` === column.key,
                      )?.batchName
                    }}</span>
                    <span
                      class="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      :class="
                        batchList.find(
                          (b) => `batch${b.vbpBatchId}` === column.key,
                        )?.batchType === 'N'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      "
                    >
                      {{
                        batchList.find(
                          (b) => `batch${b.vbpBatchId}` === column.key,
                        )?.batchTypeName
                      }}
                    </span>
                  </div>
                </template>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key !== 'name'">
                  <span
                    :style="{
                      color: record[column.key!]?.color || '#666',
                      fontWeight: '700',
                    }"
                  >
                    {{ record[column.key!]?.value || '--' }}
                  </span>
                </template>
              </template>
            </Table>
          </Col>
        </Row>
        <!-- 上下布局 -->
        <div v-else class="space-y-4">
          <EchartsUI ref="chartRef" height="400px" />
          <Table
            :columns="tableColumns"
            :data-source="tableData"
            :pagination="false"
            rowClassName="h-[48px]"
            size="small"
            class="batch-table"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key !== 'name'">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-xs font-semibold">{{
                    batchList.find((b) => `batch${b.vbpBatchId}` === column.key)
                      ?.batchName
                  }}</span>
                  <span
                    class="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    :class="
                      batchList.find(
                        (b) => `batch${b.vbpBatchId}` === column.key,
                      )?.batchType === 'N'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                    "
                  >
                    {{
                      batchList.find(
                        (b) => `batch${b.vbpBatchId}` === column.key,
                      )?.batchTypeName
                    }}
                  </span>
                </div>
              </template>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key !== 'name'">
                <span
                  :style="{
                    color: record[column.key!]?.color || '#666',
                    fontWeight: '700',
                  }"
                >
                  {{ record[column.key!]?.value || '--' }}
                </span>
              </template>
            </template>
          </Table>
        </div>
      </div>
    </div>
    <div v-if="showDetail">
      <DetailPage
        :goBack="goBackFromDetail"
        :batchInfo="selectedBatchInfo"
      ></DetailPage>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, markRaw, onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import { Table, Row, Col, Card, message } from 'ant-design-vue';
import { VbenLoading } from '@vben-core/shadcn-ui';
import DetailPage from './detailPage.vue';
import {
  RightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import {
  AntdAppstoreOutlined,
  AntdTeamOutlined,
  AntdExclamationCircleOutlined,
  AntdLineChartOutlined,
  AntdCloseCircleOutlined,
} from '@vben/chc-icons';
import {
  EchartsUI,
  useEcharts,
  type EChartsOption,
} from '@vben/plugins/echarts';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getVBPAnalysis } from './api.js';
import { isEmpty } from '@vben/utils';

// ---------- 批次数据（直接使用接口字段）----------
const batchList = ref<any[]>([]);

// 汇总数据
const summaryData = ref<any>(null);

// 页面 loading 状态
const pageLoading = ref(true);

// 格式化金额
const formatAmount = (amount: number): string => {
  if (!amount) return '0元';
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万元`;
  }
  return `${amount}元`;
};

// 表格配置 - 动态根据 batchList 生成
const tableColumns = computed(() => {
  const columns: any[] = [
    {
      title: '指标',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      fixed: 'left',
    },
  ];
  batchList.value.forEach((batch) => {
    columns.push({
      key: `batch${batch.vbpBatchId}`,
      dataIndex: `batch${batch.vbpBatchId}`,
    });
  });
  return columns;
});

// 指标映射：接口字段 -> 表格行
const indicatorConfig = [
  { key: 'timeProgress', name: '时间进度', suffix: '%' },
  // { key: 'overallCompletionRate', name: '年度完成率', suffix: '%' },
  { key: 'progressDiff', name: '进度差异', suffix: '%' },
  { key: 'midSelectUsageRatio', name: '中标使用率', suffix: '%' },
  { key: 'midSelectCompletionRatio', name: '中标完成率', suffix: '%' },
  { key: 'warningSpecCount', name: '预警品规', suffix: '个' },
];

const tableData = computed(() => {
  return indicatorConfig.map((indicator) => {
    const row: Record<string, any> = {
      key: indicator.key,
      name: indicator.name,
    };
    batchList.value.forEach((batch) => {
      const value = batch[indicator.key];
      const displayValue = value != null ? `${value}${indicator.suffix}` : '--';

      // 颜色逻辑
      let color: string | undefined;
      if (indicator.key === 'overallCompletionRate') {
        // 年度完成率：30以下红，30-60黄，60以上绿
        const num = parseFloat(String(value || 0));
        color = num >= 60 ? '#10b981' : num >= 30 ? '#f59e0b' : '#ef4444';
      } else if (indicator.key === 'progressDiff') {
        // 进度差异：负的红，正的绿
        color = value >= 0 ? '#10b981' : '#ef4444';
      } else if (indicator.key === 'warningSpecCount') {
        // 预警品规：0为绿，大于0为红
        color = value > 0 ? '#ef4444' : '#10b981';
      }
      // timeProgress 时间进度无需特殊颜色

      row[`batch${batch.vbpBatchId}`] = { value: displayValue, color };
    });
    return row;
  });
});

// 完成率颜色计算
const getCompletionColor = (value: number | undefined) => {
  const num = parseFloat(String(value || 0));
  if (num > 60) return '#10b981'; // 绿色
  if (num >= 40) return '#f59e0b'; // 橙黄色
  return '#ef4444'; // 红色
};

// 判断是否超过6个批次，超过则上下布局
const isLargeBatch = computed(() => batchList.value.length > 6);

// ECharts
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const legendConfig = [
  { key: 'completed', label: '已完成量', color: '#5470c6', type: 'block' },
  { key: 'remaining', label: '剩余任务量', color: '#d0e1f9', type: 'block' },
  { key: 'completionRate', label: '完成率', color: '#91cc75', type: 'line' },
  { key: 'timeProgress', label: '时间进度', color: '#fac858', type: 'dashed' },
];

const legendVisibility = ref<Record<string, boolean>>({
  completed: true,
  remaining: true,
  completionRate: true,
  timeProgress: true,
});

function toggleLegend(name: string) {
  legendVisibility.value[name] = !legendVisibility.value[name];
  renderChart();
}

const renderChart = () => {
  const names = batchList.value.map((b) => b.batchName);
  const completedData = batchList.value.map((b) => {
    // const total = b.annualTotalTaskQty;
    // const rate = b.overallCompletionRate / 100;
    // return Math.round(total * rate);
    return b.totalConsumeQty;
  });
  const remainingData = batchList.value.map((b) => {
    // const total = b.annualTotalTaskQty;
    // const rate = b.overallCompletionRate / 100;
    // return Math.round(total * (1 - rate));
    return b.remainTaskQty;
  });
  const completionRateActual = batchList.value.map(
    (b) => b.overallCompletionRate,
  );
  const completionRateCapped = completionRateActual.map((v) =>
    Math.min(v, 100),
  );
  const timeProgress = batchList.value.map((b) => b.timeProgress);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let result = `<div style="font-size:12px;">${params[0].axisValue}</div>`;
        params.forEach((item: any) => {
          let value = item.value != null ? item.value : 0;
          const suffix =
            item.seriesName.includes('率') || item.seriesName.includes('进度')
              ? '%'
              : '';
          // 完成率显示实际值（可能超过100%）
          if (item.seriesName === '完成率') {
            value = completionRateActual[item.dataIndex];
          }
          result += `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <span>${item.marker} ${item.seriesName}</span>
            <span style="font-weight:700;text-align:right;">${value}${suffix}</span>
          </div>`;
        });
        return result;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { fontWeight: 'bold', fontSize: 13 },
      axisTick: {
        alignWithLabel: true,
        interval: 0,
      },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { formatter: '{value}' },
        min: 0,
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' },
      },
    ],
    series: [
      ...(legendVisibility.value['completed']
        ? [
            {
              name: '已完成量',
              type: 'bar' as const,
              yAxisIndex: 0,
              stack: 'total',
              data: completedData,
              barWidth: '30%',
              itemStyle: { color: '#5470c6' },
            },
          ]
        : []),
      ...(legendVisibility.value['remaining']
        ? [
            {
              name: '剩余任务量',
              type: 'bar' as const,
              yAxisIndex: 0,
              stack: 'total',
              data: remainingData,
              barWidth: '30%',
              itemStyle: { color: '#d0e1f9' },
            },
          ]
        : []),
      ...(legendVisibility.value['completionRate']
        ? [
            {
              name: '完成率',
              type: 'line' as const,
              yAxisIndex: 1,
              data: completionRateCapped,
              itemStyle: { color: '#91cc75' },
              lineStyle: { width: 3 },
              symbol: 'circle',
              symbolSize: 8,
              label: {
                show: true,
                position: 'top' as const,
                formatter: (params: any) => {
                  const actualValue = completionRateActual[params.dataIndex];
                  return `${actualValue}%`;
                },
                fontSize: 11,
                padding: [0, 0, 10, 0],
              },
            },
          ]
        : []),
      ...(legendVisibility.value['timeProgress']
        ? [
            {
              name: '时间进度',
              type: 'line' as const,
              yAxisIndex: 1,
              data: timeProgress,
              itemStyle: { color: '#fac858' },
              lineStyle: { width: 2, type: 'dashed' as const },
              symbol: 'square',
              symbolSize: 6,
              label: {
                show: true,
                position: 'top' as const,
                formatter: '{c}%',
                fontSize: 11,
                padding: [10, 0, 0, 0],
              },
            },
          ]
        : []),
    ],
  };

  renderEcharts(option);
};

// 获取页面数据
const getPageData = async () => {
  try {
    const res = await getVBPAnalysis();
    console.log('getVBPAnalysis:', res);

    if (res && res.success && res.data) {
      // 直接使用接口返回的 summary 数据
      summaryData.value = res.data.summary;
      // 直接使用接口返回的 batchOverviews 数据（不转换）
      batchList.value = res.data.batchOverviews;

      // 渲染图表
      renderChart();
    }
  } catch (error) {
    console.error('获取集采执行分析数据失败:', error);
  } finally {
    pageLoading.value = false;
  }
};

// 详情页相关功能
const showDetail = ref(false);
const selectedBatchInfo = ref<any>(null);

function goToDetail(item: any) {
  selectedBatchInfo.value = item;
  showDetail.value = true;
}

// 在 swiper 挂载后设置导航按钮的事件拦截
function setupNavIntercept() {
  setTimeout(() => {
    // 通过 DOM 获取 swiper 实例
    const swiperEl = document.querySelector('.batch-swiper');
    const swiper = (swiperEl as any)?.swiper;
    if (!swiper) return;

    const prevBtn = document.querySelector('.batch-swiper .swiper-button-prev');
    const nextBtn = document.querySelector('.batch-swiper .swiper-button-next');

    const prevHandler = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      if (swiper.isBeginning) {
        message.info('已经是第一个批次了');
      }
    };

    const nextHandler = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      if (swiper.isEnd) {
        message.info('没有更多进行中批次');
      }
    };

    prevBtn?.addEventListener('pointerdown', prevHandler);
    nextBtn?.addEventListener('pointerdown', nextHandler);
  }, 300);
}

function goBackFromDetail() {
  showDetail.value = false;
  selectedBatchInfo.value = null;
}

onMounted(async () => {
  await getPageData();
  // 数据加载完成后，等待 DOM 更新再设置拦截
  setTimeout(() => {
    setupNavIntercept();
  }, 300);
});
</script>

<style scoped>
/* 统计卡片 */
.stat-card {
  transition: all 0.2s;
}
.stat-card :deep(.ant-card-body) {
  padding: 16px 20px;
}
.stat-icon {
  flex-shrink: 0;
}

/* Swiper 容器 */
.batch-swiper {
  padding-bottom: 6px;
}
.batch-swiper :deep(.swiper-button-prev),
.batch-swiper :deep(.swiper-button-next) {
  color: #4f46e5 !important;
  background: rgba(255, 255, 255, 0.9);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.1),
    0 -2px 6px rgba(0, 0, 0, 0.1),
    2px 0 6px rgba(0, 0, 0, 0.1),
    -2px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 999 !important;
  pointer-events: auto !important;
  /* background-color: #ccc; */
}
/* 确保卡片在导航按钮下方 */
.batch-swiper :deep(.swiper-slide) {
  position: relative;
  z-index: 1;
}
/* .batch-swiper :deep(.swiper-button-prev.swiper-button-disabled),
.batch-swiper :deep(.swiper-button-next.swiper-button-disabled) {
  display: none;
} */
.batch-swiper :deep(.swiper-button-prev::after),
.batch-swiper :deep(.swiper-button-next::after) {
  font-size: 10px !important;
  font-weight: bold;
}
.batch-swiper :deep(.swiper-button-prev),
.batch-swiper :deep(.swiper-button-next) {
  width: 28px !important;
  height: 28px !important;
  padding: 6px;
}
/* .batch-swiper :deep(.swiper-button-prev::after svg),
.batch-swiper :deep(.swiper-button-next::after svg) {
  width: 8px !important;
  height: 14px !important;
} */
.dark .batch-swiper :deep(.swiper-button-prev),
.dark .batch-swiper :deep(.swiper-button-next) {
  background: rgba(30, 30, 30, 0.9);
  color: #818cf8 !important;
}
/* .dark .batch-swiper :deep(.swiper-button-prev svg),
.dark .batch-swiper :deep(.swiper-button-next svg) {
  width: 8px !important;
  height: 14px !important;
} */
.batch-swiper :deep(.swiper-pagination-bullet-active) {
  background: #4f46e5;
}

/* 批次卡片 */
.batch-card {
  min-height: 320px;
}

/* 表格样式微调 */
.batch-table :deep(.ant-table) {
  padding-top: 20px;
  font-size: 13px;
  background: transparent;
}
.batch-table :deep(.ant-table-thead > tr > th) {
  background: #f9fafb;
  font-weight: 600;
  font-size: 12px;
  padding: 16px 12px;
}
.dark .batch-table :deep(.ant-table-thead > tr > th) {
  background: rgba(255, 255, 255, 0.05);
  color: hsl(var(--muted-foreground));
}
.batch-table :deep(.ant-table-tbody > tr > td) {
  padding: 20px 12px;
}
.dark .batch-table :deep(.ant-table-tbody > tr > td) {
  color: hsl(var(--foreground));
  border-color: rgba(255, 255, 255, 0.1);
}
.batch-table :deep(.ant-table-cell) {
  text-align: center;
}
.dark .batch-table :deep(.ant-table) {
  color: hsl(var(--foreground));
}
</style>
