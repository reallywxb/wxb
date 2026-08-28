import { useId } from 'react'

interface Props {
  percentage: number
  color: string
  size?: number
  centerValue?: string
  centerUnit?: string
}

/**
 * 270° 弧形仪表盘 —— 从左下角沿顺时针方向环绕到右下角
 * 支持中心值显示、渐变色、发光滤镜
 */
export default function ArcGauge({ percentage, color, size = 80, centerValue, centerUnit }: Props) {
  const uid = useId().replace(/:/g, '')
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const sw = Math.max(3, size * 0.092)

  const C = 2 * Math.PI * r
  const arcLen270 = (270 / 360) * C
  const pct = Math.min(Math.max(percentage, 0), 100)
  const filled = (pct / 100) * arcLen270

  const gradId = `ag-${uid}`
  const filtId = `af-${uid}`

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      overflow="visible"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#00e0ff" />
        </linearGradient>
        <filter id={filtId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 背景轨道 —— 270° */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(30,80,200,0.18)"
        strokeWidth={sw}
        strokeDasharray={`${arcLen270} ${C - arcLen270}`}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />

      {/* 进度弧 */}
      {filled > 1 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={sw}
          strokeDasharray={`${filled} ${C - filled}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          filter={`url(#${filtId})`}
        />
      )}

      {/* 中心显示文字 */}
      {centerValue && (
        <>
          <text
            x={cx} y={centerUnit ? cy - 2 : cy + 4}
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize={size * 0.2}
            fontFamily="'Courier New', monospace"
          >
            {centerValue}
          </text>
          {centerUnit && (
            <text x={cx} y={cy + size * 0.16} textAnchor="middle" fill="#88aadd" fontSize={size * 0.11}>
              {centerUnit}
            </text>
          )}
        </>
      )}

      {/* 弧度两端高亮点 */}
      {(() => {
        const toXY = (angleDeg: number) => ({
          x: cx + r * Math.sin((angleDeg * Math.PI) / 180),
          y: cy - r * Math.cos((angleDeg * Math.PI) / 180),
        })
        const startDot = toXY(135)
        return <circle cx={startDot.x} cy={startDot.y} r={sw / 2.5} fill="rgba(59,158,255,0.4)" />
      })()}
    </svg>
  )
}
