import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { type: 'radio', visible: false },
    { field: 'name', minWidth: 100, title: '站点名称', sortable: true },
    { field: 'siteCode', minWidth: 100, title: '站点编码', sortable: true },
    { field: 'orgId', minWidth: 100, title: '机构', sortable: true },
    { field: 'siteType', minWidth: 100, title: '站点类型', sortable: true },
    { field: 'siteCategory', minWidth: 100, title: '站点类别', sortable: true },
    { field: 'receiveAppId', minWidth: 100, title: '访问账号', sortable: true },
    {
      field: 'receiveAppSecret',
      minWidth: 100,
      title: '访问密钥',
      sortable: true,
    },
    {
      field: 'isPush',
      minWidth: 100,
      title: '是否推送',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'url', minWidth: 100, title: '推送地址', sortable: true },
    { field: 'sendAppId', minWidth: 100, title: '推送账号', sortable: true },
    {
      field: 'sendAppSecret',
      minWidth: 100,
      title: '推送密钥',
      sortable: true,
    },
    {
      field: 'authHost',
      minWidth: 120,
      title: '推送认证域名',
      sortable: true,
    },
    {
      field: 'param1',
      minWidth: 120,
      title: '自定义参数1',
      sortable: true,
    },
    {
      field: 'param2',
      minWidth: 120,
      title: '自定义参数2',
      sortable: true,
    },
    {
      field: 'param3',
      minWidth: 120,
      title: '自定义参数3',
      sortable: true,
    },
    { field: 'namespace', minWidth: 100, title: '命名空间', sortable: true },
    {
      field: 'isActive',
      minWidth: 100,
      title: '是否有效',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'remark', minWidth: 140, title: '备注', sortable: true },
    { field: 'createTime', minWidth: 140, title: '创建时间', sortable: true },
    { field: 'updateTime', minWidth: 140, title: '修改时间', sortable: true },
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

export const useSiteEnterpriseGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'corporationId_name',
      minWidth: 100,
      title: '企业',
      sortable: true,
    },
    {
      field: 'isActive',
      minWidth: 100,
      title: '是否有效',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'siteCorpCode',
      minWidth: 100,
      title: '外部企业编码',
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

export const useSiteOrganizationGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'orgId_name',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },
    {
      field: 'isActive',
      minWidth: 100,
      title: '是否有效',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'siteOrgCode',
      minWidth: 100,
      title: '站点机构编码',
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

export const useSiteWarehouseGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'warehouseId_name',
      minWidth: 100,
      title: '仓库',
      sortable: true,
    },
    {
      field: 'isActive',
      minWidth: 100,
      title: '是否有效',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'siteWarehouseCode',
      minWidth: 100,
      title: '站点仓库编码',
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

export const useSiteUsersGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'code',
      minWidth: 100,
      title: '用户编码',
      sortable: true,
    },
    {
      field: 'openId',
      minWidth: 100,
      title: 'Open ID',
      sortable: true,
    },
    {
      field: 'type',
      minWidth: 100,
      title: '用户类型',
      sortable: true,
    },
    {
      field: 'name',
      minWidth: 100,
      title: '姓名',
      sortable: true,
    },
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
      field: 'deptCode',
      minWidth: 100,
      title: '部门编码',
      sortable: true,
    },
    {
      field: 'mobile',
      minWidth: 100,
      title: '手机',
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
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
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

export const useApplicationGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'orgId',
      minWidth: 100,
      title: '机构',
      sortable: true,
    },
    {
      field: 'name',
      minWidth: 100,
      title: '应用名称',
      sortable: true,
    },
    {
      field: 'appType',
      minWidth: 100,
      title: '应用类型',
      sortable: true,
    },
    {
      field: 'appCode',
      minWidth: 100,
      title: '应用编码',
      sortable: true,
    },
    {
      field: 'receiveSecret',
      minWidth: 100,
      title: '访问密钥',
      sortable: true,
    },
    {
      field: 'isPush',
      minWidth: 100,
      title: '是否推送',
      sortable: true,
    },
    {
      field: 'url',
      minWidth: 100,
      title: '推送地址',
      sortable: true,
    },
    {
      field: 'sendAppId',
      minWidth: 100,
      title: '推送账号',
      sortable: true,
    },
    {
      field: 'sendSecret',
      minWidth: 100,
      title: '推送密钥',
      sortable: true,
    },
    {
      field: 'params',
      minWidth: 100,
      title: '参数',
      sortable: true,
    },

    {
      field: 'isActive',
      minWidth: 100,
      title: '是否有效',
      sortable: true,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
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
