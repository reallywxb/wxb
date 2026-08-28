<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { isEmpty } from '@vben/utils';

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
    },
    tooltip: {
      trigger: 'item',
    },
    grid: {
      // top: 500,
      left: '0%',
      right: '0%',
      bottom: '10%',
    },
  };
  const allOptions = deepMerge(defaultoptions, options, {
    concatArrays: false,
  });

  const chartInstance = await renderEcharts(allOptions);
  console.warn('chartInstance', chartInstance);
};
const MOCK_DATA = [
  { name: '待指示', value: Math.floor(Math.random() * 200) },
  { name: '待拣货', value: Math.floor(Math.random() * 200) },
  { name: '待配送', value: Math.floor(Math.random() * 200) },
  { name: '待接受', value: Math.floor(Math.random() * 200) },
];
console.warn('今日出库情况MOCK_DATA', MOCK_DATA);
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  try {
    const res: any = await requestFormClient.post(
      '/dashboardAction/queryTodayOutbound.do',
      {
        warehouseId,
      },
    );
    if (isEmpty(res?.data)) {
      return;
    }
    renderOwnChart({
      series: [
        {
          animationDelay() {
            return Math.random() * 100;
          },
          animationEasing: 'exponentialInOut',
          animationType: 'scale',
          color: ['#5087ec', '#68bbc4', '#58a55c', '#f2bd42'],
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '\n\n{b}\n {c}',
          },
          emphasis: {
            label: {
              fontSize: '12',
              fontWeight: 'bold',
              show: true,
            },
          },
          labelLine: {
            show: true,
          },
          data: res.data,
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
    title="今日出库情况"
    type="todayOutboundSituation"
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
