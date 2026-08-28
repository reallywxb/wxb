import { useRef, useEffect, useState } from 'react';
import SectionPanel from './SectionPanel';
import { useDrugAnomalyData } from '../../../hooks/useDashboard';
import type { DrugAnomalyItem } from '../../../api/modules/drugAnomaly';

type AnomalyType = '暴增' | '暴减' | '偏高' | '偏低';

function typeStyle(type: AnomalyType) {
  switch (type) {
    case '暴增':
      return {
        bg: 'rgba(255,80,80,0.18)',
        border: 'rgba(255,80,80,0.5)',
        text: '#ff6b6b',
        icon: '▲▲',
      };
    case '暴减':
      return {
        bg: 'rgba(80,80,255,0.18)',
        border: 'rgba(100,100,255,0.5)',
        text: '#7b8fff',
        icon: '▼▼',
      };
    case '偏高':
      return {
        bg: 'rgba(255,160,0,0.16)',
        border: 'rgba(255,160,0,0.45)',
        text: '#ffa040',
        icon: '▲',
      };
    case '偏低':
      return {
        bg: 'rgba(0,200,170,0.14)',
        border: 'rgba(0,200,170,0.40)',
        text: '#00c8aa',
        icon: '▼',
      };
  }
}

const ROW_H = 32;

function Row({ item, idx }: { item: DrugAnomalyItem; idx: number }) {
  const ts = typeStyle(item.type);
  const isUp = item.change > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        height: ROW_H,
        padding: '0 2px',
        borderBottom: '1px solid rgba(59,100,220,0.08)',
        flexShrink: 0,
      }}
    >
      {/* 序号 */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 3,
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 700,
          background:
            idx < 3 ? 'rgba(59,158,255,0.25)' : 'rgba(30,80,180,0.22)',
          color: idx < 3 ? '#3b9eff' : '#88aadd',
          border:
            idx < 3
              ? '1px solid rgba(59,158,255,0.4)'
              : '1px solid rgba(59,100,200,0.2)',
        }}
      >
        {idx + 1}
      </span>

      {/* 药品名 + 消耗量 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: '#b8d0f0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
          title={item.name}
        >
          {item.name}
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#3b9eff',
            marginLeft: 6,
            flexShrink: 0,
          }}
        >
          {item.amount.toLocaleString('zh-CN')}
          <span style={{ fontSize: 8, color: '#88aadd', marginLeft: 1 }}>
            件/日
          </span>
        </span>
      </div>

      {/* 异动标签 */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        {/* <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: '1px 5px',
            borderRadius: 3,
            fontSize: 9,
            background: ts.bg,
            border: `1px solid ${ts.border}`,
            color: ts.text,
            fontWeight: 700,
          }}
        >
          {ts.icon} {item.type}
        </span> */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: isUp ? '#ff6b6b' : '#7b8fff',
          }}
        >
          {isUp ? '+' : ''}
          {item.change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function DrugRanking() {
  const { data: data1, loading } = useDrugAnomalyData();
  let data;
  if (data1 && data1.drugAnomalyData) {
    data = data1.drugAnomalyData;
  }
  console.log('DrugRanking:', data);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);
  const list = data ?? [];
  const totalH = list.length * ROW_H;
  const [shouldDouble, setShouldDouble] = useState(false);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container || list.length === 0) return;
    setShouldDouble(totalH > container.clientHeight);
  }, [totalH, list.length]);

  useEffect(() => {
    const el = scrollRef.current;
    const container = scrollContainer.current;
    if (!el || !container || list.length === 0) return;
    // 数据高度不够容器高度时不滚动
    if (!shouldDouble) return;
    let last = performance.now();
    const tick = (now: number) => {
      posRef.current += (now - last) * 0.03;
      last = now;
      if (posRef.current >= totalH) posRef.current -= totalH;
      el.style.transform = `translateY(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [totalH, list.length, shouldDouble]);

  const pause = () => cancelAnimationFrame(animRef.current);
  const resume = () => {
    const el = scrollRef.current;
    if (!el || list.length === 0) return;
    let last = performance.now();
    const tick = (now: number) => {
      posRef.current += (now - last) * 0.03;
      last = now;
      if (posRef.current >= totalH) posRef.current -= totalH;
      el.style.transform = `translateY(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  if (loading || !data) {
    return (
      <SectionPanel title="全院异动品种统计">
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

  return (
    <SectionPanel title="全院异动品种统计">
      <div
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        ref={scrollContainer}
        onMouseEnter={shouldDouble ? pause : () => {}}
        onMouseLeave={shouldDouble ? resume : () => {}}
      >
        <div ref={scrollRef} style={{ willChange: 'transform' }}>
          {(shouldDouble ? [...list, ...list] : list).map(
            (item: DrugAnomalyItem, idx: number) => (
              <Row key={idx} item={item} idx={idx % list.length} />
            ),
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
