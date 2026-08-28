import { requestFormClient } from '#/api/request';

export function saveProduct(data: any, params: any) {
  return requestFormClient.post('/productAction/saveProduct.do', data, {
    params,
    responseReturn: 'body',
  });
}
// 导入商品
export function importProduct(data: any, params?: any) {
  return requestFormClient.upload('/productAction/importProduct.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 导入使用规格
export function importSpec(data: any, params?: any) {
  return requestFormClient.upload('/productAction/importProductSpec.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 导入定数货位
export function importAllocation(data: any, params?: any) {
  return requestFormClient.upload('/productAction/importProductSpec.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 导入协议
export function importContranct(data: any, params?: any) {
  return requestFormClient.upload('/vendorAction/importContranct.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 导入供应商
export function importProductOrg(data: any, params?: any) {
  return requestFormClient.upload('/productAction/importProductOrg.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 导入采购限量
export function importCurtail(data: any, params?: any) {
  return requestFormClient.upload('/productAction/importCurtail.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 导入商品分类
export function importProductType(data: any, params?: any) {
  return requestFormClient.upload('/productAction/importProductType.do', data, {
    params,
    responseReturn: 'body',
  });
}

// 批量修改
export function saveBatchProduct(data: any) {
  return requestFormClient.post('/productAction/saveProductBatch.do', data, {
    responseReturn: 'body',
  });
}

// 查询规格
export function queryProductSpec(data: any) {
  return requestFormClient.post('/productAction/queryProductSpec.do', data);
}

// 保存商品规格
export function saveProductSpec(data: any) {
  return requestFormClient.post('productAction/saveProductSpec.do', data);
}

// 查询定数
export function queryProductPack(data: any) {
  return requestFormClient.post('/productAction/queryProductPack.do', data);
}

// 保存定数
export function saveProductPack(data: any) {
  return requestFormClient.post('productAction/saveProductPack.do', data);
}

// 保存定数
export function syncCert(data: any) {
  return requestFormClient.post('/productAction/syncCert.do', data);
}

// 添加商品到科室
export function saveProductToBpartner(data: any) {
  return requestFormClient.post(
    '/productAction/saveProductToBpartner.do',
    data,
  );
}

/* 采购协议*/
// 查询定数
export function queryContractLine(data: any, params: any) {
  return requestFormClient.post('/vendorAction/queryContractLine.do', data, {
    params,
  });
}

// 查询定数
export function saveContractLine(data: any) {
  return requestFormClient.post('/vendorAction/contractSave.do', data);
}

export function deleteContract(data: any) {
  return requestFormClient.post('/vendorAction/deleteContract.do', data);
}

export function commitContract(data: any) {
  return requestFormClient.post('/vendorAction/commitContract.do', data);
}

export function completeContract(data: any) {
  return requestFormClient.post('/vendorAction/completeContract.do', data);
}

// 查询采购单位
export function queryProductUnit() {
  return requestFormClient.post('/baseHandleAction/refList.do?id=114');
}

// 启用停用
export function activateProduct(data: any) {
  return requestFormClient.post('/productAction/changeActiveProduct.do', data, {
    responseReturn: 'body',
  });
}

export function commitProduct(data: any) {
  return requestFormClient.post('/productAction/commitProduct.do', data, {
    responseReturn: 'body',
  });
}

export function deleteProduct(data: any) {
  return requestFormClient.post('/productAction/delProduct.do', data, {
    responseReturn: 'body',
  });
}

/* 商品供应商 */

export function batchSaveProductOrg(data: any) {
  return requestFormClient.post('/productAction/batchSaveProductOrg.do', data);
}

export function batchChangeVendor(data: any) {
  return requestFormClient.post('/productAction/batchChangeVendor.do', data);
}

export function modifyProductOrg(data: any) {
  return requestFormClient.post('/productAction/modifyProductOrg.do', data);
}
// 供应商商品管理子表编辑保存
export function saveProductChildOrg(data: any) {
  return requestFormClient.post('/productAction/saveProductOrg', data);
}

/* 试剂组套 */

export function saveReagentGroup(data: any) {
  return requestFormClient.post('/productAction/saveReagentGroup.do', data);
}

export function deleteReagentGroup(data: any) {
  return requestFormClient.post('/productAction/deleteReagentGroup.do', data);
}

export function saveReagentGroupProduct(data: any) {
  return requestFormClient.post(
    '/productAction/saveReagentGroupProduct.do',
    data,
  );
}

export function delReagentGroupProduct(data: any) {
  return requestFormClient.post(
    '/productAction/delReagentGroupProduct.do',
    data,
  );
}

/* 商品分类维护*/
export function queryTypeTree(data: any, params: any) {
  return requestFormClient.post('/dictHandleAction/queryTypeTree.do', data, {
    params,
  });
}

// export function querySubTypeList(data: any, params: any) {
//   return requestFormClient.post('/dictHandleAction/queryLine.do', data, {
//     params,
//   });
// }

export function saveProductType(data: any) {
  return requestFormClient.post('/dictHandleAction/saveProductType.do', data);
}

export function deleteProductType(data: any) {
  return requestFormClient.post('/dictHandleAction/deleteProductType.do', data);
}

/* 商品采购限量*/
export function saveCurtail(data: any) {
  return requestFormClient.post('/productAction/saveCurtail.do', data);
}

/* 商品审批 */
export function approveProduct(data: any) {
  return requestFormClient.post('/productAction/approveProduct.do', data);
}
/* 商品审批（后勤物资） */
export function confirmProductApply(data: any) {
  return requestFormClient.post('/productAction/confirmProductApply', data);
}
/* 商品维护修改（后勤物资） */
export function saveProductApply(data: any, params: any) {
  return requestFormClient.post('/productAction/saveProductApply.do', data, {
    params,
    responseReturn: 'body',
  });
}
