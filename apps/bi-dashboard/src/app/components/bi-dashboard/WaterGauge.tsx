import { useId } from 'react'

interface Props {
  percentage: number
  label?: string
  size?: number   // diameter of the circular container
}

/**
 * 3D 圆形充液仪表（球形水位仪）
 *
 * SVG 实现要点：
 *  - 圆形裁切区域（clipPath = circle）
 *  - 水位高度 = diameter × (percentage / 100)，从底部向上填充
 *  - 无缝 CSS 波浪动画（translateX，不依赖 JS 帧更新）
 *  - 球面玻璃高光（radialGradient + highlight arc）
 *  - 外层辉光环 / 内层阴影环 / 气泡
 */
export default function WaterGauge({ percentage, label, size = 110 }: Props) {
  const uid = useId().replace(/:/g, '')
  const cx  = size / 2
  const cy  = size / 2
  const r   = size / 2 - 5           // 圆内半径（留出边缘间距）

  const pct    = Math.min(Math.max(percentage, 0), 100)
  // 水面 Y：100% = cy - r（顶部），0% = cy + r（底部）
  const waterY = cy + r - 2 * r * (pct / 100)

  // ── CSS 无缝波浪动画参数 ─────────────────────────────────────
  const numCycles = 2               // 总宽度内的波峰数
  const period    = size / numCycles // 单个波形宽度（px）
  const amp       = 3               // 波峰振幅（px）
  const keyName   = `cwf-${uid}`

  // 波浪路径（2 倍宽度，CSS translateX 滑动实现无缝循环）
  const buildWave = () => {
    const totalW = size * 2
    let d = `M 0,${cy + r + 12}`
    for (let x = 0; x <= totalW + 3; x += 3) {
      const y = waterY + Math.sin((2 * Math.PI * x) / period) * amp
      d += ` L ${x},${y}`
    }
    d += ` L ${totalW},${cy + r + 12} Z`
    return d
  }

  // ── SVG 资源 ID ──────────────────────────────────────────────
  const clipId    = `cwg-c-${uid}`
  const waterGrad = `cwg-w-${uid}`
  const glassGrad = `cwg-g-${uid}`
  const glowFlt   = `cwg-f-${uid}`

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>

      {/* ── CSS 波浪动画 ── */}
      <style>{`
        @keyframes ${keyName} {
          from { transform: translateX(0px); }
          to   { transform: translateX(-${period}px); }
        }
        .cwg-wave-${uid} {
          animation: ${keyName} 2s linear infinite;
          will-change: transform;
        }
      `}</style>

      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          {/* 圆形裁切（水体限制在圆内） */}
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>

          {/* 水体渐变：浅蓝顶→深蓝底 */}
          <linearGradient id={waterGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00d4ff" stopOpacity={0.80} />
            <stop offset="38%"  stopColor="#1470e8" stopOpacity={0.88} />
            <stop offset="100%" stopColor="#00308a" stopOpacity={0.96} />
          </linearGradient>

          {/* 玻璃球面高光（左上光源） */}
          <radialGradient id={glassGrad} cx="30%" cy="25%" r="58%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="45%"  stopColor="rgba(100,190,255,0.06)" />
            <stop offset="100%" stopColor="rgba(0,10,60,0.25)" />
          </radialGradient>

          {/* 辉光模糊滤镜 */}
          <filter id={glowFlt} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ①  最外层辉光环 */}
        <circle cx={cx} cy={cy} r={r + 6}
          fill="none" stroke="rgba(59,158,255,0.1)" strokeWidth={5} />

        {/* ②  外缘高光边 */}
        <circle cx={cx} cy={cy} r={r + 2.5}
          fill="none" stroke="rgba(59,158,255,0.22)" strokeWidth={1} />

        {/* ③  容器本体（深色背景） */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(2,12,48,0.92)" />

        {/* ④  水体 + 波浪（裁切到圆形内） */}
        <g clipPath={`url(#${clipId})`}>
          {pct > 0 && (
            <>
              {/* 静止水体底层 */}
              <rect x={0} y={waterY + amp} width={size} height={size - waterY + amp}
                fill={`url(#${waterGrad})`} />

              {/* 动画波浪 */}
              <g className={`cwg-wave-${uid}`}>
                <path d={buildWave()} fill={`url(#${waterGrad})`} />
              </g>

              {/* 水面高光线 */}
              <rect x={0} y={waterY - 0.5} width={size} height={1.5}
                fill="rgba(200,245,255,0.32)" />

              {/* 水底焦散光纹 */}
              <ellipse cx={cx * 0.6}  cy={waterY + 9}  rx={size * 0.08} ry={2.2}
                fill="rgba(255,255,255,0.09)" />
              <ellipse cx={cx * 1.35} cy={waterY + 16} rx={size * 0.06} ry={1.6}
                fill="rgba(255,255,255,0.07)" />

              {/* 水面辉光（进一步增加立体感） */}
              <rect x={0} y={waterY - 3} width={size} height={5}
                fill="rgba(100,220,255,0.08)" />
            </>
          )}
        </g>

        {/* ⑤  玻璃球面叠层（高光渐变） */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${glassGrad})`} />

        {/* ⑥  玻璃高光弧（左上弧形高光，模拟球面反光） */}
        <path
          d={`M ${cx - r * 0.52} ${cy - r * 0.68}
              A ${r * 0.78} ${r * 0.78} 0 0 1 ${cx + r * 0.22} ${cy - r * 0.9}`}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={3.5}
          strokeLinecap="round"
        />

        {/* 小高光椭圆（顶部反光亮点） */}
        <ellipse cx={cx - r * 0.18} cy={cy - r * 0.57}
          rx={r * 0.14} ry={r * 0.065}
          fill="rgba(255,255,255,0.18)" />

        {/* ⑦  容器边框环 */}
        <circle cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(59,158,255,0.6)"
          strokeWidth={1.5}
        />

        {/* 内边框阴影（凹槽感） */}
        <circle cx={cx} cy={cy} r={r - 2.5}
          fill="none"
          stroke="rgba(0,15,70,0.4)"
          strokeWidth={2.5}
        />

        {/* ⑧  气泡 */}
        {pct > 8 && [
          { cx: cx - size * 0.15, cy: waterY - 7,  r: 2.3 },
          { cx: cx + size * 0.13, cy: waterY - 13, r: 1.6 },
          { cx: cx - size * 0.03, cy: waterY - 21, r: 1.0 },
        ].map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r}
            fill="rgba(180,235,255,0.52)"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth={0.5}
          />
        ))}
      </svg>

      {/* ⑨  中心文字（HTML 叠层，不受 SVG 影响） */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', gap: 2,
      }}>
        <div style={{
          fontSize: Math.floor(size * 0.19),
          fontWeight: 700,
          color: '#ffffff',
          textShadow: '0 1px 6px rgba(0,0,0,0.96), 0 0 18px rgba(0,120,255,0.55)',
          fontFamily: 'monospace',
          lineHeight: 1,
        }}>
          {pct}%
        </div>
        {label && (
          <div style={{
            fontSize: Math.floor(size * 0.09),
            color: 'rgba(200,238,255,0.88)',
            textShadow: '0 1px 4px rgba(0,0,0,0.92)',
            letterSpacing: '0.04em',
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
}
