import { get } from '../request'

export interface ConsumptionPieItem {
  name: string
  value: number
}

export function getConsumptionPieData() {
  return get<ConsumptionPieItem[]>('/api/dashboard/consumption-pie')
}
