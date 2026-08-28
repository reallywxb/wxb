<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { deepMerge } from '#/utils/util';

import { queryDeptConsAnalysis } from '../api';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const renderOwnChart = async (options: Record<string, any>) => {
  const defaultoptions: any = {
    legend: {
      top: '0%',
      left: 'center',
      // '高值耗材', '低值耗材', '检验试剂'
      // data: [
      //   {
      //     name: '高值耗材',
      //     itemStyle: {
      //       color: '#5087ec',
      //     },
      //   },
      //   {
      //     name: '低值耗材',
      //     itemStyle: {
      //       color: '#68bbc4',
      //     },
      //   },
      //   {
      //     name: '检验试剂',
      //     itemStyle: {
      //       color: '#58a55c',
      //     },
      //   },
      // ],
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
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  try {
    const res = await queryDeptConsAnalysis({ warehouseId });

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
        position: 'top',
      },
      itemStyle: {
        // borderRadius: 10,
        // borderWidth: 2,
      },
      type: 'bar',
    };
    // const highBar = {
    //   ...baseItem,
    //   name: '高值耗材',
    //   data: res.data.yAxis.high,
    // };
    // const lowBar = {
    //   ...baseItem,
    //   name: '低值耗材',
    //   data: res.data.yAxis.low,
    // };
    // const testBar = {
    //   ...baseItem,
    //   name: '检验试剂',
    //   data: res.data.yAxis.test,
    // };
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

onMounted(() => {
  // init({ warehouseId: 1 });
});
defineExpose({
  init,
});
</script>

<template>
  <EchartsUI ref="chartRef" class="box-border" style="height: 100%" />
</template>
