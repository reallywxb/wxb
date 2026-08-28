import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'id',
      minWidth: 100,
      title: 'ID',
      sortable: true,
    },
    {
      field: 'createTime',
      width: 140,
      title: '日志时间',
      sortable: true,
    },
    {
      field: 'title',
      minWidth: 100,
      title: '日志标题',
      sortable: true,
    },
    {
      field: 'type_name',
      minWidth: 90,
      title: '日志类型',
      sortable: true,
    },
    {
      field: 'requestUri',
      minWidth: 100,
      title: '请求地址',
      sortable: true,
    },
    {
      field: 'params',
      minWidth: 100,
      title: '参数',
      sortable: true,
    },
    {
      field: 'method',
      minWidth: 90,
      title: '请求方式',
      sortable: true,
    },
    {
      field: 'time',
      minWidth: 100,
      title: '耗时(ms)',
      sortable: true,
    },
    {
      field: 'orgId_name',
      width: 140,
      title: '机构',
      sortable: true,
    },
    {
      field: 'createdByName',
      minWidth: 120,
      title: '操作人名',
      sortable: true,
    },
    {
      field: 'remoteAddr',
      minWidth: 100,
      title: '远程地址',
      sortable: true,
    },
    {
      field: 'userAgent',
      minWidth: 100,
      title: '用户代理',
      sortable: true,
    },
    {
      field: 'browserName',
      minWidth: 100,
      title: '浏览器',
      sortable: true,
    },
    {
      field: 'osName',
      minWidth: 100,
      title: '操作系统',
      sortable: true,
    },
    {
      field: 'exception',
      minWidth: 100,
      title: '错误信息',
      sortable: true,
    },
    {
      field: 'clientId',
      minWidth: 100,
      title: '客户端',
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
