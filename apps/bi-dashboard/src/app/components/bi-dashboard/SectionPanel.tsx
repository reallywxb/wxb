import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  noPadding?: boolean
}

export default function SectionPanel({ title, children, noPadding }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      borderRadius: 4,
      boxSizing: 'border-box',
      position: 'relative',
      // 半透明背景：降低不透明度让全局网格暗纹透出；面板内叠加自己的细点阵
      background: `
        radial-gradient(rgba(59,158,255,0.08) 1px, transparent 1px),
        linear-gradient(
          45deg,
          transparent, transparent 22px,
          rgba(59,158,255,0.02) 22px, rgba(59,158,255,0.02) 23px
        ),
        linear-gradient(148deg, rgba(2,14,55,0.62) 0%, rgba(1,9,36,0.68) 100%)
      `,
      backgroundSize: '18px 18px, 100% 100%, 100% 100%',
      border: '1px solid rgba(59,158,255,0.18)',
      boxShadow: `
        0 0 28px rgba(20,90,220,0.12),
        0 0  2px rgba(59,158,255,0.08),
        inset 0 1px 0 rgba(59,158,255,0.10),
        inset 0 0 40px rgba(0,30,100,0.10)
      `,
    }}>

      {/* ── 四角 L 形装饰 ─────────────────────────────────────── */}

      {/* 顶左角 */}
      <span style={{
        position: 'absolute', top: -1, left: -1, width: 14, height: 14, zIndex: 10,
        borderTop: '2px solid rgba(59,158,255,0.85)',
        borderLeft: '2px solid rgba(59,158,255,0.85)',
        borderTopLeftRadius: 3,
      }} />
      <span style={{
        position: 'absolute', top: 4, left: 4, width: 3, height: 3, zIndex: 11,
        borderRadius: '50%', background: 'rgba(59,158,255,0.75)',
        boxShadow: '0 0 4px rgba(59,158,255,0.85)',
      }} />

      {/* 顶右角 */}
      <span style={{
        position: 'absolute', top: -1, right: -1, width: 14, height: 14, zIndex: 10,
        borderTop: '2px solid rgba(59,158,255,0.85)',
        borderRight: '2px solid rgba(59,158,255,0.85)',
        borderTopRightRadius: 3,
      }} />
      <span style={{
        position: 'absolute', top: 4, right: 4, width: 3, height: 3, zIndex: 11,
        borderRadius: '50%', background: 'rgba(59,158,255,0.5)',
      }} />

      {/* 底左角 */}
      <span style={{
        position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, zIndex: 10,
        borderBottom: '2px solid rgba(59,158,255,0.6)',
        borderLeft: '2px solid rgba(59,158,255,0.6)',
        borderBottomLeftRadius: 3,
      }} />

      {/* 底右角 */}
      <span style={{
        position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, zIndex: 10,
        borderBottom: '2px solid rgba(59,158,255,0.6)',
        borderRight: '2px solid rgba(59,158,255,0.6)',
        borderBottomRightRadius: 3,
      }} />

      {/* ── 顶/底扫光线 ──────────────────────────────────────── */}
      <span style={{
        position: 'absolute', top: 0, left: 14, right: 14, height: 1, zIndex: 10,
        background: 'linear-gradient(90deg, transparent, rgba(59,158,255,0.55) 30%, rgba(59,158,255,0.55) 70%, transparent)',
      }} />
      <span style={{
        position: 'absolute', bottom: 0, left: 14, right: 14, height: 1, zIndex: 10,
        background: 'linear-gradient(90deg, transparent, rgba(59,158,255,0.22) 30%, rgba(59,158,255,0.22) 70%, transparent)',
      }} />

      {/* ── 标题栏 ──────────────────────────────────────────── */}
      <div style={{
        padding: '6px 12px', flexShrink: 0,
        borderBottom: '1px solid rgba(59,158,255,0.13)',
        background: 'linear-gradient(90deg, rgba(20,80,200,0.18) 0%, rgba(10,40,120,0.08) 60%, transparent 100%)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          display: 'inline-block', width: 3, height: 13, borderRadius: 2,
          background: 'linear-gradient(180deg, #3b9eff 0%, #00bfff 100%)',
          boxShadow: '0 0 7px rgba(59,158,255,0.85)', flexShrink: 0,
        }} />
        <span className="text-[#3b9eff] tracking-wider" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
          {title}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center' }}>
          {[1, 0.5, 0.25].map((op, i) => (
            <span key={i} style={{
              width: 3, height: 3, borderRadius: '50%',
              background: `rgba(59,158,255,${op})`,
            }} />
          ))}
        </span>
      </div>

      {/* ── 内容区 ──────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflow: 'hidden',
        padding: noPadding ? 0 : 8,
        minHeight: 0, display: 'flex', flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  )
}
