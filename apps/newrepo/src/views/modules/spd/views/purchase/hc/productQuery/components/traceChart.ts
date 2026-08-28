import type { CirculationDataType } from '../index.vue';

/**
 * 生成并渲染追溯码流通轨迹图表
 * @param renderEcharts 渲染函数
 * @param circulationData 流通数据
 */
export const generateTraceChartOption = (
  renderEcharts: any,
  circulationData: CirculationDataType[],
): void => {
  if (!circulationData || circulationData.length === 0) {
    renderEcharts({});
    return;
  }
  // 获取所有节点并去重，保持出现顺序
  const allNodes = new Set<string>();
  const nodeOrder: string[] = [];

  if (circulationData[0]?.source) {
    allNodes.add(circulationData[0].source);
    nodeOrder.push(circulationData[0].source);
  }

  circulationData.slice(1).forEach((item) => {
    if (item.target) {
      allNodes.add(item.target);
      nodeOrder.push(item.target);
    }
  });
  // 生成X轴时间数据
  const xAxisData = circulationData.map((item) => item.time || '');

  // 生成Y轴节点名称数据
  const yAxisData = nodeOrder;
  // 生成系列数据 [x, y]
  const seriesData = circulationData.map((item, index) => {
    const yIndex = yAxisData.indexOf(
      (index === 0 ? item.source : item.target) || '',
    );
    // 找到当前项的source在yAxisData中的索引
    return [index, Math.max(yIndex, 0)];
  });
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (!params[0]) return '';
        const dataIndex = params[0].dataIndex;
        const item = circulationData?.[dataIndex];
        const yIndex = params[0].data[1];
        const currentNode = yAxisData[yIndex] || '';

        return `${item?.time || ''}<br/>${currentNode}`;
      },
    },
    grid: {
      left: '40px',
      right: '10%',
      bottom: '15%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        show: true,
        rotate: 45,
        fontSize: 10,
        interval: 0,
        margin: 15,
        color: '#333',
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ccc',
        },
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        show: true,
        fontSize: 12,
        margin: 10,
        color: '#333',
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ccc',
        },
      },
    },
    series: [
      {
        type: 'line',
        data: seriesData,
        smooth: false,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#1890ff',
          width: 3,
        },
        itemStyle: {
          color: '#fff',
          borderColor: '#1890ff',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#1890ff',
            borderWidth: 3,
            shadowColor: 'rgba(24, 144, 255, 0.5)',
            shadowBlur: 10,
          },
        },
      },
    ],
  };

  renderEcharts(option);
};
