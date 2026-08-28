import { useId } from 'react'

interface Props {
  percentage: number
  label?: string
  size?: number
  startColor?: string
  endColor?: string
}

/**
 * 3D 立体环形仪表盘
 * 通过多层 SVG stroke 叠加模拟圆环体（Torus）光影效果：
 *  - 外阴影环：制造纵深感
 *  - 底部轨道：深色基底
 *  - 内凹暗边：凹槽立体感
 *  - 光晕层：进度弧辉光
 *  - 主进度弧：渐变描边
 *  - 顶部高光弧：模拟光源打亮
 *  - 前沿亮点：弧尾端发光圆点
 */
export default function RingChart({
  percentage,
  label,
  size = 120,
  startColor = '#1e90ff',
  endColor = '#00e0ff',
}: Props) {
  const uid = useId().replace(/:/g, '')
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.36
  const sw = size * 0.115          // 主描边宽度

  const C      = 2 * Math.PI * r
  const pct    = Math.min(Math.max(percentage, 0), 100)
  const filled = (pct / 100) * C

  const gradId   = `rg-${uid}`
  const blurId   = `rb-${uid}`

  // 弧尾坐标（SVG 原坐标系，顺时针从 3 点方向出发）
  const endRad = (pct / 100) * 2 * Math.PI
  const dotX   = cx + r * Math.cos(endRad)
  const dotY   = cy + r * Math.sin(endRad)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* ── SVG 整体旋转 -90°，使进度从视觉顶部出发 ── */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
        overflow="visible"
      >
        <defs>
          {/* 渐变：沿圆周方向（对角线近似） */}
          <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
            x1="0" y1="0" x2={size} y2={size}>
            <stop offset="0%"   stopColor={startColor} />
            <stop offset="50%"  stopColor={endColor} />
            <stop offset="100%" stopColor={startColor} stopOpacity={0.8} />
          </linearGradient>
          {/* 辉光滤镜 */}
          <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ① 最外层阴影环 —— 圆环体背面纵深 */}
        <circle cx={cx} cy={cy} r={r + sw * 0.55}
          fill="none"
          stroke="rgba(0,5,30,0.65)"
          strokeWidth={sw * 0.6}
        />

        {/* ② 外缘细线 —— 高光轮廓 */}
        <circle cx={cx} cy={cy} r={r + sw * 0.55}
          fill="none"
          stroke="rgba(59,158,255,0.2)"
          strokeWidth={1}
        />

        {/* ③ 底部轨道 —— 深色基底 */}
        <circle cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(8,35,110,0.75)"
          strokeWidth={sw}
        />

        {/* ④ 内凹暗边 —— 模拟圆环内侧阴影 */}
        <circle cx={cx} cy={cy} r={r - sw * 0.4}
          fill="none"
          stroke="rgba(0,8,50,0.6)"
          strokeWidth={sw * 0.28}
        />

        {/* ⑤ 辉光底层 —— 进度弧的外发光 */}
        {filled > 1 && (
          <circle cx={cx} cy={cy} r={r}
            fill="none"
            stroke={startColor}
            strokeWidth={sw + 8}
            strokeDasharray={`${filled} ${C}`}
            strokeLinecap="round"
            opacity={0.18}
            filter={`url(#${blurId})`}
          />
        )}

        {/* ⑥ 主进度弧 —— 渐变描边 */}
        {filled > 1 && (
          <circle cx={cx} cy={cy} r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={sw}
            strokeDasharray={`${filled} ${C}`}
            strokeLinecap="round"
          />
        )}

        {/* ⑦ 顶部高光弧 —— 模拟光源从上方打亮圆环表面
              旋转 -45° 使高光居中在视觉顶部 (3点钟方向, -90°旋转后= 12点) */}
        <circle cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={sw * 0.3}
          strokeDasharray={`${C * 0.22} ${C * 0.78}`}
          strokeLinecap="round"
          transform={`rotate(-45 ${cx} ${cy})`}
        />

        {/* ⑧ 次高光 —— 稍暗，覆盖范围更大，增强过渡 */}
        <circle cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(180,220,255,0.07)"
          strokeWidth={sw * 0.5}
          strokeDasharray={`${C * 0.45} ${C * 0.55}`}
          strokeLinecap="round"
          transform={`rotate(-80 ${cx} ${cy})`}
        />

        {/* ⑨ 进度弧前沿亮点 */}
        {filled > C * 0.03 && (
          <circle cx={dotX} cy={dotY} r={sw * 0.42}
            fill={endColor}
            style={{ filter: `drop-shadow(0 0 ${sw * 0.3}px ${endColor})` }}
          />
        )}

        {/* ⑩ 内缘细线 —— 增加精致感 */}
        <circle cx={cx} cy={cy} r={r - sw * 0.55}
          fill="none"
          stroke="rgba(59,158,255,0.08)"
          strokeWidth={1}
        />
      </svg>

      {/* ── 中心文字（不受旋转影响） ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <span
          className="text-[#00bfff] font-bold"
          style={{
            fontSize: Math.floor(size * 0.17),
            lineHeight: 1,
            textShadow: `0 0 12px ${startColor}`,
          }}
        >
          {percentage}%
        </span>
        {label && (
          <span className="text-[#88aadd]" style={{ fontSize: Math.floor(size * 0.09), lineHeight: 1 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
