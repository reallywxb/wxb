/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

import { handlePriceToFixedTwo } from '#/utils/util';

export const columns: CrudColsType = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 100,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 120,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'medicineName',
    minWidth: 120,
    sortable: true,
    title: '通用名',
  },
  {
    field: 'productSpec',
    minWidth: 120,
    sortable: true,
    title: '规格',
  },
  {
    field: 'manufacturerName',
    minWidth: 120,
    sortable: true,
    title: '厂家',
  },
  {
    field: 'uomName',
    minWidth: 40,
    sortable: true,
    title: '单位',
    align: 'center',
  },
  {
    field: 'priceList',
    minWidth: 80,
    sortable: true,
    title: '零售价',
    formatter: ({ cellValue }: any) => {
      return handlePriceToFixedTwo(cellValue);
    },
    align: 'right',
  },
  {
    field: 'pricePO',
    minWidth: 80,
    sortable: true,
    title: '采购价',
    formatter: ({ cellValue }: any) => {
      return handlePriceToFixedTwo(cellValue);
    },
    align: 'right',
  },
];
