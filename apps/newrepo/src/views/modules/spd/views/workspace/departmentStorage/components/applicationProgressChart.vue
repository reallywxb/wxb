<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { deepMerge } from '#/utils/util';

import { queryReqProgress } from '../api';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const renderOwnChart = async (options: Record<string, any>) => {
  const defaultoptions: any = {
    legend: {
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      top: '0%',
      left: '0%',
      right: '10%',
      bottom: '0%',
      containLabel: true,
    },
    color: ['#5087ec', '#68bbc4', '#58a55c'],
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
    const res = await queryReqProgress({ warehouseId });
    const keys: string[] = [];
    const values: number[] = [];
    res.data.forEach((item: any) => {
      keys.push(item.name);
      values.push(item.value);
    });
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
        position: 'outside',
        color: '#5087ec',
      },
      itemStyle: {
        // borderRadius: 10,
        // borderWidth: 2,
      },
      type: 'bar',
      stack: 'total',
    };
    const highBar = {
      ...baseItem,
      // name: '高值耗材',
      data: values,
    };

    const series = [highBar];
    renderOwnChart({
      xAxis: {
        type: 'value',
        axisLabel: {
          margin: 10, // 调整标签边距
        },
      },
      yAxis: {
        type: 'category',
        data: keys,
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
  // init({ warehouseId: 1 });
});
</script>

<template>
  <EchartsUI ref="chartRef" class="box-border" style="height: 100%" />
</template>
