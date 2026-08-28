import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'createTime',
      width: 140,
      title: '消息时间',
      sortable: true,
    },
    {
      title: '客户端',
      field: 'clientCode',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '主题',
      field: 'topic',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '消息类型',
      field: 'messageType',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '消息主键',
      field: 'messageKey',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '处理状态',
      field: 'processStatus',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '是否异常',
      field: 'isError',
      minWidth: 100,
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      title: '错误信息',
      field: 'errorMessage',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '上次处理时间',
      field: 'processTime',
      width: 140,
      sortable: true,
    },
    {
      title: '下次处理时间',
      field: 'nextProcessTime',
      width: 140,
      sortable: true,
    },
    {
      title: '重试次数',
      field: 'retryCount',
      width: 100,
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
