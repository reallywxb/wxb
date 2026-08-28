import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'clientCode',
      minWidth: 100,
      title: '客户端编号',
      sortable: true,
    },
    {
      title: '回调地址',
      field: 'webServerRedirectUri',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '客户端密钥',
      field: 'clientSecret',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '授权方式',
      field: 'authorizedGrantTypes',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '作用域',
      field: 'scopes',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '授权资源',
      field: 'resourceIds',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '权限',
      field: 'authorities',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '自动授权作用域',
      field: 'autoApproveScopes',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '令牌有效期(s)',
      field: 'accessTokenValidity',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '更新令牌有效期(s)',
      field: 'refreshTokenValidity',
      minWidth: 110,
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      sortable: true,
      title: '是否有效',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
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
