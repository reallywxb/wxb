import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  { dict: true, field: 'orgId', title: '机构', minWidth: 100, sortable: true },
  { dict: true, field: 'userId', title: '用户', minWidth: 100, sortable: true },
  {
    dict: true,
    field: 'messageOrgId',
    title: '消息机构',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'messageType',
    title: '消息类型',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'isActive',
    title: '是否有效',
    width: 100,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    sortable: true,
  },
  {
    dict: true,
    field: 'createTime',
    title: '创建时间',
    minWidth: 100,
    sortable: true,
  },
  {
    align: 'center',
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    width: 140,
    title: '操作',
  },
];

export const gridOptions: CrudGridOptions<deptDto> = {
  proxyConfig: {
    autoLoad: true,
  },
  columns,
};
