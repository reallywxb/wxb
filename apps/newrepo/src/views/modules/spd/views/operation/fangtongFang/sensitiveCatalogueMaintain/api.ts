import { requestFormClient } from '#/api/request';

// 功能设置
export interface ActionMenuTable {
  createName: string;
  created: string;
  id: string;
  isActive: 'N' | 'Y';
  menuId: string;
  menuName: string;
  operation: string;
}

// 启用
export const updateStart = (params: any) => {
  return requestFormClient.post<any>('/aptAction/useMenu', params);
};

// 停用
export const updateStop = (params: any) => {
  return requestFormClient.post<any>('/aptAction/deleteMenu', params);
};

// 新增统方敏感物资
export const addSensitiveMaterials = (params: any) => {
  return requestFormClient.post<any>(
    '/sensitiveMaterialsAction/add.do',
    params,
  );
};

// 物资设置Table
export interface TableDataItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  mManufacturerId: string;
  manufacturerName: string;
  brandName: string;
  DefaultSupplier: string;
  created: string;
  createName: string;
  isActive: 'N' | 'Y';
}

// 启用
export const updateMaterialsStart = (params: any) => {
  return requestFormClient.post<any>('/aptAction/useProduct', params);
};
// 停用
export const updateMaterialsStatusStop = (params: any) => {
  return requestFormClient.post<any>('/aptAction/deleteProduct', params);
};

// 保存产品信息
export const updateMaterialsInfo = (params: any) => {
  return requestFormClient.post<any>('/aptAction/saveProduct', params);
};

// 人员设置Table
export interface PersonRow {
  id: string;
  personId: string;
  personCode: string;
  personName: string;
  roleName: string;
  created: string;
  createName: string;
  isActive: 'N' | 'Y';
  [key: string]: any;
}

// 启用
export const updatePersonStart = (params: any) => {
  return requestFormClient.post<any>('/aptAction/usePerson', params);
};
// 停用
export const updatePersonStop = (params: any) => {
  return requestFormClient.post<any>('/aptAction/deletePerson', params);
};

// 按角色批量保存人员信息
export const updatePersonByRole = (params: any) => {
  return requestFormClient.post<any>('/aptAction/savePersonForRole', params);
};
// 按编码保存人员信息
export const updatePersonByCode = (params: any) => {
  return requestFormClient.post<any>('/aptAction/savePersonForCode', params);
};
