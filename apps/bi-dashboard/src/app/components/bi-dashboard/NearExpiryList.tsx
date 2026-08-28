import { useRef, useEffect, useState } from 'react';
import SectionPanel from './SectionPanel';
import { useNearExpiryData } from '../../../hooks/useDashboard';
import type { NearExpiryItem } from '../../../api/modules/nearExpiry';

const ROW_H = 28;

const COLS = [
  {
    key: 'name',
    label: '药品品种名',
    width: 'auto' as const,
    align: 'left' as const,
  },
  { key: 'warehouse', label: '仓库', width: 'auto', align: 'left' as const },
  { key: 'quantity', label: '数量', width: 44, align: 'right' as const },
  { key: 'expiryDate', label: '有效期', width: 'auto', align: 'left' as const },
  {
    key: 'daysLeft',
    label: '近效期天数',
    width: 50 as const,
    align: 'left' as const,
  },
];

function cellStyle(col: (typeof COLS)[number]) {
  if (col.width === 'auto') return { flex: 1, minWidth: 0 };
  return { width: col.width, flexShrink: 0 };
}

function urgency(days: number) {
  if (days <= 30)
    return {
      label: '紧急',
      color: '#ff6b6b',
      bg: 'rgba(255,80,80,0.14)',
      border: 'rgba(255,80,80,0.38)',
    };
  if (days <= 60)
    return {
      label: '警告',
      color: '#ffa040',
      bg: 'rgba(255,140,0,0.14)',
      border: 'rgba(255,140,0,0.38)',
    };
  if (days <= 90)
    return {
      label: '注意',
      color: '#ffd700',
      bg: 'rgba(255,215,0,0.10)',
      border: 'rgba(255,215,0,0.38)',
    };
  return { label: '正常', color: '#3ddc97', bg: 'rgba(61,220,151,0.10)', border: 'rgba(61,220,151,0.33)' };
}

function Row({ item, idx }: { item: NearExpiryItem; idx: number }) {
  const urg = urgency(item.daysLeft);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: ROW_H,
        padding: '0 5px',
        borderBottom: '1px solid rgba(59,100,200,0.08)',
        flexShrink: 0,
        background: idx % 2 === 0 ? 'transparent' : 'rgba(59,158,255,0.03)',
      }}
    >
      {COLS.map((col) => (
        <span key={col.key} style={{ ...cellStyle(col), textAlign: col.align }}>
          {col.key === 'name' && (
            <span
              style={{
                fontSize: 10,
                color: '#b8d0f0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
              title={item.name}
            >
              {item.name}
            </span>
          )}
          {col.key === 'warehouse' && (
            <span
              style={{
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 2,
                background: 'rgba(59,158,255,0.12)',
                border: '1px solid rgba(59,158,255,0.22)',
                color: '#88aadd',
                whiteSpace: 'nowrap',
              }}
            >
              {item.warehouse}
            </span>
          )}
          {col.key === 'quantity' && (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                color: '#c8deff',
                fontWeight: 600,
              }}
            >
              {item.quantity}
            </span>
          )}
          {col.key === 'expiryDate' && (
            <span
              style={{ fontSize: 10, color: '#88aadd', whiteSpace: 'nowrap' }}
            >
              {item.expiryDate}
            </span>
          )}
          {col.key === 'daysLeft' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: '1px 4px',
                borderRadius: 3,
                background: urg.bg,
                border: `1px solid ${urg.border}`,
                fontSize: 9,
              }}
            >
              <span style={{ color: urg.color, fontWeight: 700 }}>
                {item.daysLeft}天
              </span>
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function NearExpiryList() {
  const { data: data1, loading } = useNearExpiryData();
  let data;
  if (data1 && data1.nearExpiryData) {
    data = data1.nearExpiryData;
  }
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
      <SectionPanel title="全院近效期药品列表" noPadding>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#88aadd', fontSize: 12 }}>
          加载中...
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel title="全院近效期药品列表" noPadding>
      {/* 表头 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 5px',
          background: 'rgba(0,30,100,0.75)',
          borderBottom: '1px solid rgba(59,158,255,0.2)',
          flexShrink: 0,
        }}
      >
        {COLS.map((col) => (
          <span
            key={col.key}
            style={{
              ...cellStyle(col),
              fontSize: 10,
              color: '#3b9eff',
              fontWeight: 600,
              textAlign: col.align,
            }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* 滚动列表区域 */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 0,
        }}
        ref={scrollContainer}
        onMouseEnter={shouldDouble ? pause : () => {}}
        onMouseLeave={shouldDouble ? resume : () => {}}
      >
        <div ref={scrollRef} style={{ willChange: 'transform' }}>
          {(shouldDouble ? [...list, ...list] : list).map(
            (item: NearExpiryItem, idx: number) => (
              <Row key={idx} item={item} idx={idx % list.length} />
            ),
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
