/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const columns: CrudColsType = [
  { type: 'checkbox', title: '', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  // {
  //   field: 'priorityRuleName',
  //   minWidth: 100,
  //   sortable: true,
  //   title: '优先级',
  //   // slots: { default: 'orderPlanId' },
  //   // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
  // },
  {
    field: 'applyPlanNo',
    minWidth: 120,
    sortable: true,
    title: '申请单号',
    // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
  },
  {
    field: 'dateApplied',
    minWidth: 160,
    sortable: true,
    title: '申请时间',
  },
  {
    field: 'applyPlanMonth',
    minWidth: 100,
    sortable: true,
    title: '计划月份',
  },
  {
    field: 'departmentName',
    minWidth: 150,
    sortable: true,
    title: '院区',
  },
  {
    field: 'warehouseName',
    minWidth: 120,
    sortable: true,
    title: '上级仓库',
  },
  {
    field: 'toWarehouseName',
    minWidth: 150,
    sortable: true,
    title: '申请仓库',
  },
  {
    field: 'productControlLevelName',
    minWidth: 120,
    sortable: true,
    title: '商品组',
    // align: 'right',
  },
  {
    field: 'commitUserName',
    minWidth: 110,
    sortable: true,
    title: '提交人',
  },
  {
    field: 'commitTime',
    minWidth: 160,
    title: '提交时间',
    sortable: true,
  },
  {
    field: 'description',
    minWidth: 150,
    sortable: true,
    title: '备注',
  },
];
