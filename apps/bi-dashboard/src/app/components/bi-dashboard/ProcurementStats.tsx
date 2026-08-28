import { useId } from 'react';
import SectionPanel from './SectionPanel';
import { useProcurementData } from '../../../hooks/useDashboard';
import type { ProcurementMetric } from '../../../api/modules/procurement';

// ─ 6 指标默认值（接口未返回时的占位）──
const DEFAULT_METRICS: ProcurementMetric[] = [
  {
    label: '待验收数量',
    value: '2,105',
    unit: '条',
    yoy: +8.3,
    color: '#ffd700',
    iconChar: '验',
  },
  {
    label: '采购入库金额',
    value: '286.4',
    unit: '万',
    yoy: +12.5,
    color: '#3b9eff',
    iconChar: '入',
  },
  {
    label: '出库金额',
    value: '241.8',
    unit: '万',
    yoy: -5.2,
    color: '#00ccff',
    iconChar: '出',
  },
  {
    label: '库存金额',
    value: '3,988',
    unit: '万',
    yoy: +3.8,
    color: '#4169e1',
    iconChar: '库',
  },
  {
    label: '库存周转天数',
    value: '62',
    unit: '天',
    yoy: -8.4,
    color: '#00ced1',
    iconChar: '转',
  },
  {
    label: '证照即将到期',
    value: '12',
    unit: '个',
    color: '#ff8c42',
    iconChar: '证',
  },
];

// ── 平台：2 层（上小下大）+ 中间发光环 ──────────────────────────
const SVG_W = 220,
  SVG_H = 185,
  CX = 110;

// Layer A = 底层大基座；Layer B = 上层平台
const LA = { y: 154, rx: 88, ry: 20, color: '#00d4ff', sw: 5.0, glowW: 13 };
const LB = { y: 99, rx: 52, ry: 13, color: '#3b9eff', sw: 4.0, glowW: 9 };

// 两层之间的发光环（y = 中点）
const GR = { y: 128, rx: 70, ry: 16, color: '#00e8ff' };

// 图标挂点：3 高度（上=LB / 中=GR / 下=LA）
const ICON_LEVELS = [
  { y: LB.y, rx: LB.rx, ry: LB.ry },
  { y: GR.y, rx: GR.rx, ry: GR.ry },
  { y: LA.y, rx: LA.rx, ry: LA.ry },
];
const COS_L = -0.966,
  SIN_L = 0.259;
const COS_R = 0.966,
  SIN_R = 0.259;

// 多柱体（6 柱，趋势向上，对应 6 指标）
const PW = 7,
  PGAP = 5;
const PHEIGHTS = [26, 32, 36, 30, 42, 38]; // 大体递增，制造向上趋势
const PTOTAL = 6 * PW + 5 * PGAP;
const PSTART = CX - PTOTAL / 2;

