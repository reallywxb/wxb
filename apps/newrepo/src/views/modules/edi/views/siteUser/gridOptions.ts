import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { type: 'radio', visible: false },
    { field: 'siteId_name', minWidth: 100, title: '站点', sortable: true },
    { field: 'orgId', minWidth: 100, title: '机构', sortable: true },
    { field: 'openId', minWidth: 100, title: 'Open ID', sortable: true },
    { field: 'code', minWidth: 100, title: '用户编码', sortable: true },
    { field: 'type', minWidth: 100, title: '用户类型', sortable: true },
    { field: 'name', minWidth: 100, title: '姓名', sortable: true },
    {
      field: 'nickName',
      minWidth: 100,
      title: '昵称',
      sortable: true,
    },
    {
      field: 'sex',
      minWidth: 100,
      title: '性别',
      sortable: true,
    },
    {
      field: 'country',
      minWidth: 100,
      title: '国家',
      sortable: true,
    },
    {
      field: 'province',
      minWidth: 100,
      title: '省',
      sortable: true,
    },
    {
      field: 'city',
      minWidth: 100,
      title: '城市',
      sortable: true,
    },
    {
      field: 'headImgUrl',
      minWidth: 120,
      title: '头像图片地址',
      sortable: true,
    },
    {
      field: 'language',
      minWidth: 100,
      title: '语言',
      sortable: true,
    },
    { field: 'remark', minWidth: 140, title: '备注', sortable: true },
    { field: 'createTime', minWidth: 140, title: '创建时间', sortable: true },
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

export const useSubGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'orgId_name',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },
    {
      field: 'userId',
      minWidth: 100,
      title: '系统用户',
      sortable: true,
    },
    {
      field: 'userType',
      minWidth: 100,
      title: '用户类型',
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
