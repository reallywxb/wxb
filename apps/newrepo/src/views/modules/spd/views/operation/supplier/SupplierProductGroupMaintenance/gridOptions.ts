/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const columns: CrudColsType = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'name',
    minWidth: 240,
    sortable: true,
    title: '供应商名称',
  },
  {
    field: 'bpartnerCode',
    minWidth: 120,
    sortable: true,
    title: '供应商编码',
  },
  {
    field: 'description',
    minWidth: 240,
    sortable: true,
    title: '描述',
  },
];
