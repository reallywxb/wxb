import { get } from '../request'

export interface MonthlyChartItem {
  month: string
  inbound: number
  outbound: number
  stock: number
}

export function getMonthlyChartData() {
  return get<{ monthlyChartData: MonthlyChartItem[] }>(
    '/biDashboardAction/queryWarehouseInOutTrend',
  );
}
