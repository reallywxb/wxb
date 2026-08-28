/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const columns: CrudColsType = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'siteContractId',
    minWidth: 100,
    sortable: true,
    title: '协议号',
  },
  {
    field: 'name',
    minWidth: 120,
    sortable: true,
    title: '协议名',
  },
  {
    field: 'contractDate',
    minWidth: 100,
    sortable: true,
    title: '协议时间',
  },
  {
    field: 'validFrom',
    minWidth: 100,
    sortable: true,
    title: '有效起始',
  },
  {
    field: 'validTo',
    minWidth: 100,
    sortable: true,
    title: '有效截止',
  },
  {
    field: 'isActive',
    minWidth: 100,
    sortable: true,
    title: '是否有效',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'createUser',
    minWidth: 100,
    sortable: true,
    title: '登记人',
  },
  {
    field: 'created',
    minWidth: 100,
    sortable: true,
    title: '登记日期',
  },
  {
    field: 'completeUser',
    minWidth: 100,
    sortable: true,
    title: '审核人',
  },
  {
    field: 'completeTime',
    minWidth: 100,
    sortable: true,
    title: '审核日期',
  },
  {
    field: 'docStatusName',
    minWidth: 100,
    sortable: true,
    title: '协议状态',
  },
  {
    field: 'processed',
    minWidth: 100,
    sortable: true,
    title: '处理状态',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'bpartnerName',
    minWidth: 140,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'description1',
    minWidth: 140,
    sortable: true,
    title: '备注',
  },
];
