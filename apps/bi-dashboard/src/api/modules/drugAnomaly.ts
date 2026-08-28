import { get } from '../request'

export interface DrugAnomalyItem {
  name: string
  amount: number
  change: number
  type: '暴增' | '暴减' | '偏高' | '偏低'
}

export function getDrugAnomalyData() {
  return get<{ drugAnomalyData: DrugAnomalyItem[] }>(
    '/biDashboardAction/queryDrugAnomaly',
  );
}
