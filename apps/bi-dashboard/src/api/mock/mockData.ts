// ── 药品分类（9类）──────────────────────────────────────────────
export const DRUG_CATEGORIES = [
  '西药',
  '成药',
  '疫苗',
  '中药',
  '中药颗粒',
  '放射药品',
  '化学试剂',
  '特医食品',
  '消杀物资',
];

// ── 全年预算执行总览 ──────────────────────────────────────────────
// 全年预算执行总览数据
export const acceptanceData = {
  // 药品预算
  drug: {
    totalDigits: ['2', '7', '7', '0'],
    totalUnit: '万元',
    doneDigits: ['1', '9', '7', '0'],
    doneUnit: '万元',
    rate: 96.65,
  },
  // 消杀物资预算
  disinfection: {
    totalDigits: ['2', '4', '0'],
    totalUnit: '万元',
    doneDigits: ['2', '4', '0'],
    doneUnit: '万元',
    rate: 100,
  },
  // 疫苗预算
  vaccine: {
    totalDigits: ['2', '2', '7', '.', '6'],
    totalUnit: '万元',
    doneDigits: ['2', '0', '0', '.', '0'],
    doneUnit: '万元',
    rate: 87.9,
  },
};

// 截至目前8个月每月预算执行情况（万元）
export const budgetMonthlyData = [
  { month: '1月', executed: 330, remaining: 20 },
  { month: '2月', executed: 320, remaining: 20 },
  { month: '3月', executed: 345, remaining: 15 },
  { month: '4月', executed: 305, remaining: 45 },
  { month: '5月', executed: 348, remaining: 12 },
  { month: '6月', executed: 342, remaining: 13 },
  { month: '7月', executed: 358, remaining: 7 },
  { month: '8月', executed: 245, remaining: 115 },
];

