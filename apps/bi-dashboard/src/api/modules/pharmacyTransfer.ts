import { get } from '../request'

export interface PharmacyTransferStats {
  totalOrders: number
  superiorAmount: number
  peerAmount: number
}

export interface PharmacyTransferItem {
  name: string
  superior: number
  peer: number
}

export function getPharmacyTransferData() {
  return get<{
    pharmacyTransferStats: PharmacyTransferStats;
    pharmacyTransferData: PharmacyTransferItem[];
  }>('/biDashboardAction/queryPharmacyTransfer');
}