// ══════════════════════════════════════════════════════════════
function StackedRingPlatform({
  uid,
  metrics,
}: {
  uid: string;
  metrics: ProcurementMetric[];
}) {
  const colors = metrics.map((m) => m.color);
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        {/* 梯形侧面渐变 */}
        <linearGradient
          id={`wf-${uid}`}
          gradientUnits="userSpaceOnUse"
          x1="10"
          y1="0"
          x2={SVG_W - 10}
          y2="0"
        >
          <stop offset="0%" stopColor="rgba(40,100,220,0.72)" />
          <stop offset="28%" stopColor="rgba(22,65,175,0.56)" />
          <stop offset="68%" stopColor="rgba(9,30,120,0.54)" />
          <stop offset="100%" stopColor="rgba(1,8,62,0.80)" />
        </linearGradient>

        {/* 顶盖面渐变 */}
        <radialGradient id={`tf-${uid}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(0,220,255,0.30)" />
          <stop offset="100%" stopColor="rgba(0,80,200,0.10)" />
        </radialGradient>

        {/* 柱体渐变（按颜色） */}
        {colors.map((col, i) => (
          <linearGradient
            key={i}
            id={`pg-${uid}-${i}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor={col} stopOpacity={0.85} />
            <stop offset="55%" stopColor={col} stopOpacity={0.5} />
            <stop offset="100%" stopColor={col} stopOpacity={0.18} />
          </linearGradient>
        ))}

        {/* 辉光滤镜（中等） */}
        <filter id={`gf-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 辉光滤镜（大，用于发光环） */}
        <filter id={`gfB-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ══ 1. 背面弧（暗） ══ */}
      {[LA, LB].map((ring, i) => (
        <path
          key={`ba-${i}`}
          d={`M ${CX - ring.rx} ${ring.y} A ${ring.rx} ${ring.ry} 0 0 1 ${CX + ring.rx} ${ring.y}`}
          fill="none"
          stroke={ring.color}
          strokeWidth={ring.sw * 0.38}
          opacity={0.2}
        />
      ))}

      {/* ══ 2. 梯形侧壁 ══ */}
      <polygon
        points={`${CX - LB.rx},${LB.y} ${CX + LB.rx},${LB.y} ${CX + LA.rx},${LA.y} ${CX - LA.rx},${LA.y}`}
        fill={`url(#wf-${uid})`}
      />
      {/* 侧棱线 */}
      <line
        x1={CX - LB.rx}
        y1={LB.y}
        x2={CX - LA.rx}
        y2={LA.y}
        stroke="rgba(60,145,255,0.45)"
        strokeWidth={1.3}
      />
      <line
        x1={CX + LB.rx}
        y1={LB.y}
        x2={CX + LA.rx}
        y2={LA.y}
        stroke="rgba(0,12,65,0.68)"
        strokeWidth={1.3}
      />

      {/* ══ 3. 两层之间的发光环 ══ */}
      {/* 大光晕 */}
      <ellipse
        cx={CX}
        cy={GR.y}
        rx={GR.rx + 6}
        ry={GR.ry + 3}
        fill="none"
        stroke="rgba(0,232,255,0.15)"
        strokeWidth={14}
        filter={`url(#gfB-${uid})`}
      />
      {/* 主环 */}
      <ellipse
        cx={CX}
        cy={GR.y}
        rx={GR.rx}
        ry={GR.ry}
        fill="none"
        stroke={GR.color}
        strokeWidth={2.8}
        opacity={0.78}
        filter={`url(#gf-${uid})`}
      />
      {/* 内侧白亮线 */}
      <ellipse
        cx={CX}
        cy={GR.y}
        rx={GR.rx - 2}
        ry={GR.ry - 1}
        fill="none"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth={0.7}
        opacity={0.55}
      />
      {/* 外侧虚线装饰 */}
      <ellipse
        cx={CX}
        cy={GR.y}
        rx={GR.rx + 4}
        ry={GR.ry + 2}
        fill="none"
        stroke={GR.color}
        strokeWidth={0.6}
        strokeDasharray="5 8"
        opacity={0.35}
      />

      {/* ══ 4. 前面弧（发光） ══ */}
      {[LA, LB].map((ring, i) => (
        <g key={`fa-${i}`}>
          <path
            d={`M ${CX - ring.rx} ${ring.y} A ${ring.rx} ${ring.ry} 0 0 0 ${CX + ring.rx} ${ring.y}`}
            fill="none"
            stroke={ring.color}
            strokeWidth={ring.glowW}
            opacity={0.18}
            filter={`url(#gf-${uid})`}
          />
          <path
            d={`M ${CX - ring.rx} ${ring.y} A ${ring.rx} ${ring.ry} 0 0 0 ${CX + ring.rx} ${ring.y}`}
            fill="none"
            stroke={ring.color}
            strokeWidth={ring.sw}
            opacity={0.96}
            filter={`url(#gf-${uid})`}
          />
        </g>
      ))}

      {/* ══ 5. Layer B 顶盖椭圆 ══ */}
      <ellipse
        cx={CX}
        cy={LB.y}
        rx={LB.rx}
        ry={LB.ry}
        fill={`url(#tf-${uid})`}
        stroke={LB.color}
        strokeWidth={LB.sw}
        opacity={0.96}
        filter={`url(#gf-${uid})`}
      />

      {/* ══ 6. 多柱体（坐落于 LB 顶盖上） ══ */}
      {PHEIGHTS.map((h, i) => {
        const px = PSTART + i * (PW + PGAP);
        const topY = LB.y - h;
        const col = colors[i];
        return (
          <g key={`pillar-${i}`}>
            {/* 柱底光晕 */}
            <rect
              x={px - 1}
              y={LB.y - 3}
              width={PW + 2}
              height={5}
              fill={col}
              opacity={0.25}
              rx={1}
              style={{ filter: `blur(2px)` }}
            />
            {/* 柱体 */}
            <rect
              x={px}
              y={topY}
              width={PW}
              height={h}
              fill={`url(#pg-${uid}-${i})`}
              rx={1.5}
              style={{ filter: `drop-shadow(0 0 3px ${col}55)` }}
            />
            {/* 柱顶亮条 */}
            <rect
              x={px}
              y={topY}
              width={PW}
              height={2.2}
              fill={col}
              opacity={0.95}
              rx={1}
            />
            {/* 箭头（↑ 向上三角形） */}
            <polygon
              points={`${px + PW / 2},${topY - 9} ${px - 2.5},${topY - 2} ${px + PW + 2.5},${topY - 2}`}
              fill={col}
              opacity={0.92}
              style={{ filter: `drop-shadow(0 0 5px ${col})` }}
            />
            {/* 箭头茎（短竖线） */}
            <rect
              x={px + PW / 2 - 1}
              y={topY - 2}
              width={2}
              height={3}
              fill={col}
              opacity={0.7}
            />
          </g>
        );
      })}

      {/* ══ 7. 左右图标（3 高度 × 2 = 6 个） ══ */}
      {ICON_LEVELS.map((lv, i) => {
        const mL = metrics[i];
        const mR = metrics[i + 3];
        const lx = CX + COS_L * lv.rx;
        const ly = lv.y + SIN_L * lv.ry;
        const rx2 = CX + COS_R * lv.rx;
        const ry2 = lv.y + SIN_R * lv.ry;

        return (
          <g key={`icons-${i}`}>
            {/* ── 左图标 ── */}
            <circle
              cx={lx}
              cy={ly}
              r={14}
              fill="none"
              stroke={mL.color}
              strokeWidth={8}
              opacity={0.1}
              filter={`url(#gfB-${uid})`}
            />
            <circle
              cx={lx}
              cy={ly}
              r={11}
              fill="rgba(1,8,44,0.94)"
              stroke={mL.color}
              strokeWidth={1.7}
              style={{ filter: `drop-shadow(0 0 5px ${mL.color}65)` }}
            />
            <circle
              cx={lx}
              cy={ly}
              r={11}
              fill="none"
              stroke={mL.color}
              strokeWidth={0.6}
              strokeDasharray="3 5"
              opacity={0.38}
            />
            <text
              x={lx}
              y={ly + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={mL.color}
              fontSize={8.5}
              fontWeight={700}
              style={{
                fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
              }}
            >
              {mL.iconChar}
            </text>

            {/* ── 右图标 ── */}
            <circle
              cx={rx2}
              cy={ry2}
              r={14}
              fill="none"
              stroke={mR.color}
              strokeWidth={8}
              opacity={0.1}
              filter={`url(#gfB-${uid})`}
            />
            <circle
              cx={rx2}
              cy={ry2}
              r={11}
              fill="rgba(1,8,44,0.94)"
              stroke={mR.color}
              strokeWidth={1.7}
              style={{ filter: `drop-shadow(0 0 5px ${mR.color}65)` }}
            />
            <circle
              cx={rx2}
              cy={ry2}
              r={11}
              fill="none"
              stroke={mR.color}
              strokeWidth={0.6}
              strokeDasharray="3 5"
              opacity={0.38}
            />
            <text
              x={rx2}
              y={ry2 + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={mR.color}
              fontSize={8.5}
              fontWeight={700}
              style={{
                fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
              }}
            >
              {mR.iconChar}
            </text>
          </g>
        );
      })}

      {/* 中轴虚线 */}
      <line
        x1={CX}
        y1={LB.y - 46}
        x2={CX}
        y2={LA.y}
        stroke="rgba(59,158,255,0.12)"
        strokeWidth={1.5}
        strokeDasharray="4 8"
      />
    </svg>
  );
}
function toNumber(str: string) {
  if (!str) {
    return 0;
  }
  return Number(str.split(',').join(''));
}
// ── 指标卡片 ───────────────────────────────────────────────────
function MetricCard({
  metric,
  index,
}: {
  metric: ProcurementMetric;
  index: number;
}) {
  const up = metric.yoy !== undefined && metric.yoy > 0;
  return (
    <div
      style={{
        padding: '5px 8px',
        background: 'rgba(1,10,44,0.52)',
        border: `1px solid ${metric.color}26`,
        borderLeft: `2px solid ${metric.color}`,
        borderRadius: 3,
        flex: 1,
        minHeight: 0,
        boxShadow: `inset 0 0 14px rgba(0,20,80,0.15), 0 0 6px ${metric.color}10`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: '#88aadd',
          marginBottom: 2,
          letterSpacing: '0.02em',
        }}
      >
        {metric.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: metric.color,
            fontFamily: 'monospace',
            lineHeight: 1,
            textShadow: `0 0 8px ${metric.color}60`,
          }}
        >
          {metric.value}
        </span>
        <span style={{ fontSize: 9, color: '#88aadd' }}>{metric.unit}</span>
      </div>
      {metric.yoy !== undefined && index !== 0 && index !== 5 && (
        <div
          style={{
            fontSize: 9,
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: up ? '#00e096' : '#ff6b6b',
          }}
        >
          <span>{up ? '▲' : '▼'}</span>
          <span>{Math.abs(metric.yoy).toFixed(1)}%</span>
          <span style={{ color: '#5577aa', marginLeft: 2 }}>同比</span>
        </div>
      )}
      {metric.ratio !== undefined && index !== 0 && index !== 5 && (
        <div style={{ fontSize: 9, marginTop: 2, display: 'flex', gap: 2 }}>
          <span style={{ color: '#5577aa' }}>占比</span>
          <span style={{ color: metric.color, fontWeight: 600 }}>
            {metric.ratio.toFixed(1)}%
          </span>
        </div>
      )}
      {(index === 0 || index === 5) &&
        typeof metric.value === 'string' &&
        toNumber(metric.value) > 0 && (
          <div
            style={{
              fontSize: 9,
              marginTop: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '1px 5px',
              borderRadius: 3,
              background: 'rgba(255,140,0,0.18)',
              border: '1px solid rgba(255,140,0,0.45)',
              color: '#ff8c42',
            }}
          >
            ⚠ 需处理
          </div>
        )}
    </div>
  );
}

