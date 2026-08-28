/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const columns: CrudColsType = [
  { type: 'checkbox', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'name',
    minWidth: 120,
    sortable: true,
    title: '供应商名称',
  },
  {
    field: 'bpartnerCode',
    minWidth: 120,
    sortable: true,
    title: '供应商编码',
    cellType: 'string',
    // exportMethod: ({ row }: any) => {
    //   console.log(row, row.bpartnerCode);
    //   return `${row.bpartnerCode}-`;
    // },
  },
  {
    field: 'contact',
    minWidth: 120,
    sortable: true,
    title: '联系人',
  },
  {
    field: 'contactPhone',
    minWidth: 120,
    sortable: true,
    title: '联系电话',
  },
  {
    field: 'address',
    minWidth: 120,
    sortable: true,
    title: '供应商地址',
  },
  {
    field: 'bookPeriod',
    minWidth: 100,
    sortable: true,
    title: '账期（月）',
    align: 'right',
  },
  {
    field: 'isApprovedName',
    width: 90,
    sortable: true,
    title: '审核状态',
  },
  {
    field: 'isStopName',
    minWidth: 60,
    sortable: true,
    title: '停用',
    align: 'center',
  },
  {
    field: 'stopUser',
    minWidth: 120,
    sortable: true,
    title: '停启人',
  },
  {
    field: 'stopTime',
    minWidth: 120,
    sortable: true,
    title: '停启时间',
  },
  {
    field: 'stopReason',
    minWidth: 120,
    sortable: true,
    title: '停启原因',
  },
  {
    field: 'value',
    minWidth: 120,
    sortable: true,
    title: '搜索码',
  },
  {
    field: 'refEntID',
    minWidth: 140,
    sortable: true,
    title: '码上放心refEntID',
  },
  {
    field: 'entID',
    minWidth: 120,
    sortable: true,
    title: '码上放心entID',
  },
  {
    field: 'description',
    minWidth: 150,
    sortable: true,
    title: '描述',
  },
];
