<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, nextTick, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { isEmpty } from '@vben/utils';

import { Button as AntButton } from 'ant-design-vue';
import { isNumber } from 'lodash-es';

import { requestFormClient } from '#/api/request';

const props = defineProps<{
  currentPage: 'DETAIL' | 'MAIN';
  detailData: Record<string, any>;
}>();
const emits = defineEmits(['back']);

const PageType = {
  MAIN: 'MAIN',
  DETAIL: 'DETAIL',
} as const;

// 返回
const handleBack = () => {
  emits('back');
};

// 雷达图
const radarChartRef = ref<EchartsUIType>();
const { renderEcharts: renderRadarChart } = useEcharts(radarChartRef);

// 折线图
const lineChartRef = ref<EchartsUIType>();
const { renderEcharts: renderLineChart } = useEcharts(lineChartRef);

// 渲染雷达图
const renderRadarChartData = ({
  indicator,
  seriesData0,
  seriesData1,
  name,
}: {
  indicator: any[];
  name?: string;
  seriesData0: number[];
  seriesData1: number[];
}) => {
  renderRadarChart({
    grid: {
      top: '5%',
      left: '5%',
      right: '5%',
      bottom: '0%',
      containLabel: true,
    },
    tooltip: {},
    radar: {
      indicator,
      radius: 120,
      axisName: {
        color: '#fff',
        backgroundColor: '#666',
        borderRadius: 3,
        padding: [3, 5],
      },
    },
    series: {
      type: 'radar',

      data: [
        {
          value: seriesData0,
          name: 'Data C',
          symbol: 'rect',
          symbolSize: 12,
          lineStyle: {
            type: 'dashed',
          },
          tooltip: {
            show: false,
          },
        },
        {
          value: seriesData1,
          name,
          itemStyle: {
            color: 'rgb(255, 145, 124)',
          },
          lineStyle: {
            type: 'solid',
            color: 'rgb(255, 145, 124)',
          },

          label: {
            show: true,
            formatter(params) {
              if (params.value === null || params.value === undefined) {
                return '';
              }
              if (isNumber(params.value)) {
                return (params.value as number).toFixed(1);
              }
              return params.value as string;
            },
          },
          areaStyle: {
            // color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
            //   {
            //     color: 'rgba(255, 145, 124, 0.1)',
            //     offset: 0,
            //   },
            //   {
            //     color: 'rgba(255, 145, 124, 0.9)',
            //     offset: 1,
            //   },
            // ]),
            color: 'rgba(255, 145, 124, 0.4)',
          },
        },
      ],
    },
  });
};

