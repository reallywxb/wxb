<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { isEmpty } from '@vben/utils'
import { requestFormClient } from '#/api/request';
import { deepMerge } from '#/utils/util';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const renderOwnChart = async (options: Record<string, any>) => {
  const defaultoptions: any = {
    legend: {
      top: '0%',
      left: 'center',
      // '高值耗材', '低值耗材', '检验试剂'
      //   data: [
      //     {
      //       name: '高值耗材',
      //       itemStyle: {
      //         color: '#5087ec',
      //       },
      //     },
      //     {
      //       name: '低值耗材',
      //       itemStyle: {
      //         color: '#68bbc4',
      //       },
      //     },
      //     {
      //       name: '检验试剂',
      //       itemStyle: {
      //         color: '#58a55c',
      //       },
      //     },
      //   ],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      // top: '0%',
      left: '2%',
      right: '0%',
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
const MockData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月'],
  yAxis: {
    high: Array.from({ length: 5 })
      .fill(0)
      .map(() => Math.floor(Math.random() * 1000)),
    low: Array.from({ length: 5 })
      .fill(0)
      .map(() => Math.floor(Math.random() * 1000)),
    test: Array.from({ length: 5 })
      .fill(0)
      .map(() => Math.floor(Math.random() * 1000)),
  },
};
console.warn('purchaseTrendChart MockData', MockData);
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  try {
    const res: any = await requestFormClient.post(
      '/dashboardAction/queryPurchaseTrend.do',
      {
        warehouseId,
      },
    );
    // if (isEmpty(res?.data?.xAxis)) {
    //   return;
    // }
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

    const series: any = [];
    Object.keys(res.data.yAxis).forEach((key) => {
      series.push({
        ...baseItem,
        name: key,
        data: res.data.yAxis[key],
      });
    });
    renderOwnChart({
      legend: {
      top: '0%',
      left: 'center',
      show: !isEmpty(res.data.xAxis),
      },
      xAxis: {
        type: 'category',
        data: res.data.xAxis || [],
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
</script>

<template>
  <!-- <EchartsUI ref="chartRef" class="box-border" style="height: 250px" /> -->
  <EchartsUI ref="chartRef" class="my-chart box-border" />
</template>
<style lang="less" scoped>
// lg:1024
@media (min-width: 1024px) {
  .my-chart {
    height: 150px !important;
  }
}
// w2xl:1536
@media (min-width: 1440px) {
  .my-chart {
    height: 200px !important;
  }
}
@media (min-width: 1920px) {
  .my-chart {
    height: 300px !important;
  }
}
</style>
