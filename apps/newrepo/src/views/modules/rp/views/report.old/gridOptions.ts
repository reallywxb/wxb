import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { type: 'radio', visible: false },
    { field: 'orgId_name', minWidth: 100, title: '机构', sortable: true },
    { field: 'code', minWidth: 100, title: '编码', sortable: true },
    { field: 'name', minWidth: 100, title: '名称', sortable: true },
    { field: 'reportGroup', minWidth: 100, title: '分组', sortable: true },
    {
      field: 'isPrintDoc',
      width: 120,
      title: '是否打印单据',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'templateId_name',
      minWidth: 100,
      title: '报表模板',
      sortable: true,
    },
    {
      field: 'orgScope_name',
      minWidth: 100,
      title: '机构范围',
      sortable: true,
    },
    { field: 'remark', minWidth: 140, title: '备注', sortable: true },

    {
      field: 'isActive',
      width: 100,
      title: '是否启用',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'createTime', width: 140, title: '创建时间', sortable: true },
    { field: 'updateTime', width: 140, title: '更新时间', sortable: true },
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

export const useReportSettingGridOptions = (): CrudGridOptions<any> => {
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
      field: 'ownerId_name',
      minWidth: 100,
      title: '货主',
      sortable: true,
    },
    {
      field: 'bpartnerId_name',
      minWidth: 100,
      title: '客商',
      sortable: true,
    },
    {
      field: 'templateId_name',
      minWidth: 100,
      title: '报表模板',
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      title: '是否启用',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },

    {
      field: 'action',
      fixed: 'right',
      slots: {
        default: 'action',
      },
      width: 140,
      title: '操作',
    },
  ];

  return {
    columns,
  };
};

export const useReportPrinterGridOptions = (): CrudGridOptions<any> => {
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
      field: 'ownerId_name',
      minWidth: 100,
      title: '货主',
      sortable: true,
    },
    {
      field: 'bpartnerId_name',
      minWidth: 100,
      title: '客商',
      sortable: true,
    },

    {
      field: 'isAutoPrint',
      width: 100,
      title: '是否自动打印',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },

    {
      field: 'printerId_name',
      minWidth: 100,
      title: '打印机',
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      title: '是否启用',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'action',
      fixed: 'right',
      slots: {
        default: 'action',
      },
      width: 140,
      title: '操作',
    },
  ];

  return {
    columns,
  };
};

export const useReportOrgGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'orgId_name',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },
    {
      field: 'createTime',
      width: 140,
      title: '创建时间',
      sortable: true,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: {
        default: 'action',
      },
      width: 140,
      title: '操作',
    },
  ];

  return {
    columns,
  };
};

export const useReportRoleGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'orgId_name',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },
    {
      field: 'roleId_name',
      minWidth: 100,
      title: '角色',
      sortable: true,
    },
    {
      field: 'createTime',
      width: 140,
      title: '创建时间',
      sortable: true,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: {
        default: 'action',
      },
      width: 140,
      title: '操作',
    },
  ];

  return {
    columns,
  };
};
