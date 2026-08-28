import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'msgType_name', width: 140, title: '消息类型', sortable: true },
    {
      field: 'fromSiteId_name',
      minWidth: 100,
      title: '发送站点',
      sortable: true,
    },
    {
      field: 'fromOrgId',
      minWidth: 100,
      title: '发送机构',
      sortable: true,
    },
    { field: 'toOrgId', minWidth: 100, title: '目标机构', sortable: true },
    // {
    //   field: 'openId',
    //   minWidth: 100,
    //   title: '站点用户编码',
    //   sortable: true,
    // },
    {
      field: 'toSiteId_name',
      minWidth: 100,
      title: '路由站点',
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
      field: 'createdBy',
      minWidth: 100,
      title: '创建人',
      sortable: true,
    },

    {
      field: 'createTime',
      width: 140,
      title: '创建时间',
      sortable: true,
    },
    {
      field: 'updatedBy',
      minWidth: 100,
      title: '修改人',
      sortable: true,
    },
    {
      field: 'updateTime',
      width: 140,
      title: '修改时间',
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
