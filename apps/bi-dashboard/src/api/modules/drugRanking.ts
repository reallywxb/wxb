import { get } from '../request'

export interface DrugRankingItem {
  name: string
  consumption: number
  trend: number
}

export function getDrugRankingData() {
  return get<DrugRankingItem[]>('/api/dashboard/drug-ranking')
}