// 渲染折线图
const renderLineChartData = ({
  xAxisData,
  seriesData,
}: {
  seriesData: number[];
  xAxisData: string[];
}) => {
  renderLineChart({
    grid: {
      top: '2%',
      left: '5%',
      right: '5%',
      bottom: '0%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    yAxis: {
      type: 'value',
    },
    series: {
      data: seriesData,
      type: 'line',
      symbol: 'emptyCircle',
      symbolSize: 4,
      smooth: true,
      lineStyle: {
        color: '#f3982c',
        width: 2,
      },
      itemStyle: {
        color: '#f3982c',
      },
    },
  });
};
const dimensions = computed(() => {
  return [
    {
      id: 1,
      name: '订单配送及时率',
      weight: props.detailData.orderOnTimeRateWeight,
      score: props.detailData.orderDeliverWeightScore,
      totalOrders: props.detailData.orderCount,
      onTimeOrders: props.detailData.orderOnTime,
      rate: props.detailData.orderOnTimeRate,
    },
    {
      id: 2,
      name: '验收合格率',
      weight: props.detailData.passRateWeight,
      score: props.detailData.passRateWeightScore,
      totalInspections: props.detailData.passBatch,
      passedInspections: props.detailData.passedBatch,
      rate: props.detailData.passRate,
    },
    {
      id: 3,
      name: '资质证照维护率',
      weight: props.detailData.licenseMaintenanceRateWeight,
      score: props.detailData.licenseWeightScore,
      totalCertificates: props.detailData.licenseRequired,
      validCertificates: props.detailData.licenseValid,
      rate: props.detailData.licenseMaintenanceRate,
    },
    {
      id: 4,
      name: '发票送达及时率',
      weight: props.detailData.invoiceRateWeight,
      score: props.detailData.invoiceWeightScore,
      totalInvoices: props.detailData.invoiceCount,
      onTimeInvoices: props.detailData.invoiceOnTime,
      rate: props.detailData.invoiceRate,
    },
    {
      id: 5,
      name: '院方评价',
      weight: props.detailData.hospRateWeight,
      score: props.detailData.hospRatingWeightScore,
      evaluator: props.detailData.hospRatingPerson,
      evaluateDate: props.detailData.hospRatingTime,
      evaluateScore: props.detailData.hospRatingScore,
    },
  ];
});
watch(
  () => props.currentPage,
  (newVal) => {
    if (newVal === PageType.DETAIL) {
      // 详情页
      init();
    }
  },
);
// 初始化
const init = async () => {
  await nextTick();
  // 渲染雷达图
  renderRadarChartData({
    indicator: [
      { name: '订单配送及时率', max: 100 },
      { name: '验收合格率', max: 100 },
      { name: '发票送达及时率', max: 100 },
      { name: '资质证照维护率', max: 100 },
      { name: '院方评价', max: 100 },
    ],
    seriesData0: [100, 100, 100, 100, 100],
    seriesData1: [
      props.detailData.orderDeliverScore,
      props.detailData.passRateScore,
      props.detailData.invoiceScore,
      props.detailData.licenseScore,
      props.detailData.hospRatingScore,
    ],
    name: props.detailData.vendorName,
  });
  // 渲染折线图
  const res = await requestFormClient.post(
    '/vendorRatingAction/queryRatingResultLine',
    {
      vendorName: props.detailData.vendorName,
      ratingPeriod: props.detailData.ratingPeriod,
    },
  );
  const arr = res.data || [];
  renderLineChartData({
    xAxisData: arr.map((item: any) =>
      convertQuarterToChinese(item.ratingPeriod),
    ),
    seriesData: arr.map((item: any) => item.compositeScore),
  });
};
// 转换YYYY-Q格式日期为汉字表示
const convertQuarterToChinese = (dateStr: string): string => {
  if (!dateStr) return '';

  const [year, quarter] = dateStr.split('-');
  if (!quarter) return `${year}年`;
  const quarterMap = {
    '1': '第一季度',
    '2': '第二季度',
    '3': '第三季度',
    '4': '第四季度',
  };

  return `${year}年${quarterMap[quarter as keyof typeof quarterMap] || ''}`;
};
</script>

