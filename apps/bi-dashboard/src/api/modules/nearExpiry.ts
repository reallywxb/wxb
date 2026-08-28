import { get } from '../request'

export interface NearExpiryItem {
  id: number
  name: string
  expiryDate: string
  daysLeft: number
  warehouse: string
  quantity: number
}

export function getNearExpiryData() {
  return get<{ nearExpiryData: NearExpiryItem[] }>(
    '/biDashboardAction/queryNearExpiryDrugs',
  );
}
