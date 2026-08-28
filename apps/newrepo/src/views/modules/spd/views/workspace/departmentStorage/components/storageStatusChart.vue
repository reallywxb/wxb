<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { deepMerge } from '#/utils/util';

import { queryDeptStockStatus } from '../api';
import ChartDetailModalUi from './chartDetailModal.vue';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
const [ChartDetailModal, chartDetailModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: ChartDetailModalUi,
  draggable: true,
});
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
      // top: '0%',
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true,
    },
  };
  const allOptions = deepMerge(defaultoptions, options, {
    concatArrays: false,
  });

  const chartInstance = await renderEcharts(allOptions);
  console.warn('chartInstance', chartInstance);
  chartInstance?.on('click', (values) => {
    console.warn('饼图点击 values', values);
    // chartDetailModalApi
    //   ?.setData({
    //     modalTitle: `${values.name}耗材明细`,
    //   })
    //   .open();
  });
};
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  chartDetailModalApi?.close();
  try {
    const res = await queryDeptStockStatus({ warehouseId });

    renderOwnChart({
      series: [
        {
          animationDelay() {
            return Math.random() * 100;
          },
          animationEasing: 'exponentialInOut',
          animationType: 'scale',
          color: ['#5087ec', '#68bbc4', '#58a55c'],
          data: res.data,
          radius: ['40%', '60%'], // 添加这一行：[内半径, 外半径]
          emphasis: {
            label: {
              fontSize: '12',
              fontWeight: 'bold',
              show: true,
            },
          },
          itemStyle: {
            // borderRadius: 10,
            // borderWidth: 2,
          },
          // name: '中心库库存状态',
          // radius: ['40%', '65%'],
          type: 'pie',
        },
      ],
    });
  } catch (error) {
    console.error('库存状态：', error);
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
  <ChartDetailModal />
  <EchartsUI ref="chartRef" class="box-border" style="height: 100%" />
</template>
