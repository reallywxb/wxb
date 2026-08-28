import DashboardHeader from './components/bi-dashboard/DashboardHeader'
import AcceptanceRate from './components/bi-dashboard/AcceptanceRate'
import ProcurementStats from './components/bi-dashboard/ProcurementStats'
import MonthlyChart from './components/bi-dashboard/MonthlyChart'
import ConsumptionPieChart from './components/bi-dashboard/ConsumptionPieChart'
import DrugRanking from './components/bi-dashboard/DrugRanking'
import NearExpiryList from './components/bi-dashboard/NearExpiryList'

export default function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif",
        // ── 深色科技感底纹 ───────────────────────────────────────────
        // 层1：细点阵（28px）
        // 层2：粗网格横线（84px）
        // 层3：粗网格竖线（84px）
        // 层4：整体深蓝底色
        backgroundColor: '#010c22',
        backgroundImage: `
          radial-gradient(rgba(59,158,255,0.28) 1.5px, transparent 1.5px),
          radial-gradient(rgba(59,158,255,0.14) 1.2px, transparent 1.2px),
          linear-gradient(rgba(59,158,255,0.13) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,158,255,0.13) 1px, transparent 1px),
          linear-gradient(rgba(59,158,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,158,255,0.04) 1px, transparent 1px),
          repeating-linear-gradient(
            45deg,
            transparent, transparent 20px,
            rgba(59,158,255,0.07) 20px, rgba(59,158,255,0.07) 21px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent, transparent 20px,
            rgba(59,158,255,0.04) 20px, rgba(59,158,255,0.04) 21px
          ),
          radial-gradient(ellipse 85% 60% at 50% 0%, rgba(20,70,200,0.24) 0%, transparent 70%)
        `,
        backgroundSize: '20px 20px, 60px 60px, 60px 60px, 60px 60px, 20px 20px, 20px 20px, 100% 100%, 100% 100%, 100% 100%',
        backgroundPosition: '0 0, 10px 10px, 0 0, 0 0, 10px 0, 0 10px, 0 0, 0 0, 0 0',
      }}
    >
      {/* 顶部标题栏 */}
      <DashboardHeader />

      {/* 主体内容：三列 × 两行 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '22% 1fr 28%',
        gap: 6,
        padding: 6,
        overflow: 'hidden',
      }}>
        {/* ===== 左列 ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, overflow: 'hidden' }}>
          {/* 左上：当日验收合格率 */}
          <div style={{ flex: '0 0 44%', minHeight: 0, overflow: 'hidden' }}>
            <AcceptanceRate />
          </div>
          {/* 左下：全院药品消耗排行榜 */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <DrugRanking />
          </div>
        </div>

        {/* ===== 中列 ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, overflow: 'hidden' }}>
          {/* 中上：采购/库存/领用/消耗总览 */}
          <div style={{ flex: '0 0 38%', minHeight: 0, overflow: 'hidden' }}>
            <ProcurementStats />
          </div>
          {/* 中下：近12个月入库出库统计 */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <MonthlyChart />
          </div>
        </div>

        {/* ===== 右列 ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, overflow: 'hidden' }}>
          {/* 右上：当日消耗分类统计（从左下移至此处） */}
          <div style={{ flex: '0 0 42%', minHeight: 0, overflow: 'hidden' }}>
            <ConsumptionPieChart />
          </div>
          {/* 右下：中心库近效期药品列表 */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <NearExpiryList />
          </div>
        </div>
      </div>
    </div>
  )
}
