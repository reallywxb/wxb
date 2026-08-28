// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建病区组配置页面的类型定义
// @description 定义 WardGroup 病区组接口和 Ward 病区接口
export interface WardGroup {
  dictValue: number | string;
  groupName: string;
  deptCount?: number;
  wardIds?: (number | string | string)[];
}

export interface Ward {
  id?: number | string;
  deptName: string;
  deptCode: string;
  value: number | string;
  boundId?: number | string;
  deptId?: number | string;
}
// AI-GENERATED-END