<template>
  <div class="relative box-border flex h-full flex-col bg-white p-4">
    <!-- 返回按钮 -->
    <div class="mb-4 box-border flex w-full items-center justify-end">
      <AntButton type="primary" @click="handleBack">返回</AntButton>
    </div>
    <div
      class="box-border flex w-full flex-1 flex-row items-start justify-between gap-4"
    >
      <div class="box-border h-full flex-[3]">
        <div class="mb-4 box-border text-2xl font-bold">
          {{ detailData.vendorName }} -
          {{ convertQuarterToChinese(detailData.ratingPeriod) }}
        </div>
        <div
          class="mb-6 box-border flex items-center justify-around rounded-lg bg-blue-500 p-4"
        >
          <div class="text-2xl font-bold text-white">
            <span>综合得分：</span>
            <span class="text-[#e6b552]">
              {{ detailData.compositeScore }}
            </span>
            <span>&nbsp;分</span>
          </div>
          <div class="text-2xl font-bold text-white">
            <span>评级：</span>
            <span class="text-[#e6b552]">
              {{ detailData.ratingLevel }}
            </span>
          </div>
        </div>
        <div class="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
          <div
            v-for="(dimension, index) in dimensions"
            :key="dimension.id"
            class="rounded-lg bg-gray-50 bg-white shadow-lg"
          >
            <div class="mb-2 rounded-lg bg-[#e5e5e5] p-2 font-bold">
              <span class="text-base"> {{ (index as number) + 1 }} </span>.
              {{ dimension.name }} (
              {{ dimension.id === 5 ? '人工评价，' : '' }}
              权重{{ isEmpty(dimension.weight) ? '--' : dimension.weight }}%)
            </div>
            <div class="mb-2 px-4 text-2xl font-bold">
              {{ dimension.score }}分
            </div>
            <div class="px-4 pb-4">
              <div v-if="dimension.id === 1" class="text-sm">
                <div>
                  配送总单数:
                  {{
                    isEmpty(dimension.totalOrders)
                      ? '--'
                      : dimension.totalOrders
                  }}单
                </div>
                <div>
                  及时单数:
                  {{
                    isEmpty(dimension.onTimeOrders)
                      ? '--'
                      : dimension.onTimeOrders
                  }}单
                </div>
                <div>
                  及时率: {{ isEmpty(dimension.rate) ? '--' : dimension.rate }}%
                </div>
              </div>
              <div v-else-if="dimension.id === 2" class="text-sm">
                <div>
                  验收总批次:
                  {{
                    isEmpty(dimension.totalInspections)
                      ? '--'
                      : dimension.totalInspections
                  }}次
                </div>
                <div>
                  合格批次:
                  {{
                    isEmpty(dimension.passedInspections)
                      ? '--'
                      : dimension.passedInspections
                  }}次
                </div>
                <div>
                  验收合格率:
                  {{ isEmpty(dimension.rate) ? '--' : dimension.rate }}%
                </div>
              </div>
              <div v-else-if="dimension.id === 3" class="text-sm">
                <div>
                  应维证照数:
                  {{
                    isEmpty(dimension.totalCertificates)
                      ? '--'
                      : dimension.totalCertificates
                  }}项
                </div>
                <div>
                  有效证照数:
                  {{
                    isEmpty(dimension.validCertificates)
                      ? '--'
                      : dimension.validCertificates
                  }}项
                </div>
                <div>
                  维护率: {{ isEmpty(dimension.rate) ? '--' : dimension.rate }}%
                </div>
              </div>
              <div v-else-if="dimension.id === 4" class="text-sm">
                <div>
                  发票总单数:
                  {{
                    isEmpty(dimension.totalInvoices)
                      ? '--'
                      : dimension.totalInvoices
                  }}单
                </div>
                <div>
                  及时送达数:
                  {{
                    isEmpty(dimension.onTimeInvoices)
                      ? '--'
                      : dimension.onTimeInvoices
                  }}单
                </div>
                <div>
                  及时率: {{ isEmpty(dimension.rate) ? '--' : dimension.rate }}%
                </div>
              </div>
              <div v-else-if="dimension.id === 5" class="text-sm">
                <div>
                  评价人:
                  {{
                    isEmpty(dimension.evaluator) ? '--' : dimension.evaluator
                  }}
                </div>
                <div>
                  评价时间:
                  {{
                    isEmpty(dimension.evaluateDate)
                      ? '--'
                      : dimension.evaluateDate
                  }}
                </div>
                <div>
                  评价得分:
                  {{
                    isEmpty(dimension.evaluateScore)
                      ? '--'
                      : dimension.evaluateScore
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box-border flex h-full flex-[2] flex-col gap-4">
        <div class="box-border w-full flex-1 rounded-lg p-4 py-6">
          <EchartsUI ref="radarChartRef" class="box-border !h-full w-full" />
        </div>

        <div class="box-border w-full flex-1 rounded-lg p-4 py-6">
          <EchartsUI ref="lineChartRef" class="box-border !h-full w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
