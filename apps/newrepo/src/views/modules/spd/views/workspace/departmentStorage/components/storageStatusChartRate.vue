<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { nextTick, onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { deepMerge } from '#/utils/util';

import { queryDeptStock } from '../api';

const chartRef = ref<EchartsUIType>();
const chartRefBox = ref<HTMLElement>();
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
};

const dataStyle = {
  // label: { show: false },
  // labelLine: { show: false },
  color: '#5470c6',
  position: 'inside',
  label: {
    show: true, // 显示标签
    position: 'inside', // 标签位置在内部
    formatter: '{b}', // 格式化标签文本，\n用于换行
    color: '#000',
    fontSize: 14,
  },
  labelLine: {
    show: false, // 隐藏引导线
  },
};
const placeHolderStyle = {
  color: 'rgba(0,0,0,0)',
  position: 'inside',
  // label: { show: false },
  // labelLine: { show: false },
};
const axisLabelDistance = ref(100);

const calculateAxisLabelDistance = () => {
  if (!chartRefBox.value) {
    return 100; // 默认值
  }

  const container = chartRefBox.value;

  const minDimension = Math.min(container.clientWidth, container.clientHeight);

  // 仪表盘半径是 90%，所以直径是 180%
  // 我们希望标签在圆圈外侧，所以需要在 90% 基础上再向外偏移
  const gaugeRadius = (minDimension * 0.83) / 2; // 90% 半径对应的像素值
  // const labelDistance = gaugeRadius * 0.1; // 再向外偏移 10% 半径的距离

  // 返回负值表示向外偏移
  return gaugeRadius;
};

