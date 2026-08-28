import type { VxeTableGridOptions } from '#/adapter/vxe-table';

/**
 * 页面表格组件配置
 */
import { getDataTableList } from '#/views/modules/spd/api/crud';

export function usePageGridEnv(selectParams: any) {
  const dataTableId = '/asnAction/queryLine.do?specShowType=from';
  const cols: any[] = [];
  const gridApproveOptions: VxeTableGridOptions = {
    checkboxConfig: {
      highlight: false,
      labelField: 'name',
    },
    columnConfig: {
      drag: true,
    },
    columns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'checkTime',
        minWidth: 110,
        sortable: true,
        title: '验收时间',
      },
      {
        field: 'checkerName',
        minWidth: 135,
        sortable: true,
        title: '验收人',
      },
      {
        field: 'lineStatusName',
        minWidth: 100,
        sortable: true,
        title: '验收状态',
      },
      {
        field: 'productName',
        minWidth: 100,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 100,
        sortable: true,
        title: '规格',
      },
      {
        field: 'lot',
        minWidth: 100,
        sortable: true,
        title: '批号',
      },
      {
        field: 'guaranteeDate',
        minWidth: 100,
        sortable: true,
        title: '效期',
      },
      {
        field: 'qtyArrived',
        minWidth: 100,
        sortable: true,
        title: '入库数量',
        align: 'right',
      },
      {
        field: 'qtyRejected',
        minWidth: 100,
        sortable: true,
        title: '拒收数量',
        align: 'right',
      },
      {
        field: 'serNo',
        minWidth: 100,
        sortable: true,
        title: '序列号',
      },
    ],
    exportConfig: {},
    height: 'auto',
    keepSource: false,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          let currentPage = 1;
          if (page.currentPage) {
            currentPage = page.currentPage;
          }
          const res = await getDataTableList(dataTableId, {
            cols,
            current: currentPage,
            ...selectParams.value,
            ...formValues,
          });
          return res?.rows;
        },
      },
      autoLoad: true,
    },
    radioConfig: {
      highlight: true,
      trigger: 'row',
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: false,
      // export: true,
      // refresh: false,
      resizable: false,
      // search: true,
      zoom: false,
    },
  };
  return {
    cols,
    gridApproveOptions,
  };
}
