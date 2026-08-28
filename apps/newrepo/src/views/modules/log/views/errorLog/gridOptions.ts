import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'createTime',
      width: 140,
      title: '错误时间',
      sortable: true,
    },
    {
      field: 'error',
      minWidth: 100,
      title: '错误',
      sortable: true,
    },
    {
      field: 'classname',
      minWidth: 100,
      title: '类名',
      sortable: true,
    },
    {
      field: 'method',
      minWidth: 100,
      title: '方法名',
      sortable: true,
    },
    {
      field: 'params',
      minWidth: 100,
      title: '参数',
      sortable: true,
    },
    {
      field: 'orgId_name',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },

    {
      field: 'createdBy',
      minWidth: 100,
      title: '执行人',
      sortable: true,
    },
    {
      field: 'createdByName',
      minWidth: 100,
      title: '执行人名',
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
