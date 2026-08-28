import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'siteId', minWidth: 100, title: '站点', sortable: true },
    { field: 'orgId_name', minWidth: 100, title: '机构', sortable: true },
    { field: 'warehouseId', minWidth: 100, title: '仓库', sortable: true },
    {
      field: 'siteWarehouseCode',
      minWidth: 100,
      title: '站点仓库编码',
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      title: '是否有效',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    // "id"
    // "创建人"
    // "修改人"
    {
      align: 'center',
      slots: {
        default: 'action',
      },
      field: 'action',
      fixed: 'right',
      width: 140,
      title: '操作',
    },
  ];

  return {
    proxyConfig: {
      autoLoad: true,
    },
    radioConfig: {
      highlight: true,
      trigger: 'row',
    },
    columns,
  };
};