// ── 采购统计（含仪表盘百分比）────────────────────────────────────
export interface ProcurementMetric {
  label: string;
  value: string;
  unit: string;
  yoy?: number;
  ratio?: number;
  color: string;
  iconChar: string;
}
export const procurementMetrics: ProcurementMetric[] = [
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

// ── 近12个月中心库统计 ────────────────────────────────────────────
export const monthlyChartData = [
  { month: '24.12', inbound: 101.2, outbound: 76, stock: 3820 },
  { month: '25.1', inbound: 140.3, outbound: 98.5, stock: 3958 },
  { month: '25.2', inbound: 139.5, outbound: 110, stock: 3988 },
  { month: '25.3', inbound: 102.8, outbound: 88.3, stock: 4002 },
  { month: '25.4', inbound: 60.5, outbound: 75, stock: 3987 },
  { month: '25.5', inbound: 143.8, outbound: 92.5, stock: 4039 },
  { month: '25.6', inbound: 105.3, outbound: 86.8, stock: 4058 },
  { month: '25.7', inbound: 132.2, outbound: 78.4, stock: 4112 },
  { month: '25.8', inbound: 91.6, outbound: 105, stock: 4099 },
  { month: '25.9', inbound: 184, outbound: 95, stock: 4188 },
  { month: '25.10', inbound: 81.3, outbound: 90, stock: 4179 },
  { month: '25.11', inbound: 127, outbound: 88.5, stock: 4218 },
];

// ── 药房调拨分布数据 ──────────────────────────────────────────────
export const pharmacyTransferStats = {
  totalOrders: 238, // 调拨单据数
  superiorAmount: 86.4, // 上级下拨总金额（万元）
  peerAmount: 34.8, // 同级调拨总金额（万元）
};

export const pharmacyTransferData = [
  { name: '急诊药房', superior: 18.6, peer: 5.2 },
  { name: '住院药房', superior: 32.4, peer: 8.6 },
  { name: '中药房', superior: 12.8, peer: 7.4 },
  { name: '门诊药房', superior: 14.2, peer: 9.8 },
  { name: '儿科药房', superior: 5.6, peer: 2.4 },
  { name: '静配中心', superior: 2.8, peer: 1.4 },
];

// ── 全院异动品种统计 ──────────────────────────────────────────────
export const drugAnomalyData = [
  {
    name: '注射用阿莫西林克拉维酸钾',
    amount: 28_500,
    change: +85.2,
    type: '暴增' as const,
  },
  {
    name: '人血白蛋白注射液',
    amount: 3200,
    change: -72.4,
    type: '暴减' as const,
  },
  {
    name: '盐酸莫西沙星注射液',
    amount: 18_900,
    change: +45.8,
    type: '偏高' as const,
  },
  {
    name: '葡萄糖注射液(5%)',
    amount: 2100,
    change: -61.3,
    type: '暴减' as const,
  },
  {
    name: '奥美拉唑肠溶胶囊',
    amount: 14_300,
    change: +38.7,
    type: '偏高' as const,
  },
  { name: '地塞米松注射液', amount: 890, change: -48.2, type: '偏低' as const },
  {
    name: '布洛芬缓释胶囊',
    amount: 5620,
    change: +52.1,
    type: '暴增' as const,
  },
  { name: '维生素C注射液', amount: 1340, change: -35.6, type: '偏低' as const },
  {
    name: '头孢曲松钠注射液',
    amount: 11_200,
    change: +42.3,
    type: '偏高' as const,
  },
  { name: '复方甘草片', amount: 780, change: -29.8, type: '偏低' as const },

  {
    name: '葡萄糖注射液(5%)',
    amount: 2100,
    change: -61.3,
    type: '暴减' as const,
  },
  {
    name: '奥美拉唑肠溶胶囊',
    amount: 14_300,
    change: +38.7,
    type: '偏高' as const,
  },
  { name: '地塞米松注射液', amount: 890, change: -48.2, type: '偏低' as const },
  {
    name: '布洛芬缓释胶囊',
    amount: 5620,
    change: +52.1,
    type: '暴增' as const,
  },
  { name: '维生素C注射液', amount: 1340, change: -35.6, type: '偏低' as const },
  {
    name: '头孢曲松钠注射液',
    amount: 11_200,
    change: +42.3,
    type: '偏高' as const,
  },
  { name: '复方甘草片', amount: 780, change: -29.8, type: '偏低' as const },

  {
    name: '葡萄糖注射液(5%)',
    amount: 2100,
    change: -61.3,
    type: '暴减' as const,
  },
  {
    name: '奥美拉唑肠溶胶囊',
    amount: 14_300,
    change: +38.7,
    type: '偏高' as const,
  },
  { name: '地塞米松注射液', amount: 890, change: -48.2, type: '偏低' as const },
  {
    name: '布洛芬缓释胶囊',
    amount: 5620,
    change: +52.1,
    type: '暴增' as const,
  },
  { name: '维生素C注射液', amount: 1340, change: -35.6, type: '偏低' as const },
  {
    name: '头孢曲松钠注射液',
    amount: 11_200,
    change: +42.3,
    type: '偏高' as const,
  },
  { name: '复方甘草片', amount: 780, change: -29.8, type: '偏低' as const },
];

// ── 全院近效期药品 ────────────────────────────────────────────────
export const nearExpiryData = [
  {
    id: 1,
    name: '葡萄糖注射液(5%)',
    expiryDate: '2026-08-13',
    daysLeft: 9,
    warehouse: '中心库A区',
    quantity: 48,
  },
  {
    id: 2,
    name: '双氯芬酸钠肠溶片',
    expiryDate: '2026-08-18',
    daysLeft: 91,
    warehouse: '急诊药房',
    quantity: 120,
  },
  {
    id: 3,
    name: '地塞米松注射液',
    expiryDate: '2026-08-24',
    daysLeft: 20,
    warehouse: '住院药房',
    quantity: 36,
  },
  {
    id: 4,
    name: '维生素C片',
    expiryDate: '2026-08-29',
    daysLeft: 25,
    warehouse: '中心库B区',
    quantity: 200,
  },
  {
    id: 5,
    name: '阿莫西林胶囊',
    expiryDate: '2026-09-03',
    daysLeft: 30,
    warehouse: '门诊药房',
    quantity: 84,
  },
  {
    id: 6,
    name: '头孢克洛胶囊',
    expiryDate: '2026-09-08',
    daysLeft: 35,
    warehouse: '儿科药房',
    quantity: 60,
  },
  {
    id: 7,
    name: '苯磺酸氨氯地平片',
    expiryDate: '2026-09-13',
    daysLeft: 40,
    warehouse: '中心库A区',
    quantity: 156,
  },
  {
    id: 8,
    name: '布洛芬缓释胶囊',
    expiryDate: '2026-09-19',
    daysLeft: 46,
    warehouse: '中药房',
    quantity: 90,
  },
  {
    id: 9,
    name: '奥美拉唑肠溶胶囊',
    expiryDate: '2026-09-28',
    daysLeft: 55,
    warehouse: '静配中心',
    quantity: 72,
  },
  {
    id: 10,
    name: '复方甘草片',
    expiryDate: '2026-10-03',
    daysLeft: 60,
    warehouse: '住院药房',
    quantity: 180,
  },
  {
    id: 11,
    name: '盐酸二甲双胍片',
    expiryDate: '2026-10-20',
    daysLeft: 77,
    warehouse: '门诊药房',
    quantity: 240,
  },
  {
    id: 12,
    name: '氯化钠注射液(0.9%)',
    expiryDate: '2026-11-02',
    daysLeft: 90,
    warehouse: '中心库A区',
    quantity: 320,
  },
  {
    id: 13,
    name: '葡萄糖注射液(5%)',
    expiryDate: '2026-08-13',
    daysLeft: 9,
    warehouse: '中心库A区',
    quantity: 48,
  },
  {
    id: 14,
    name: '双氯芬酸钠肠溶片',
    expiryDate: '2026-08-18',
    daysLeft: 14,
    warehouse: '急诊药房',
    quantity: 120,
  },
  {
    id: 15,
    name: '地塞米松注射液',
    expiryDate: '2026-08-24',
    daysLeft: 20,
    warehouse: '住院药房',
    quantity: 36,
  },
  {
    id: 16,
    name: '维生素C片',
    expiryDate: '2026-08-29',
    daysLeft: 25,
    warehouse: '中心库B区',
    quantity: 200,
  },
  {
    id: 17,
    name: '阿莫西林胶囊',
    expiryDate: '2026-09-03',
    daysLeft: 30,
    warehouse: '门诊药房',
    quantity: 84,
  },
  {
    id: 18,
    name: '头孢克洛胶囊',
    expiryDate: '2026-09-08',
    daysLeft: 35,
    warehouse: '儿科药房',
    quantity: 60,
  },
  {
    id: 19,
    name: '苯磺酸氨氯地平片',
    expiryDate: '2026-09-13',
    daysLeft: 40,
    warehouse: '中心库A区',
    quantity: 156,
  },
  {
    id: 20,
    name: '布洛芬缓释胶囊',
    expiryDate: '2026-09-19',
    daysLeft: 46,
    warehouse: '中药房',
    quantity: 90,
  },
  {
    id: 21,
    name: '奥美拉唑肠溶胶囊',
    expiryDate: '2026-09-28',
    daysLeft: 55,
    warehouse: '静配中心',
    quantity: 72,
  },
  {
    id: 22,
    name: '复方甘草片',
    expiryDate: '2026-10-03',
    daysLeft: 60,
    warehouse: '住院药房',
    quantity: 180,
  },
  {
    id: 23,
    name: '盐酸二甲双胍片',
    expiryDate: '2026-10-20',
    daysLeft: 77,
    warehouse: '门诊药房',
    quantity: 240,
  },
  {
    id: 24,
    name: '氯化钠注射液(0.9%)',
    expiryDate: '2026-11-02',
    daysLeft: 90,
    warehouse: '中心库A区',
    quantity: 320,
  },
];
