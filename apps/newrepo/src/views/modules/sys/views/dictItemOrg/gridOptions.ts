import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { type: 'checkbox', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50 },
  {
    dict: true,
    field: 'orgId_name',
    title: '机构',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'dictId_name',
    title: '字典',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'dictItemId_name',
    title: '字典项',
    minWidth: 100,
    sortable: true,
  },
  { dict: true, field: 'sort', title: '序号', width: 100, sortable: true },
  {
    dict: true,
    field: 'isActive',
    title: '有效状态',
    width: 100,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    sortable: true,
  },
  {
    align: 'center',
    field: 'action',
    fixed: 'right',
    slots: {
      default: 'action',
    },
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
