import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

/**
 * 页面表格组件配置
 */
import { getDataTableList } from '#/views/modules/spd/api/crud';

const userStore = useUserStore();

export function usePageGridEnv(selectParams) {
  const dataTableId =
    '/datatable/data/process/wms.picklist/queryReviewProducts';
  const cols: any[] = [
    // { id: 'id' },
    // { dict: true, id: 'orgId' },
    // { dict: true, id: 'deptId' },
  ];
  const gridOptions: VxeTableGridOptions = {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columnConfig: {
      drag: true,
    },
    columns: [
      { align: 'center', fixed: 'left', type: 'checkbox', width: 50 },
      { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'owenrName',
        minWidth: 80,
        sortable: false,
        title: '货主',
      },
      {
        field: 'spec1',
        minWidth: 100,
        sortable: false,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 100,
        sortable: false,
        title: '药品名称',
      },
      {
        field: 'spec',
        minWidth: 100,
        sortable: false,
        title: '规格',
      },
      {
        field: 'dosageFormName',
        minWidth: 100,
        sortable: false,
        title: '剂型',
      },
      {
        field: 'manufacturer',
        minWidth: 180,
        sortable: false,
        title: '生产企业/受托生产企业',
      },
      {
        field: 'lot',
        minWidth: 120,
        sortable: false,
        title: '批号/序列号',
      },
      {
        field: 'purchaser',
        minWidth: 80,
        sortable: false,
        title: '库区',
      },
      {
        field: 'locatorCode',
        minWidth: 80,
        sortable: false,
        title: '货位',
      },
      {
        field: 'approvalNumber',
        minWidth: 220,
        sortable: false,
        title: '批准文号',
      },
      {
        field: 'productionDate',
        minWidth: 100,
        sortable: false,
        title: '生产日期',
      },
      {
        field: 'guaranteeDate',
        minWidth: 120,
        sortable: false,
        title: '有效期',
      },
    ],
    exportConfig: {},
    height: 'auto',
    keepSource: false,
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (!formValues.ownerId && !selectParams.value?.ownerId) {
            message.warn('请选择货主');
            return;
          }
          // console.log(22_222_222_222_222, formValues);
          const res = await getDataTableList(dataTableId, {
            cols,
            current: page.currentPage,
            orgId: userStore.userInfo?.orgId,
            size: page.pageSize,
            warehouseId: userStore.userInfo?.warehouseId,
            ...selectParams.value,
            ...formValues,
          });
          return {
            total: res.total,
            items: res.records,
          };
        },
      },
      autoLoad: false,
    },
    radioConfig: {
      highlight: false,
      trigger: 'row',
    },
    rowConfig: {
      keyField: 'id',
    },
    // sortConfig: {
    //   remote: false,
    // },
    toolbarConfig: {
      custom: false,
      // export: true,
      // refresh: false,
      resizable: true,
      // search: true,
      zoom: false,
    },
  };
  const [GridEnv, gridApiEnv] = useSpdGrid(
    {
      gridEvents: {},
      gridOptions,
    },
    {},
  );
  return {
    cols,
    gridApiEnv,
    GridEnv,
  };
}
