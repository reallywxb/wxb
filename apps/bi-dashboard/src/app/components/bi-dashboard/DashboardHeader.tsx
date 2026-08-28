import { useState, useEffect } from 'react'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function DashboardHeader() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const dateStr = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日`
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  return (
    <header style={{
      height: 54,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(1,16,50,0.98) 0%, rgba(1,12,38,0.95) 100%)',
      borderBottom: '1px solid rgba(59,158,255,0.2)',
      boxShadow: '0 2px 24px rgba(30,100,220,0.18)',
    }}>
      {/* 左侧信息 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'inline-block', width: 4, height: 4, borderRadius: '50%',
              background: i === 0 ? '#3b9eff' : i === 1 ? '#00bfff' : 'rgba(59,158,255,0.3)',
              boxShadow: i < 2 ? '0 0 6px rgba(59,158,255,0.9)' : 'none',
            }} />
          ))}
        </div>
        <span className="text-[#88aadd]" style={{ fontSize: 11, letterSpacing: 2 }}>HOSPITAL · BI · SYSTEM</span>
      </div>

      {/* 中央标题 */}
      <h1
        className="text-white absolute left-1/2"
        style={{
          transform: 'translateX(-50%)',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 4,
          whiteSpace: 'nowrap',
          margin: 0,
          lineHeight: '54px',
          textShadow: '0 0 30px rgba(59,158,255,0.6), 0 0 8px rgba(59,158,255,0.3)',
        }}
      >
        江苏省人民医院宿迁医院
        <span className="text-[#3b9eff]" style={{ textShadow: '0 0 20px rgba(59,158,255,0.9)' }}> BI 驾驶舱</span>
      </h1>

      {/* 右侧日期时间 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="text-[#88aadd]" style={{ fontSize: 13 }}>{dateStr}</span>
        <span
          className="text-[#3b9eff] font-mono font-bold"
          style={{ fontSize: 16, textShadow: '0 0 10px rgba(59,158,255,0.7)', letterSpacing: 2 }}
        >
          {timeStr}
        </span>
      </div>
    </header>
  )
}