const getFlexibleDivisibleNumber = (
  maxNum: number,
  options?: {
    divisor?: number; // 除数，默认为11
    roundBaseMap?: Record<number, number>; // 位数到倍数的映射
  },
): number => {
  const divisor = options?.divisor || 11;
  // 默认映射：1位数->1, 2位数->10, 3位数->100, 4位数->1000, 5位数->10000
  const defaultRoundBaseMap = {
    1: 1,
    2: 10,
    3: 10,
    4: 100,
    5: 1000,
    6: 10_000,
  };
  const roundBaseMap: any = options?.roundBaseMap || defaultRoundBaseMap;

  // 先找到能被divisor整除的最大数
  let candidate = Math.floor(maxNum / divisor) * divisor;
  while (candidate > 0) {
    const digits = candidate.toString().length;

    // 根据位数确定需要是整几的倍数
    const base = roundBaseMap[digits] || 1;

    // 调整为相应倍数
    const adjusted = Math.floor(candidate / base) * base;

    // 检查调整后的数是否还能被divisor整除且不超过原始最大值
    if (adjusted % divisor === 0 && adjusted <= maxNum && adjusted > 0) {
      return adjusted;
    }

    // 如果不满足条件，尝试下一个较小的能被divisor整除的数
    candidate -= divisor;
  }

  return 11;
};
const init = async ({ warehouseId }: { warehouseId: number | string }) => {
  setTimeout(async () => {
    console.warn('init warehouseId', warehouseId);
    await nextTick();
    axisLabelDistance.value = calculateAxisLabelDistance();

    try {
      const res = await queryDeptStock({ warehouseId });
      let maxNum = Math.max(...res.data.map((item: any) => item.value), 0);
      maxNum = getFlexibleDivisibleNumber(maxNum);
      const pieMaxNum = (maxNum / 11) * 12;
      // const pieData: any = {};
      const pieNum = res.data.length;
      const pieRate = (90 - 20 - ((pieNum || 1) - 1) * 10) / pieNum;
      const pieDataArr: any = [];
      res.data.forEach((item: any, index: number) => {
        // switch (item.name) {
        //   case '低值耗材': {
        //     pieData.lowConsume = {
        //       value: item.value,
        //       itemStyle: {
        //         color: '#5470c6',
        //       },
        //     };

        //     break;
        //   }
        //   case '检验试剂': {
        //     pieData.test = {
        //       value: item.value,
        //       itemStyle: {
        //         color: '#5470c6',
        //       },
        //     };

        //     break;
        //   }
        //   case '高值耗材': {
        //     pieData.heightConsume = {
        //       value: item.value,
        //       itemStyle: {
        //         color: '#5470c6',
        //       },
        //     };

        //     break;
        //   }
        //   // No default
        // }
        const startRadius = 20 + index * pieRate + index * 10;

        pieDataArr.push({
          name: item.name,
          type: 'pie',
          startAngle: 60,
          clockwise: true,
          radius: [
            startRadius,
            Math.min(startRadius + 20, startRadius + pieRate),
          ],
          itemStyle: dataStyle,
          labelLine: dataStyle.labelLine,
          label: dataStyle.label,
          data: [
            {
              value: item.value || 0,
              name: item.name,
            },
            {
              value: pieMaxNum - (item.value || 0),
              name: '',
              itemStyle: placeHolderStyle,
              emphasis: {
                itemStyle: {
                  color: 'rgba(0,0,0,0)',
                },
              },
            },
          ],
        });
      });

      // const
      renderOwnChart({
        legend: false,
        series: [
          {
            type: 'gauge',
            startAngle: 240,
            endAngle: -90,
            clockwise: true,
            min: 0,
            max: maxNum,
            radius: '90%',
            splitNumber: 11, // 刻度分割段数
            axisLine: {
              lineStyle: {
                width: 1,
                // color: [[1, '#ddd']],
              },
            },
            axisTick: {
              show: false,
              // length: 5,
            },
            axisLabel: {
              show: true,
              distance: axisLabelDistance.value,
              fontSize: 10,
            },
            anchor: {
              show: true, // 设置为 true 显示中心锚点
              size: 20, // 锚点大小
              icon: 'circle', // 锚点形状（圆形）
              style: {
                fill: '#666', // 填充颜色
                stroke: '#333', // 边框颜色
                lineWidth: 1, // 边框宽度
              },
            },
            splitLine: {
              show: true,
              length: '100%',
              lineStyle: {
                width: 1,
                // color: [[1, '#ddd']],
              },
            },
            pointer: {
              show: false, // 隐藏指针
            },
            // anchor: {
            //   show: false, // 隐藏锚点
            // },
            detail: {
              show: false, // 隐藏详情
            },
            data: [{ value: 0 }], // 占位数据
          },
          {
            type: 'gauge',
            startAngle: -90,
            endAngle: 240,
            clockwise: true,
            min: 0,
            max: 220,
            radius: '90%',
            splitNumber: 1, // 刻度分割段数
            axisLine: {
              lineStyle: {
                width: 1,
                // color: [[1, '#ddd']],
              },
            },
            axisTick: {
              show: false,
              // length: 5,
            },
            axisLabel: {
              show: false,
            },
            anchor: {
              show: true, // 设置为 true 显示中心锚点
              size: 13, // 锚点大小
              icon: 'circle', // 锚点形状（圆形）
              style: {
                fill: '#666', // 填充颜色
                stroke: '#333', // 边框颜色
                lineWidth: 1, // 边框宽度
              },
            },
            splitLine: {
              show: true,
              length: '100%',
              lineStyle: {
                width: 1,
                // color: [[1, '#ddd']],
              },
            },
            pointer: {
              show: false, // 隐藏指针
            },
            // anchor: {
            //   show: false, // 隐藏锚点
            // },
            detail: {
              show: false, // 隐藏详情
            },
            data: [{ value: 0 }], // 占位数据
          },
          ...pieDataArr,
          // {
          //   name: '1',
          //   type: 'pie',
          //   startAngle: 60,
          //   clockwise: true,
          //   radius: ['78%', '90%'],
          //   itemStyle: dataStyle,
          //   labelLine: dataStyle.labelLine,
          //   label: dataStyle.label,
          //   data: [
          //     {
          //       value: pieData.test?.value || 0,
          //       name: '检验试剂',
          //     },
          //     {
          //       value: pieMaxNum - (pieData.test?.value || 0),
          //       name: '',
          //       itemStyle: placeHolderStyle,
          //       emphasis: {
          //         itemStyle: {
          //           color: 'rgba(0,0,0,0)',
          //         },
          //       },
          //     },
          //   ],
          // },
          // {
          //   name: '2',
          //   type: 'pie',
          //   clockwise: true,
          //   startAngle: 60,
          //   radius: ['48%', '58%'],
          //   itemStyle: dataStyle,
          //   labelLine: dataStyle.labelLine,
          //   label: dataStyle.label,
          //   data: [
          //     {
          //       value: pieData.lowConsume?.value,
          //       name: '低值耗材',
          //     },
          //     {
          //       value: pieMaxNum - (pieData.lowConsume?.value || 0),
          //       name: '',
          //       itemStyle: placeHolderStyle,
          //       emphasis: {
          //         itemStyle: {
          //           color: 'rgba(0,0,0,0)',
          //         },
          //       },
          //     },
          //   ],
          // },
          // {
          //   name: '3',
          //   type: 'pie',
          //   clockwise: true,
          //   startAngle: 60,
          //   radius: ['18%', '28%'],
          //   itemStyle: dataStyle,
          //   labelLine: dataStyle.labelLine,
          //   label: dataStyle.label,
          //   data: [
          //     {
          //       value: pieData.heightConsume?.value || 0,
          //       name: '高值耗材',
          //     },
          //     {
          //       value: pieMaxNum - (pieData.heightConsume?.value || 0),
          //       name: '',
          //       itemStyle: placeHolderStyle,
          //       emphasis: {
          //         itemStyle: {
          //           color: 'rgba(0,0,0,0)',
          //         },
          //       },
          //     },
          //   ],
          // },
        ],
      });
    } catch (error) {
      console.error('库存状态：', error);
    }
  }, 200);
};

onMounted(() => {
  // init({ warehouseId: 1 });
});
defineExpose({
  init,
});
</script>

<template>
  <div ref="chartRefBox" class="h-full w-full">
    <EchartsUI
      ref="chartRef"
      class="box-border"
      style="width: 100%; height: 100%"
    />
  </div>
</template>
