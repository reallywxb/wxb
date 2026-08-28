import ReactECharts from 'echarts-for-react';
import SectionPanel from './SectionPanel';
import { useMonthlyChartData } from '../../../hooks/useDashboard';

export default function MonthlyChart() {
  const { data: data1, loading } = useMonthlyChartData();
  let data;
  if (data1 && data1.monthlyChartData) {
    data = data1.monthlyChartData;
  }
  console.log('useMonthlyChartData:', data);
  if (loading || !data) {
    return (
      <SectionPanel title="近12个月中心库入库与出库统计（万元）">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#88aadd',
            fontSize: 12,
          }}
        >
          加载中...
        </div>
      </SectionPanel>
    );
  }

  const months = data.map((d) => d.month);
  const inbound = data.map((d) => d.inbound);
  const outbound = data.map((d) => d.outbound);
  const stock = data.map((d) => d.stock);

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 28, bottom: 28, left: 36, right: 44, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(1,12,48,0.96)',
      borderColor: 'rgba(59,158,255,0.3)',
      textStyle: { color: '#fff', fontSize: 11 },
      formatter: (params: any[]) => {
        const label = params[0].axisValueLabel;
        const rows = params
          .map((p: any) => {
            const unit = p.seriesName === '库存金额' ? ' 万元' : ' 万元';
            return `<span style="color:${p.color}">●</span> ${p.seriesName}：<b>${p.value}</b>${unit}`;
          })
          .join('<br/>');
        return `<div style="color:#3b9eff;font-weight:600;margin-bottom:4px">${label}</div>${rows}`;
      },
    },
    legend: {
      top: 2,
      right: '10%',
      data: ['入库金额', '出库金额', '库存金额'],
      textStyle: { color: '#88aadd', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 7,
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: 'rgba(59,158,255,0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: '#88aadd', fontSize: 9, interval: 0, rotate: 0 },
    },
    yAxis: [
      {
        // 左轴：入库/出库（万元）
        type: 'value',
        name: '万元',
        nameTextStyle: { color: '#88aadd', fontSize: 9 },
        splitLine: {
          lineStyle: { color: 'rgba(59,100,220,0.12)', type: 'dashed' },
        },
        axisLabel: { color: '#88aadd', fontSize: 9 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      {
        // 右轴：库存（万元，量级更大）
        type: 'value',
        name: '库存/万',
        nameTextStyle: { color: 'rgba(255,215,0,0.6)', fontSize: 9 },
        position: 'right',
        splitLine: { show: false },
        axisLabel: {
          color: 'rgba(255,215,0,0.7)',
          fontSize: 9,
          formatter: (v: number) => `${(v / 1000).toFixed(1)}k`,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
    ],
    series: [
      {
        name: '入库金额',
        type: 'bar',
        yAxisIndex: 0,
        barMaxWidth: 14,
        data: inbound,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#4db8ff' },
              { offset: 1, color: '#0050cc' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
      {
        name: '出库金额',
        type: 'bar',
        yAxisIndex: 0,
        barMaxWidth: 14,
        data: outbound,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00e0a8' },
              { offset: 1, color: '#006655' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
      {
        name: '库存金额',
        type: 'line',
        yAxisIndex: 1,
        data: stock,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#ffd700', width: 2 },
        itemStyle: { color: '#ffd700', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,215,0,0.12)' },
              { offset: 1, color: 'rgba(255,215,0,0.01)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <SectionPanel title="近12个月中心库入库与出库统计（万元）">
      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </SectionPanel>
  );
}
