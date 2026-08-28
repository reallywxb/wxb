import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'noticeTime', width: 140, title: '通知时间', sortable: true },
    { field: 'siteId_name', minWidth: 100, title: '站点', sortable: true },
    {
      field: 'siteUserId_name',
      minWidth: 100,
      title: '站点用户',
      sortable: true,
    },
    { field: 'userId_name', minWidth: 100, title: '系统用户', sortable: true },
    // {
    //   field: 'openId',
    //   minWidth: 100,
    //   title: '站点用户编码',
    //   sortable: true,
    // },
    {
      field: 'noticeTemplateId_name',
      minWidth: 100,
      title: '通知模板',
      sortable: true,
    },

    {
      field: 'content',
      minWidth: 100,
      title: '内容',
      sortable: true,
    },
    {
      field: 'params',
      minWidth: 100,
      title: '参数',
      sortable: true,
    },
    {
      field: 'priority',
      minWidth: 100,
      title: '优先级',
      sortable: true,
    },
    {
      field: 'processStatus',
      minWidth: 100,
      title: '处理状态',
      sortable: true,
    },
    {
      field: 'processMsg',
      minWidth: 100,
      title: '处理消息',
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
    {
      field: 'retryCount',
      minWidth: 100,
      title: '重试次数',
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
      field: 'nextProcessTime',
      width: 140,
      title: '下次处理时间',
      sortable: true,
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
