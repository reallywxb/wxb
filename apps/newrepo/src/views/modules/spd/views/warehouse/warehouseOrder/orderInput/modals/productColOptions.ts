import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const productColOptions: CrudColsType = [
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 135,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 80,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 100,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'manufacturer',
    minWidth: 120,
    sortable: true,
    title: '厂家',
  },
  {
    field: 'uomName',
    minWidth: 60,
    sortable: true,
    title: '单位',
  },
  // {
  //   field: 'replenishPackageQty',
  //   minWidth: 80,
  //   sortable: true,
  //   title: '定数',
  // },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
  },
  {
    field: 'vendorName',
    minWidth: 180,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'storageQty',
    minWidth: 70,
    sortable: true,
    title: '库存',
  },
  {
    field: 'markCode',
    minWidth: 100,
    sortable: true,
    title: '中标编码',
  },
  // {
  //   field: 'markCode2',
  //   minWidth: 120,
  //   sortable: true,
  //   title: '上级仓库库存',
  // },
  {
    field: 'productStateCode',
    title: '商品本位码',
    width: '100',
    formatter({ row }: any) {
      return row.productStateCode === 'Y' ? '是' : '否';
    },
  },
  { field: 'productControlLevelName', title: '商品组', width: '80' },
  {
    field: 'isBulkPurchase',
    title: '是否4+7',
    formatter({ row }: any) {
      return row.isBulkPurchase === 'Y' ? '是' : '否';
    },
    width: '80',
  },
  { field: 'certificateNo', title: '注册证号', width: '100' },
  { field: 'description', title: '备注', width: '100' },
];
