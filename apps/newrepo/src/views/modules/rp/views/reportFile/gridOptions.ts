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
      field: 'reportId',
      minWidth: 100,
      title: '报表ID',
      sortable: true,
    },
    {
      field: 'reportGroup',
      minWidth: 100,
      title: '报表分组',
      sortable: true,
    },
    {
      field: 'reportCode',
      minWidth: 100,
      title: '报表编码',
      sortable: true,
    },
    {
      field: 'documentNo',
      minWidth: 100,
      title: '单据编号',
      sortable: true,
    },
    {
      field: 'reportTitle',
      minWidth: 100,
      title: '报表标题',
      sortable: true,
    },
    {
      field: 'datetime',
      width: 140,
      title: '制表时间',
      sortable: true,
    },
    {
      field: 'entityType',
      minWidth: 120,
      title: '实体类型',
      sortable: true,
    },
    {
      field: 'entityId',
      minWidth: 100,
      title: '实体ID',
      sortable: true,
    },
    {
      field: 'params',
      minWidth: 100,
      title: '参数',
      sortable: true,
    },
    {
      field: 'fileUrl',
      minWidth: 100,
      title: '文件链接',
      sortable: true,
    },
    {
      field: 'fileFormat',
      minWidth: 100,
      title: '文件格式',
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