// ── 主组件 ─────────────────────────────────────────────────────
export default function ProcurementStats() {
  const { data: data1, loading } = useProcurementData();
  let data;
  if (data1 && data1.metrics) {
    data = data1.metrics;
  }
  console.log('useProcurementData:', data);
  const uid = useId().replace(/:/g, '');
  const metrics = data ?? DEFAULT_METRICS;

  if (loading || !data) {
    return (
      <SectionPanel title="采购库存统计总览">
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
    <SectionPanel title="采购库存统计总览">
      <div style={{ display: 'flex', height: '100%', gap: 4 }}>
        <div
          style={{
            width: '30%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            justifyContent: 'space-around',
          }}
        >
          {/* {metrics.slice(0, 3).map((m, i) => (
            <MetricCard key={i} metric={m} />
          ))} */}
          <MetricCard key={0} index={0} metric={metrics[0]} />
          <MetricCard key={1} index={1} metric={metrics[1]} />
          <MetricCard key={2} index={2} metric={metrics[2]} />
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StackedRingPlatform uid={uid} metrics={metrics} />
        </div>
        <div
          style={{
            width: '30%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            justifyContent: 'space-around',
          }}
        >
          <MetricCard key={3} index={3} metric={metrics[3]} />
          <MetricCard key={4} index={4} metric={metrics[4]} />
          <MetricCard key={5} index={5} metric={metrics[5]} />
          {/* {metrics.slice(3).map((m, i) => (
            <MetricCard key={i} metric={m} />
          ))} */}
        </div>
      </div>
    </SectionPanel>
  );
}
