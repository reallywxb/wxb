<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { requestFormClient } from '#/api/request';
import { deepMerge } from '#/utils/util';

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
const state = ref<{ warehouseId: number | string }>({
  warehouseId: '',
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
    },
  };
  const allOptions = deepMerge(defaultoptions, options, {
    concatArrays: false,
  });

  const chartInstance = await renderEcharts(allOptions);
  console.warn('chartInstance', chartInstance);
  chartInstance?.on('click', (values) => {
    console.warn('饼图点击 values', values);
    // if (values.name !== '高于补货点') {
    //   chartDetailModalApi
    //     ?.setData({
    //       modalTitle: `${values.name}耗材明细`,
    //     })
    //     .open();
    // }
    let type;
    if (values.name === '高于补货点') {
      type = 2;
    } else if (values.name === '低于补货点') {
      type = 1;
    } else {
      type = 0;
    }
    chartDetailModalApi
      ?.setData({
        modalTitle: `${values.name}耗材明细`,
        type,
        warehouseId: state.value.warehouseId,
      })
      .open();
  });
};
const MOCK_DATA = [
  { name: '高于补货点', value: 500 },
  { name: '低于补货点', value: 200 },
  { name: '库存为零', value: 50 },
].map((item) => {
  return {
    ...item,
    value: Math.floor(Math.random() * 1000),
  };
});
console.warn('MOCK_DATA', MOCK_DATA);
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  console.warn('init warehouseId', warehouseId);
  state.value.warehouseId = warehouseId;
  chartDetailModalApi?.close();
  try {
    const res: any = await requestFormClient.post(
      '/dashboardAction/queryStockStatus.do',
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
          data: res.data || [],
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
          labelLine: {
            show: true,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '\n\n{b}\n {c}',
          },
          type: 'pie',
        },
      ],
    });
  } catch (error) {
    console.error('库存状态：', error);
  }
};
defineExpose({
  init,
});
</script>

<template>
  <ChartDetailModal />
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
