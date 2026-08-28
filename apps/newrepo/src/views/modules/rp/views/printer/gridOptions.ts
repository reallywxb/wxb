import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'orgId_name',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },
    {
      field: 'warehouseId_name',
      minWidth: 100,
      title: '仓库',
      sortable: true,
    },
    {
      field: 'name',
      minWidth: 100,
      title: '名称',
      sortable: true,
    },
    {
      field: 'osPrinterName',
      minWidth: 100,
      title: '系统打印机名',
      sortable: true,
    },
    {
      field: 'ipAddress',
      minWidth: 100,
      title: 'IP地址',
      sortable: true,
    },
    {
      field: 'printServerId_name',
      minWidth: 100,
      title: '打印服务器',
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      sortable: true,
      title: '是否启用',
      formatter: ({ cellValue }: any) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
      sortable: true,
    },
    {
      align: 'center',
      slots: {
        default: 'action',
      },
      field: 'action',
      fixed: 'right',
      width: 180,
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
