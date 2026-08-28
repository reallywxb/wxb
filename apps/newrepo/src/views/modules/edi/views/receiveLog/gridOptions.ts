import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'requestTime', width: 140, title: '调用时间', sortable: true },
    {
      field: 'siteId_name',
      minWidth: 100,
      title: '来源站点',
      sortable: true,
    },
    {
      field: 'requestAddr',
      minWidth: 100,
      title: '调用方地址',
      sortable: true,
    },
    {
      field: 'serviceType',
      width: 130,
      title: '接口类型',
      sortable: true,
    },
    {
      field: 'serviceName',
      minWidth: 100,
      title: '接口名称',
      sortable: true,
    },
    {
      field: 'msgNo',
      minWidth: 100,
      title: '消息编号',
      sortable: true,
    },
    {
      field: 'messageInId',
      minWidth: 100,
      title: '入站消息',
      sortable: true,
    },
    {
      field: 'isSuccess',
      width: 100,
      sortable: true,
      title: '是否成功',
      formatter: ({ cellValue }: any) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'processMsg',
      minWidth: 100,
      title: '错误消息',
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
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
