<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

import { Input as AntInput } from 'ant-design-vue';
import { debounce } from 'lodash-es';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
// 统计概览数据
const stats = ref({
  total: '',
  excellent: '',
  good: '',
  needImprovement: '',
});

// 指标均值对比图表
const indexChartRef = ref<EchartsUIType>();
const { renderEcharts: renderIndexChart } = useEcharts(indexChartRef);

// TOP20对比图表
const top20ChartRef = ref<EchartsUIType>();
const { renderEcharts: renderTop20Chart } = useEcharts(top20ChartRef);

// 供应商等级分布图表
const levelChartRef = ref<EchartsUIType>();
const { renderEcharts: renderLevelChart } = useEcharts(levelChartRef);

// 供应商列表
const vendorName = ref('');
const [VendorGrid, vendorGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true, // 表格初始化时不自动查询数据
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'vendorRating',
    formSchema: [],
    queryUrl: '/vendorRatingAction/queryVendorList',
    gridColumns: [
      {
        field: 'vendorName',
        title: '供应商名称',
        width: 120,
        align: 'left',
      },
      { field: 'ratingLevel', title: '等级', width: 100, align: 'left' },
      {
        field: 'compositeScore',
        title: '综合得分',
        width: 120,
        align: 'center',
      },
      {
        field: 'orderDeliverScore',
        title: '订单配送及时率',
        width: 120,
        align: 'center',
      },
      {
        field: 'passRateScore',
        title: '验收合格率',
        width: 120,
        align: 'center',
      },
      {
        field: 'licenseScore',
        title: '资质证明维护率',
        width: 120,
        align: 'center',
      },
      {
        field: 'invoiceScore',
        title: '发票送达及时率',
        width: 120,
        align: 'center',
      },
      {
        field: 'hospRatingScore',
        title: '院方评价',
        width: 120,
        align: 'center',
      },
    ],
    beforeFetchFn: (params) => {
      return {
        ...params,
        vendorName: vendorName.value,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params?.data || [],
      };
    },
  },
);

// 渲染指标均值对比图表
const renderIndexChartData = ({
  xAxisData,
  seriesData,
}: {
  seriesData: number[];
  xAxisData: string[];
}) => {
  const option = {
    legend: {
      data: ['均值得分'],
    },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'shadow' as const,
      },
    },
    grid: {
      // top: '2%',
      left: '2%',
      right: '0%',
      bottom: '0%',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
    },
    yAxis: {
      type: 'value' as const,
      max: 100,
    },
    series: [
      {
        name: '均值得分',
        type: 'bar' as const,
        data: seriesData,
        itemStyle: {
          color: '#5087ec',
        },
        label: {
          show: true,
          position: 'top' as const,
        },
      },
    ],
  };
  renderIndexChart(option);
};

// 渲染TOP20对比图表
const renderTop20ChartData = ({
  yAxisData,
  seriesData,
}: {
  seriesData: number[];
  yAxisData: string[];
}) => {
  const option = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'shadow' as const,
      },
    },
    grid: {
      top: '2%',
      left: '2%',
      right: '2%',
      bottom: '0%',
      containLabel: true,
    },
    xAxis: {
      type: 'value' as const,
      max: 100,
    },
    yAxis: {
      type: 'category' as const,
      data: yAxisData,
    },
    series: [
      {
        type: 'bar' as const,
        data: seriesData,
        itemStyle: {
          color: '#ff9800',
        },
        label: {
          show: true,
          position: 'right' as const,
        },
      },
    ],
  };
  renderTop20Chart(option);
};

// 渲染供应商等级分布图表
const renderLevelChartData = ({
  seriesData,
}: {
  seriesData: {
    name: string;
    value: number;
  }[];
}) => {
  const option = {
    tooltip: {
      trigger: 'item' as const,
    },
    legend: {
      orient: 'vertical' as const,
      left: 'right' as const,
    },
    grid: {
      top: '2%',
      left: '2%',
      right: '2%',
      bottom: '0%',
      containLabel: true,
    },
    series: [
      {
        // name: '供应商等级分布',
        type: 'pie' as const,
        radius: ['40%', '70%'],
        color: ['#5087ec', '#68bbc4', '#58a55c', '#f39423'],
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          show: true,
          position: 'outside' as const,
          formatter: '\n\n{b}\n {c}',
        },
      },
    ],
  };
  renderLevelChart(option);
};
// 供应商查询 减少频繁查询次数
const handleVendorSearch = debounce(
  () => {
    console.warn('handleVendorSearch vendorName', vendorName.value);
    vendorGridApi?.reload({
      vendorName: vendorName.value,
    });
  },
  300,
  {
    trailing: true,
    leading: false,
  },
);

