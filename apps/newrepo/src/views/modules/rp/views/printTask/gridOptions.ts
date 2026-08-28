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
      field: 'zoneId_name',
      minWidth: 100,
      title: '库区',
      sortable: true,
    },
    {
      field: 'printerId_name',
      minWidth: 100,
      title: '后台打印机',
      sortable: true,
    },
    {
      field: 'printServerId_name',
      minWidth: 100,
      title: '打印服务器',
      sortable: true,
    },
    {
      field: 'reportId_name',
      minWidth: 100,
      title: '报表定义',
      sortable: true,
    },
    {
      field: 'reportName',
      minWidth: 100,
      title: '报表名称',
      sortable: true,
    },
    {
      field: 'reportFileId_name',
      minWidth: 120,
      title: '报表打印文件',
      sortable: true,
    },
    {
      field: 'fileUrl',
      minWidth: 100,
      title: '文件链接',
      sortable: true,
    },
    {
      field: 'printDirection_name',
      minWidth: 100,
      title: '打印方向',
      sortable: true,
    },
    {
      field: 'printPaper_name',
      minWidth: 100,
      title: '打印纸张',
      sortable: true,
    },
    {
      field: 'paperWith',
      minWidth: 100,
      title: '打印纸张宽',
      sortable: true,
    },
    {
      field: 'paperHeight',
      minWidth: 100,
      title: '打印纸张高',
      sortable: true,
    },
    {
      field: 'entityType',
      minWidth: 100,
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
      field: 'status_name',
      minWidth: 100,
      title: '状态',
      sortable: true,
    },
    {
      field: 'taskTime',
      width: 140,
      title: '任务时间',
      sortable: true,
    },
    {
      field: 'acceptTaskTime',
      width: 140,
      title: '接收任务时间',
      sortable: true,
    },
    {
      field: 'startPrintTime',
      width: 140,
      title: '开始打印时间',
      sortable: true,
    },
    {
      field: 'endPrintTime',
      width: 140,
      title: '结束打印时间',
      sortable: true,
    },
    {
      field: 'retryCount',
      minWidth: 100,
      title: '重试次数',
      sortable: true,
    },
    {
      field: 'error',
      minWidth: 100,
      title: '错误信息',
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
