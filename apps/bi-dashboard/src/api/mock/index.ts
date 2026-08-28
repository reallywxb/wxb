import Mock from 'mockjs';
import {
  acceptanceData,
  budgetMonthlyData,
  monthlyChartData,
  pharmacyTransferStats,
  pharmacyTransferData,
  drugAnomalyData,
  nearExpiryData,
  procurementMetrics,
  DRUG_CATEGORIES,
} from './mockData';

console.log('[Mock] Mock.js 已加载');

// 模拟网络延迟
Mock.setup({
  timeout: '200-500',
});

console.log('[Mock] 开始注册接口...');

// 全年预算执行总览
Mock.mock(/\/biDashboardAction\/queryBudgetOverview/, 'get', () => {
  console.log('[Mock] /biDashboardAction/queryBudgetOverview 被调用');
  return { code: 200, data: acceptanceData, msg: 'success' };
});

// 全院异动品种统计
Mock.mock(/\/biDashboardAction\/queryDrugAnomaly/, 'get', () => ({
  code: 200,
  data: { drugAnomalyData },
  msg: 'success',
}));

// 采购库存总览
Mock.mock(/\/biDashboardAction\/queryProcurementInventory/, 'get', () => ({
  code: 200,
  data: { metrics: procurementMetrics },
  msg: 'success',
}));

// 近12个月中心库入库和出库统计
Mock.mock(/\/biDashboardAction\/queryWarehouseInOutTrend/, 'get', () => ({
  code: 200,
  data: { monthlyChartData },
  msg: 'success',
}));

// 药房调拨分布
Mock.mock(/\/biDashboardAction\/queryPharmacyTransfer/, 'get', () => ({
  code: 200,
  data: {
    pharmacyTransferStats,
    pharmacyTransferData,
  },
  msg: 'success',
}));

// 全院近效期药品列表
Mock.mock(/\/biDashboardAction\/queryNearExpiryDrugs/, 'get', () => ({
  code: 200,
  data: { nearExpiryData },
  msg: 'success',
}));

// 药品消耗分类统计（基于 DRUG_CATEGORIES 生成 mock 数据）
Mock.mock(/\/api\/dashboard\/consumption-pie/, 'get', () => ({
  code: 200,
  data: DRUG_CATEGORIES.map((name) => ({
    name,
    value: Mock.Random.integer(100, 5000),
  })),
  msg: 'success',
}));

// 药品排行榜（基于 DRUG_CATEGORIES 生成 mock 数据）
Mock.mock(/\/api\/dashboard\/drug-ranking/, 'get', () => ({
  code: 200,
  data: DRUG_CATEGORIES.map((name) => ({
    name,
    consumption: Mock.Random.integer(1000, 50000),
    trend: Mock.Random.float(-20, 30, 1, 1),
  })),
  msg: 'success',
}));

console.log('[Mock] 已注册 BI Dashboard 所有接口');
