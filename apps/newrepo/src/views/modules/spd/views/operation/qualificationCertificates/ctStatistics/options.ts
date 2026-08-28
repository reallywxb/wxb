import type { GridColumn } from '@vben/chc-ui';

export const gridColumns: GridColumn[] = [
  // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 120,
    sortable: false,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 120,
    sortable: false,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: false,
    title: '规格',
  },
  {
    field: 'manufacturer',
    minWidth: 90,
    sortable: true,
    title: '厂家',
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'vendorName',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'spzz',
    minWidth: 120,
    sortable: true,
    title: '商品证照数',
    align: 'right',
  },
  {
    field: 'spsqs',
    minWidth: 120,
    sortable: true,
    title: '商品授权数',
    align: 'right',
  },
  {
    field: 'qyzz',
    minWidth: 120,
    sortable: true,
    title: '企业证照数',
    align: 'right',
  },
  {
    field: 'gyszz',
    minWidth: 120,
    sortable: true,
    title: '供应商证照数',
    align: 'right',
  },
];
