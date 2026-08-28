/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const columns: CrudColsType = [
  { type: 'checkbox', title: '', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'priorityRuleName',
    minWidth: 100,
    sortable: true,
    title: '优先级',
    // slots: { default: 'orderPlanId' },
    // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
  },
  {
    field: 'orderNo',
    minWidth: 90,
    sortable: true,
    title: '申请单号',
    // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
  },
  {
    field: 'dateOrdered',
    minWidth: 160,
    sortable: true,
    title: '申请时间',
  },
  {
    field: 'deliveryPlanDate',
    minWidth: 160,
    sortable: true,
    title: '要求送达时间',
  },
  {
    field: 'departmentName',
    minWidth: 150,
    sortable: true,
    title: '院区',
  },
  {
    field: 'warehouseName',
    minWidth: 150,
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
    field: 'sourceType',
    minWidth: 100,
    sortable: true,
    title: '自动计划',
    formatter: (scope: any) => {
      return scope.row.sourceType === 'A' ? '是' : '否';
    },
  },
  {
    field: 'productControlLevelName',
    minWidth: 120,
    sortable: true,
    title: '商品组',
    // align: 'right',
  },

  {
    field: 'createdByName',
    minWidth: 90,
    sortable: true,
    title: '创建人',
  },
  {
    field: 'created',
    minWidth: 160,
    title: '创建时间',
    sortable: true,
  },
  {
    field: 'wfNodeName',
    minWidth: 150,
    sortable: true,
    title: '审批节点',
  },
  {
    field: 'description',
    minWidth: 150,
    sortable: true,
    title: '备注',
  },
];
