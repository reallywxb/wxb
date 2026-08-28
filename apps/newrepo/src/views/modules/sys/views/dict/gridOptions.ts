import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  { type: 'radio', visible: false },
  { dict: true, field: 'id', title: '字典编码', minWidth: 100, sortable: true },
  { dict: true, field: 'name', title: '名称', minWidth: 100, sortable: true },
  {
    dict: true,
    field: 'isNumber',
    title: '是否数字',
    width: 100,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    sortable: true,
  },
  {
    dict: true,
    field: 'isDynamic',
    title: '动态字典',
    width: 100,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    sortable: true,
  },
  {
    dict: true,
    field: 'isSystem',
    title: '系统字典',
    width: 100,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    sortable: true,
  },
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
    slots: {
      default: 'action',
    },
    fixed: 'right',
    width: 140,
    title: '操作',
  },
];

export const gridOptions: CrudGridOptions<any> = {
  proxyConfig: {
    autoLoad: true,
  },
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  columns,
};

export const subGridOptions: CrudGridOptions<any> = {
  columns: [
    { fixed: 'left', title: '序号', type: 'seq', width: 50 },
    { field: 'orgId_name', title: '机构', minWidth: 100, sortable: true },
    { field: 'code', title: '编码', minWidth: 100, sortable: true },
    { field: 'name', title: '名称', minWidth: 100, sortable: true },
    { field: 'value', title: '字典项值', minWidth: 100, sortable: true },
    { field: 'sort', title: '排序', minWidth: 100, sortable: true },
    { field: 'type', title: '分类', minWidth: 100, sortable: true },
    { field: 'clientCode', title: '客户端', minWidth: 100, sortable: true },
    {
      field: 'isActive',
      title: '是否启用',
      width: 100,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
      sortable: true,
    },
    {
      align: 'center',
      field: 'action',
      slots: {
        default: 'action',
      },
      fixed: 'right',
      width: 140,
      title: '操作',
    },
  ],
};
