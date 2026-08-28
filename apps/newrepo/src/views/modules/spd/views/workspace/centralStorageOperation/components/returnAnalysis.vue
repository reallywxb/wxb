<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { isEmpty } from '@vben/utils';

import { requestFormClient } from '#/api/request';
import { deepMerge } from '#/utils/util';

import ChartCardContainer from './chartCardContainer.vue';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
const renderOwnChart = async (options: Record<string, any>) => {
  const defaultoptions = {
    legend: {
      top: '0%',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
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
const MOCK_DATA = {
  xAxis: ['破损', '配送错误', '库存过多', '其他', '近效期'],
  yAxis: Array.from({ length: 5 })
    .fill(0)
    .map(() => Math.floor(Math.random() * 500)),
};
console.warn('中心库退货分析（本周）MOCK_DATA', MOCK_DATA);
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  try {
    const res: any = await requestFormClient.post(
      '/dashboardAction/queryCentralReturnAnalysis.do',
      {
        warehouseId,
      },
    );
    // if (isEmpty(res?.data?.xAxis)) {
    //   return;
    // }
    renderOwnChart({
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: res.data.xAxis || [],
        show: !isEmpty(res?.data?.xAxis), // 控制显示
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          animationDelay() {
            return Math.random() * 100;
          },
          animationEasing: 'exponentialInOut',
          animationType: 'scale',
          avoidLabelOverlap: false,
          type: 'line',
          label: {
            show: true,
            color: '#6a98ee',
          },
          lineStyle: {
            color: '#719eef',
          },
          areaStyle: {
            opacity: 0.1,
          },
          emphasis: {
            label: {
              fontSize: '12',
              fontWeight: 'bold',
              show: true,
            },
          },

          data: res.data.yAxis || [],
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
    title="中心库退货分析（本周）"
    type="returnAnalysis"
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
