import type {
  AcceptanceData,
  BudgetMonthlyItem,
} from '../api/modules/acceptance';

import {
  getAcceptanceData,
  getConsumptionPieData,
  getDrugAnomalyData,
  getDrugRankingData,
  getMonthlyChartData,
  getNearExpiryData,
  getPharmacyTransferData,
  getProcurementData,
} from '../api';
import { useApi } from '../hooks/useApi';

// 当日验收合格率（每分钟刷新）
export function useAcceptanceData() {
  return useApi<AcceptanceData>(getAcceptanceData, {
    refreshInterval: 8 * 60 * 60 * 1000,
  });
}

// 采购统计（每 8 小时刷新）
export function useProcurementData() {
  return useApi(getProcurementData, { refreshInterval: 8 * 60 * 60 * 1000 });
}

// 近12个月入库出库统计（每 8 小时刷新）
export function useMonthlyChartData() {
  return useApi(getMonthlyChartData, { refreshInterval: 8 * 60 * 60 * 1000 });
}

// 药房调拨分布（每 8 小时刷新）
export function usePharmacyTransferData() {
  return useApi(getPharmacyTransferData, { refreshInterval: 8 * 60 * 60 * 1000 });
}

// 全院异动品种统计（每 8 小时刷新）
export function useDrugAnomalyData() {
  return useApi(getDrugAnomalyData, { refreshInterval: 8 * 60 * 60 * 1000 });
}

// 近效期药品列表（每 8 小时刷新）
export function useNearExpiryData() {
  return useApi(getNearExpiryData, { refreshInterval: 8 * 60 * 60 * 1000 });
}

// 药品消耗分类统计
export function useConsumptionPieData() {
  return useApi(getConsumptionPieData);
}

// 药品排行榜
export function useDrugRankingData() {
  return useApi(getDrugRankingData);
}
