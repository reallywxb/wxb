import type { RequestClientConfig } from '@vben/request';

import { requestClient } from '#/api/request';

const IMPORT_TIMEOUT_MS = 10 * 60 * 1000;

const withImportTimeout = (
  config?: RequestClientConfig,
): RequestClientConfig => {
  return {
    timeout: IMPORT_TIMEOUT_MS,
    ...config,
  };
};

export const importPoPlanData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/orderPlanAction/importOrderPlan.do?isFree=N&isPackaged=N',
    data,
    withImportTimeout(config),
  );
};

// 手工入库导入
export const importAsnData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/asnAction/importAsn.do',
    data,
    withImportTimeout(config),
  );
};
// 手工入库 后勤物资导入
export const importAsnSuppliesData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/asnAction/importAsnSupplies.do',
    data,
    withImportTimeout(config),
  );
};

export const importwarehouseOrderData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/orderAction/importWarehouseOrder.do?orderType=WO&isPackaged=N',
    data,
    withImportTimeout(config),
  );
};

export const importwarehousePackagedData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/orderAction/importWarehouseOrder.do?orderType=WO&isPackaged=Y',
    data,
    withImportTimeout(config),
  );
};

// 术式字典维护导入接口
export const importSurgicalTypeData = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/surgicalTypeAction/importSugicalType.do',
    data,
    withImportTimeout(config),
  );
};

// 调价单录入导入接口
export const importPriceListAdj = (
  data: Record<string, any> & { file: Blob | File },
  config?: RequestClientConfig,
) => {
  return requestClient.upload(
    '/productAction/importPriceListAdj.do',
    data,
    withImportTimeout(config),
  );
};
