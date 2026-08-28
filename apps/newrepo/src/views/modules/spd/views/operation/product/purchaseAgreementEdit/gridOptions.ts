/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

import { handlePriceToFixedTwo } from '#/utils/util';

export const columns: CrudColsType = [
  { title: '多选', type: 'checkbox', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 120,
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
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 120,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'manufacturerName',
    minWidth: 120,
    sortable: true,
    title: '厂家',
  },
  {
    field: 'uomName',
    minWidth: 60,
    sortable: true,
    title: '单位',
    align: 'center',
  },
  {
    field: 'productCategoryName',
    minWidth: 120,
    sortable: true,
    title: '商品类别',
  },
  {
    field: 'vendorName',
    minWidth: 120,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'isDefault',
    minWidth: 90,
    sortable: true,
    title: '默认',
    slots: { default: 'activeSwitch' },
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'pricePO',
    minWidth: 90,
    sortable: true,
    title: '采购价',
    formatter: ({ cellValue }: any) => {
      return handlePriceToFixedTwo(cellValue);
    },
    align: 'right',
  },
  {
    field: 'discountRate',
    minWidth: 100,
    sortable: true,
    title: '折扣率',
    editRender: {},
    slots: {
      edit: 'discountRateEdit',
    },
    align: 'right',
  },
  {
    field: 'discountPrice',
    minWidth: 100,
    sortable: true,
    title: '折扣价',
    editRender: {},
    slots: {
      edit: 'discountPriceEdit',
    },
    formatter: ({ cellValue }: any) => {
      return handlePriceToFixedTwo(cellValue);
    },
    align: 'right',
  },
  {
    field: 'guaranteeDaysMin',
    minWidth: 140,
    sortable: true,
    title: '效期预警天数',
    align: 'right',
    editRender: {},
    slots: {
      edit: 'guaranteeDaysMinEdit',
    },
  },
  {
    field: 'contractDateFrom',
    minWidth: 140,
    sortable: true,
    title: '协议开始日期',
    align: 'center',
    // editRender: {},
    editRender: {
      name: 'VxeDatePicker',
    },
    // slots: {
    //   edit: 'contractDateFromEdit',
    // },
  },
  {
    field: 'contractDateTo',
    minWidth: 140,
    sortable: true,
    title: '协议结束日期',
    align: 'center',
    editRender: {
      name: 'VxeDatePicker',
    },
    // editRender: {},
    // slots: {
    //   edit: 'contractDateToEdit',
    // },
  },
  {
    field: 'medicineName',
    minWidth: 120,
    sortable: true,
    title: '通用名',
  },
  {
    field: 'isPurchasePriceUnify',
    minWidth: 120,
    sortable: true,
    title: '是否统一定价',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'priceList',
    minWidth: 90,
    sortable: true,
    title: '零售价',
    align: 'right',
  },
  {
    field: 'markCode',
    minWidth: 110,
    sortable: true,
    title: '中标编码',
  },
  {
    field: 'created',
    minWidth: 110,
    sortable: true,
    title: '创建时间',
  },
  {
    field: 'createdByName',
    minWidth: 110,
    sortable: true,
    title: '创建人',
  },
  {
    field: 'updated',
    minWidth: 110,
    sortable: true,
    title: '更新时间',
  },
  {
    field: 'updatedByName',
    minWidth: 110,
    sortable: true,
    title: '更新人',
  },
];
