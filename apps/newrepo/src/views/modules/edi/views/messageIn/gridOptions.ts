import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'msgTime', width: 140, title: '消息时间', sortable: true },
    { field: 'msgType_name', minWidth: 100, title: '消息类型', sortable: true },
    {
      field: 'siteId_name',
      minWidth: 100,
      title: '来源站点',
      sortable: true,
    },
    { field: 'msgNo', minWidth: 100, title: '消息号', sortable: true },
    {
      field: 'processStatus',
      width: 130,
      title: '处理状态',
      sortable: true,
    },
    // {
    //   field: 'openId',
    //   minWidth: 100,
    //   title: '站点用户编码',
    //   sortable: true,
    // },
    {
      field: 'processMsg',
      minWidth: 100,
      title: '错误消息',
      sortable: true,
    },

    {
      field: 'id',
      minWidth: 100,
      title: '消息ID',
      sortable: true,
    },
    {
      field: 'msgVersion',
      minWidth: 100,
      title: '消息版本',
      sortable: true,
    },
    {
      field: 'msgGroup',
      minWidth: 100,
      title: '消息分组',
      sortable: true,
    },
    {
      field: 'priority',
      minWidth: 100,
      title: '优先级',
      sortable: true,
    },
    {
      field: 'siteAppId',
      minWidth: 100,
      title: '来源应用',
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
      sortable: true,
    },
    {
      field: 'lastProcessTime',
      width: 140,
      title: '上次处理时间',
      sortable: true,
    },
    {
      field: 'retryCount',
      minWidth: 100,
      title: '重试次数',
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      sortable: true,
      title: '是否有效',
      formatter: ({ cellValue }: any) => {
        return cellValue === 'Y' ? '是' : '否';
      },
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
