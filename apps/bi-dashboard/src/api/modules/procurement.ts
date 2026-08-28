import { get } from '../request'

export interface ProcurementMetric {
  label: string
  value: string
  unit: string
  yoy?: number     // 同比
  ratio?: number   // 占比
  color: string
  iconChar: string
}

export function getProcurementData() {
  return get<{ metrics: ProcurementMetric[] }>(
    '/biDashboardAction/queryProcurementInventory',
  );
}