// 初始化图表
onMounted(() => {
  Promise.all([
    // 指标均值对比图表数据
    requestFormClient.post('/vendorRatingAction/queryOverAllAvg'),
    // TOP20对比图表数据
    requestFormClient.post('/vendorRatingAction/queryVendorTop'),
    // 供应商等级分布
    requestFormClient.post('/vendorRatingAction/queryVendorBar'),
    // 概览
    requestFormClient.post('/vendorRatingAction/queryVendorRateInfo'),
  ])
    .then((res) => {
      console.warn('res', res);
      const indexData = res[0].data[0] || {};
      renderIndexChartData({
        xAxisData: [
          '订单配送及时率',
          '验收合格率',
          '资质证照维护率',
          '发票送达及时率',
          '院方评价',
        ],
        seriesData: [
          indexData?.orderDeliverScore || 0,
          indexData?.passRateScore || 0,
          indexData?.licenseScore || 0,
          indexData?.invoiceScore || 0,
          indexData?.hospRatingScore || 0,
        ],
      });
      const top20Data = res[1].data[0] || {};
      renderTop20ChartData({
        yAxisData: ['综合得分', '末20', 'TOP20'],
        seriesData: [
          top20Data?.compositeScore || 0,
          top20Data?.bottom || 0,
          top20Data?.top || 0,
        ],
      });
      const levelData = res[2].data || [];
      renderLevelChartData({
        seriesData: levelData.map((item: any) => ({
          name: item.ratingLevel,
          value: item.count || 0,
        })),
      });
      const statsData = res[3].data[0] || {};
      stats.value = {
        total: statsData?.totalVendors || 0,
        excellent: statsData?.excellentRate || 0,
        good: statsData?.goodRate || 0,
        needImprovement: statsData?.improveRate || 0,
      };
    })
    .catch((error) => {
      console.warn('err', error);
    });
});
</script>

<template>
  <Page
    content-class="p-[0.5rem] box-border bg-white"
    auto-content-height
    header-class="px-3 py-2"
  >
    <div
      class="box-border flex h-full max-h-full w-full flex-col items-center justify-start gap-y-2"
    >
      <!-- 统计概览 -->
      <div class="box-border grid w-full grid-cols-4 gap-4">
        <div
          class="flex flex-col items-center justify-center rounded-md bg-[#eaf5fe] p-2"
        >
          <div class="text-2xl font-bold text-[#666]">总供应商数</div>
          <div class="text-2xl font-bold text-[#666]">
            {{ stats.total }}
          </div>
        </div>
        <div
          class="flex flex-col items-center justify-center rounded-md bg-[#ecfef0] p-2"
        >
          <div class="text-2xl font-bold text-[#666]">优秀占比</div>
          <div class="text-2xl font-bold text-[#666]">
            {{ stats.excellent }}%
          </div>
        </div>
        <div
          class="flex flex-col items-center justify-center rounded-md bg-[#ebf6fe] p-2"
        >
          <div class="text-2xl font-bold text-[#666]">良好占比</div>
          <div class="text-2xl font-bold text-[#666]">{{ stats.good }}%</div>
        </div>
        <div
          class="flex flex-col items-center justify-center rounded-md bg-[#f0f0ff] p-2"
        >
          <div class="text-2xl font-bold text-[#666]">待改进</div>
          <div class="text-2xl font-bold text-[#666]">
            {{ stats.needImprovement }}%
          </div>
        </div>
      </div>
      <div class="box-border grid w-full flex-1 grid-cols-2 gap-4">
        <Card
          class="box-border flex h-full flex-col items-center justify-start"
        >
          <CardHeader class="box-border w-full py-2">
            <CardTitle class="xl:text-md truncate text-left 2xl:text-lg">
              指标整体均值对比
            </CardTitle>
          </CardHeader>
          <CardContent class="box-border w-full flex-1 pb-2">
            <EchartsUI ref="indexChartRef" class="box-border h-full w-full" />
          </CardContent>
        </Card>
        <Card
          class="box-border flex h-full flex-col items-center justify-start"
        >
          <CardHeader class="box-border w-full py-2">
            <CardTitle class="xl:text-md truncate text-left 2xl:text-lg">
              TOP20/末20对比
            </CardTitle>
          </CardHeader>
          <CardContent class="box-border w-full flex-1 pb-2">
            <EchartsUI ref="top20ChartRef" class="box-border h-full w-full" />
          </CardContent>
        </Card>
      </div>
      <div class="box-border grid w-full flex-1 grid-cols-2 gap-4">
        <Card
          class="box-border flex h-full flex-col items-center justify-start"
        >
          <CardHeader class="box-border w-full py-2">
            <div class="box-border flex w-full items-center justify-between">
              <CardTitle class="xl:text-md truncate text-left 2xl:text-lg">
                供应商列表
              </CardTitle>
              <div class="items-center justify-start">
                <label
                  class="leading-1 truncate text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 max-md:hidden md:inline"
                >
                  供应商名称：
                </label>
                <AntInput
                  v-model:value="vendorName"
                  placeholder="请输入供应商名称"
                  class="max-md:hidden md:inline-flex md:w-[80px] lg:w-[100px] 2xl:w-[200px]"
                  allow-clear
                  @press-enter="handleVendorSearch"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent class="box-border w-full flex-1 pb-2">
            <VendorGrid />
          </CardContent>
        </Card>

        <Card
          class="box-border flex h-full flex-col items-center justify-start"
        >
          <CardHeader class="box-border w-full py-2">
            <CardTitle class="xl:text-md truncate text-left 2xl:text-lg">
              供应商等级分布
            </CardTitle>
          </CardHeader>
          <CardContent class="box-border w-full flex-1 pb-1">
            <EchartsUI
              ref="levelChartRef"
              class="box-border h-full max-h-full w-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  </Page>
</template>

<style lang="less" scoped></style>
