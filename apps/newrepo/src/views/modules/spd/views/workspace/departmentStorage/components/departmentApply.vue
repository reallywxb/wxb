<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

import { deepMerge } from '#/utils/util';

import { queryDeptReqAnalysis } from '../api';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const renderOwnChart = async (options: Record<string, any>) => {
  const defaultoptions: any = {
    legend: {
      top: '0%',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      // top: '0%',
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true,
    },
    color: ['#5087ec', '#68bbc4', '#58a55c', '#f2bd42'],
  };
  const allOptions = deepMerge(defaultoptions, options, {
    concatArrays: true,
  });
  console.warn('purchaseTrendChart allOptions', allOptions);
  renderEcharts(allOptions);
};
const init = async () => {
  try {
    const res = await queryDeptReqAnalysis();

    const baseItem = {
      animationDelay() {
        return Math.random() * 100;
      },
      animationEasing: 'exponentialInOut',
      animationType: 'scale',
      emphasis: {
        label: {
          fontSize: '12',
          fontWeight: 'bold',
          // show: true,
        },
      },
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
      },
      itemStyle: {
        // borderRadius: 10,
        // borderWidth: 2,
      },
      type: 'bar',
      stack: 'total',
    };
    const yAxis = res.data?.yAxis || {};
    const barArray = Object.keys(yAxis).map((key) => ({
      ...baseItem,
      name: key,
      data: yAxis[key],
    }));
    const series = barArray;
    renderOwnChart({
      xAxis: {
        type: 'category',
        data: res.data.xAxis,
      },
      yAxis: {
        type: 'value',
      },
      series,
    });
  } catch (error) {
    console.error('采购趋势', error);
  }
};
defineExpose({
  init,
});

onMounted(() => {
  init();
});
</script>

<template>
  <Card class="flex h-full flex-col">
    <CardHeader>
      <CardTitle class="text-foreground truncate text-xl">
        科室申领分析
      </CardTitle>
    </CardHeader>
    <CardContent class="box-border flex-1">
      <EchartsUI
        ref="chartRef"
        class="box-border h-full"
        style="height: 100%"
      />
    </CardContent>
  </Card>
</template>
