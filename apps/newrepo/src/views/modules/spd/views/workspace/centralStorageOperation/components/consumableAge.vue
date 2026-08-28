<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { requestFormClient } from '#/api/request';
import { deepMerge } from '#/utils/util';

import ChartCardContainer from '../../centralStorageOperation/components/chartCardContainer.vue';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
const renderOwnChart = async (options: Record<string, any>) => {
  const defaultoptions = {
    legend: {
      top: '0%',
      left: 'center',
      show: false,
    },
    tooltip: {
      trigger: 'item',
    },
    grid: {
      // top: 500,
      left: '0%',
      right: '0%',
      bottom: '10%',
      containLabel: true,
    },
  };
  const allOptions = deepMerge(defaultoptions, options, {
    concatArrays: false,
  });

  const chartInstance = await renderEcharts(allOptions);
  console.warn('chartInstance', chartInstance);
};
const MOCK_DATA = [
  { name: '0-3个月', value: Math.floor(Math.random() * 1500) },
  { name: '3-6个月', value: Math.floor(Math.random() * 1500) },
  { name: '6个月以上', value: Math.floor(Math.random() * 1500) },
];

console.warn('耗材库龄分布图MOCK_DATA', MOCK_DATA);
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  try {
    const res: any = await requestFormClient.post(
      '/dashboardAction/queryConsumableAge.do',
      {
        warehouseId,
      },
    );
    // if (isEmpty(res?.data)) {
    //   return;
    // }
    renderOwnChart({
      series: [
        {
          animationDelay() {
            return Math.random() * 100;
          },
          animationEasing: 'exponentialInOut',
          animationType: 'scale',
          color: ['#5087ec', '#68bbc4', '#58a55c'],
          type: 'pie',
          avoidLabelOverlap: false,
          itemStyle: {
            // borderRadius: 10,
            // borderWidth: 2,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '\n\n{b}\n {c}元',
          },
          emphasis: {
            label: {
              fontSize: '12',
              fontWeight: 'bold',
              show: true,
            },
          },
          data: res.data || [],
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
};
const handleWarehouseStatusChange = (warehouseId: number | string) => {
  console.warn('handleChartWarehouseStatusChange', warehouseId);
  init({ warehouseId });
};
</script>

<template>
  <ChartCardContainer
    title="耗材库龄分布图"
    type="consumableAge"
    @warehouse-change="handleWarehouseStatusChange"
  >
    <EchartsUI ref="chartRef" class="my-chart box-border" />
  </ChartCardContainer>
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
