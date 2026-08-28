import ReactECharts from 'echarts-for-react';
import SectionPanel from './SectionPanel';
import { usePharmacyTransferData } from '../../../hooks/useDashboard';

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: '6px 8px',
        background: 'rgba(1,10,44,0.50)',
        border: `1px solid ${color}28`,
        borderTop: `2px solid ${color}`,
        borderRadius: 4,
        boxShadow: `0 0 8px ${color}10, inset 0 0 10px rgba(0,20,80,0.12)`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: '#88aadd',
          marginBottom: 4,
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'monospace',
            color,
            textShadow: `0 0 8px ${color}66`,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 9, color: '#88aadd' }}>{unit}</span>
      </div>
    </div>
  );
}

export default function ConsumptionPieChart() {
  const { data: data1, loading } = usePharmacyTransferData();
  let data;
  if (data1 && data1.pharmacyTransferStats) {
    data = {
      stats: data1.pharmacyTransferStats,
      list: data1.pharmacyTransferData,
    };
  }
  console.log('usePharmacyTransferData:', data);
  if (loading || !data) {
    return (
      <SectionPanel title="药房调拨分布">
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

  const { stats, list } = data;
  const names = list.map((d) => d.name);
  const superior = list.map((d) => d.superior);
  const peer = list.map((d) => d.peer);

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 30, bottom: 20, left: 32, right: 8, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(1,12,48,0.95)',
      borderColor: 'rgba(59,158,255,0.3)',
      textStyle: { color: '#fff', fontSize: 11 },
      formatter: (params: any[]) => {
        const name = params[0].axisValueLabel;
        const rows = params
          .map(
            (p: any) =>
              `<span style="color:${p.color}">●</span> ${p.seriesName}：<b>${p.value}</b> 万元`,
          )
          .join('<br/>');
        return `<div style="color:#3b9eff;font-weight:600;margin-bottom:4px">${name}</div>${rows}`;
      },
    },
    legend: {
      top: 2,
      right: 0,
      data: ['上级下拨', '同级调拨'],
      textStyle: { color: '#88aadd', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 7,
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: 'rgba(59,158,255,0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: '#88aadd', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { color: 'rgba(59,100,220,0.12)', type: 'dashed' },
      },
      axisLabel: {
        color: '#88aadd',
        fontSize: 9,
        formatter: (v: number) => `${v}万`,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: '上级下拨',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 20,
        data: superior,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#4db8ff' },
              { offset: 1, color: '#1255cc' },
            ],
          },
          borderRadius: [0, 0, 3, 3],
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
      {
        name: '同级调拨',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 20,
        data: peer,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#38e8b0' },
              { offset: 1, color: '#009966' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
      },
    ],
  };

  return (
    <SectionPanel title="药房调拨分布">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 6,
        }}
      >
        {/* 顶部 3 个统计卡片 */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <StatCard
            label="调拨单据数"
            value={stats.totalOrders}
            unit="单"
            color="#3b9eff"
          />
          <StatCard
            label="上级下拨总金额"
            value={stats.superiorAmount.toFixed(1)}
            unit="万元"
            color="#00bfff"
          />
          <StatCard
            label="同级调拨总金额"
            value={stats.peerAmount.toFixed(1)}
            unit="万元"
            color="#00e0a8"
          />
        </div>

        {/* ECharts 堆叠柱状图 */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReactECharts
            option={option}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
    </SectionPanel>
  );
}
