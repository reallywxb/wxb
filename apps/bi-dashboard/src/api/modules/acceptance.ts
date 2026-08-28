import { get } from '../request';

// 单类预算数据（药品/消杀物资/疫苗）
export interface BudgetCategory {
  totalDigits: string[]; // 预算数字位
  totalUnit: string; // 预算单位
  doneDigits: string[]; // 完成数数字位
  doneUnit: string; // 完成数单位
  rate: number; // 使用率百分比
}

// 全年预算执行总览接口
export interface AcceptanceData {
  drug: BudgetCategory; // 药品预算
  disinfection: BudgetCategory; // 消杀物资预算
  vaccine: BudgetCategory; // 疫苗预算
}

export interface BudgetMonthlyItem {
  month: string;
  executed: number;
  remaining: number;
}

export function getAcceptanceData() {
  return get<AcceptanceData>('/biDashboardAction/queryBudgetOverview');
}
