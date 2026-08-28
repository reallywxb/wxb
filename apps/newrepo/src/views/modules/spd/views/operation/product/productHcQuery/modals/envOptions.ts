import type { VxeTableGridOptions } from '#/adapter/vxe-table';

/**
 * 页面表格组件配置
 */
import { getDataTableList } from '#/views/modules/spd/api/crud';

export function usePageGridEnv(selectParams: any) {
  const dataTableId = '/orderPlanAction/queryActivity.do';
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
        field: 'nodeName',
        minWidth: 110,
        sortable: true,
        title: '审批节点',
      },
      {
        field: 'wfstateName',
        minWidth: 135,
        sortable: true,
        title: '审批状态',
      },
      {
        field: 'userName',
        minWidth: 80,
        sortable: true,
        title: '审批人',
      },
      {
        field: 'updated',
        minWidth: 100,
        sortable: true,
        title: '审批时间',
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
