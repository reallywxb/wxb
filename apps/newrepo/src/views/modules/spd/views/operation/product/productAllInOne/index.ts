import type {
  ExtendedModalApi,
  VbenFormProps,
  VbenFormSchema,
} from '@vben/common-ui';

import { h, ref } from 'vue';
import { useRoute } from 'vue-router';

import { message, Modal } from 'ant-design-vue';
import qs from 'qs';

import {
  activateProduct,
  approveProduct,
  commitProduct,
  deleteProduct,
  queryProductPack,
  queryProductSpec,
  queryProductUnit,
  saveBatchProduct,
  saveProduct,
  saveProductPack,
  saveProductSpec,
  saveProductToBpartner,
  syncCert,
} from '#/views/modules/spd/views/operation/product/api';

// 采购单位选项
const uomNameOptions = ref<Array<{ label: string; value: string }>>([]);

export const specColumns = [
  { type: 'radio', title: '', width: 40, align: 'center', visible: false },
  {
    title: '序号',
    type: 'seq',
    width: 50,
    align: 'center',
    sortable: true,
  },
  {
    field: 'baseUOMQty',
    minWidth: 100,
    title: '基本单位转换比',
    align: 'center',
    sortable: true,
    editRender: { name: 'VxeNumberInput' },
    // slots: { edit: 'edit_baseUOMQty' },
  },
  {
    field: 'productSpec',
    minWidth: 100,
    title: '规格',
    sortable: true,
    editRender: { name: 'VxeInput' },

    // slots: { edit: 'edit_productSpec' },
  },
  {
    field: 'productSpecCode',
    minWidth: 60,
    title: '规格编码',
    sortable: true,
    editRender: { name: 'VxeInput' },
    // slots: { edit: 'edit_productSpecCode' },
  },
  {
    field: 'uomName',
    minWidth: 60,
    title: '单位',
    sortable: true,
    editRender: {},
    slots: { edit: 'edit_uomName' },
    // formatter: ({ row }: any) =>
    //   uomNameOptions.value.find(({ value }) => value === row.uomName)?.label ??
    //   '',
  },
  {
    field: 'uomId',
    visible: false,
  },
  {
    field: 'uomPrecision',
    minWidth: 60,
    title: '单位精度',
    sortable: true,
    editRender: { name: 'VxeNumberInput' },
    // slots: { edit: 'edit_uomPrecision' },
  },
  {
    field: 'isActive',
    minWidth: 60,
    title: '有效',
    sortable: true,
    editRender: {},
    slots: { edit: 'edit_isActive' },
    formatter: ({ row: { isActive } }: any) => {
      return isActive ? (isActive === 'Y' ? '是' : '否') : null;
    },
  },
];

export const packColumns = [
  { type: 'radio', title: '', width: 40, align: 'center', visible: false },
  {
    title: '序号',
    type: 'seq',
    width: 50,
    align: 'center',
    sortable: true,
  },
  {
    field: 'uomUnitPackQty',
    minWidth: 100,
    title: '盒',
    align: 'center',
    sortable: true,
    editRender: { name: 'VxeNumberInput' },
    // slots: { edit: 'edit_baseUOMQty' },
  },
  {
    field: 'baseUomUnitPackQty',
    minWidth: 100,
    title: '个',
    sortable: true,
    editRender: { name: 'VxeNumberInput' },
    // slots: { edit: 'edit_productSpec' },
  },
  {
    field: 'isActive',
    minWidth: 60,
    title: '有效',
    sortable: true,
    editRender: {},
    slots: { edit: 'edit_isActive' },
    formatter: ({ row: { isActive } }: any) => {
      return isActive ? (isActive === 'Y' ? '是' : '否') : null;
    },
  },
  {
    field: 'isDefault',
    minWidth: 60,
    title: '默认',
    sortable: true,
    editRender: {},
    slots: { edit: 'edit_isDefault' },
    formatter: ({ row: { isDefault } }: any) => {
      return isDefault ? (isDefault === 'Y' ? '是' : '否') : null;
    },
  },
];

export const activationFormOptions = {
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '启用',
            value: 'Y',
          },
          {
            label: '停用',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      defaultValue: 'Y',
      fieldName: 'isActive',
      label: '启/停用',
    },
    {
      component: 'Textarea',
      fieldName: 'changeActiveReason',
      label: '启/停原因',
      componentProps: {
        rows: 5,
        placeholder: '请输入',
      },
      rules: 'required',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

export const approveFormOptions = {
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '通过',
            value: 'Y',
          },
          {
            label: '不通过',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      rules: 'required',
      defaultValue: 'Y',
      fieldName: 'isApproved',
      label: '是否通过',
    },
    {
      component: 'Textarea',
      fieldName: 'rejectReason',
      label: '备注',
      componentProps: {
        rows: 5,
        placeholder: '请输入',
      },
      // rules: 'required',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

export const addToDepartmentFormOptions = {
  layout: 'horizontal',
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/customer.do?isDepartment=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,

          mode: 'multiple',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'bpartnerId',
      label: '科室',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

export function genSpecAndPackFormSchemas(hiddenFields: Array<string>) {
  return [
    {
      component: 'Input',
      fieldName: 'productCode',
      label: '药品编码',
      disabled: true,
      // formItemClass: 'col-span-2 col-start-1  pl-[10px] pr-[10px]',
      // labelClass: 'leading-1 mb-[0px] pl-[4px]',
      formItemClass: 'col-span-2',
      labelClass: 'w-[70px]',
      componentProps: {
        placeholder: '',
      },
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品名称',
      disabled: true,
      formItemClass: 'col-span-2',
      labelClass: 'w-[70px]',
      componentProps: {
        placeholder: '',
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturerName',
      label: '生产厂家',
      formItemClass: 'col-span-2',
      labelClass: 'w-[70px]',
      disabled: true,
      componentProps: {
        placeholder: '',
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'modelNo',
    //   label: '型号',
    //   disabled: true,
    //   formItemClass: 'col-span-2',
    //   labelClass: 'w-[70px]',
    //   componentProps: {
    //     placeholder: '',
    //   },
    // },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      disabled: true,
      formItemClass: 'col-span-2',
      labelClass: 'w-[70px]',
      componentProps: {
        placeholder: '',
      },
    },
  ].filter(
    ({ fieldName }) => !hiddenFields.includes(fieldName),
  ) as VbenFormSchema[];
}

export function queryFormOptions(hiddenFields: Array<string>) {
  return [
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品',
      componentProps: {
        maxLength: 50,
        placeholder: '编码/搜索码/名称',
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'modelNo',
    //   label: '型号',
    //   componentProps: {
    //     placeholder: '请输入型号',
    //   },
    // },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      componentProps: {
        placeholder: '请输入规格',
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturerName',
      label: '生产厂家',
      componentProps: {
        placeholder: '请输入生产厂家',
      },
    },
    {
      component: 'Input',
      fieldName: 'certificateNo',
      label: '注册证号',
      componentProps: {
        placeholder: '请输入注册证号',
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/productAction/productTypeList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品分类',
          onChange(val: any, option: any) {
            console.warn('productType', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productType',
      label: '商品分类',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品组',
          onChange(val: any, option: any) {
            console.warn('productControlLevel', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productControlLevel',
      label: '商品组',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择是否启用',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isActive',
      label: '是否启用',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择是否计费',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isFee',
      label: '是否计费',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择是否高值',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isPrecious',
      label: '是否高值',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择是否带量采购',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isBulkPurchase',
      label: '带量采购',
    },
    {
      component: 'Input',
      fieldName: 'markCode',
      label: '省标编码',
      componentProps: {
        placeholder: '请输入省标编码',
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择供应商',
          onChange(val: any, option: any) {
            console.warn('vendorId', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'vendorId',
      label: '供应商',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择默认供应商',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'defaultVendorId',
      label: '默认供应商',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/productAction/productCategoryList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品类别',
          onChange(val: any, option: any) {
            console.warn('productCategory', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productCategory',
      label: '商品类别',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '有' },
            { value: 'N', label: '无' },
          ],
          placeholder: '请选择有无证照',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'hasCert',
      label: '有无证照',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择是否工具',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isSurgicalTool',
      label: '是否工具',
    },
    {
      component: 'Input',
      fieldName: 'upc',
      label: '产品条码',
      componentProps: {
        placeholder: '请输入产品条码',
      },
    },
    {
      component: 'DateGroup',
      fieldName: 'date',
      label: '创建时间',
      // defaultValue: [
      //   dayjs(dayjs().format('YYYY-MM-DD'))
      //     .subtract(7, 'day')
      //     .format('YYYY-MM-DD'),
      // ],
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择计费启用',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'fg_active',
      label: '计费启用',
    },
    // {
    //   component: 'Input',
    //   fieldName: 'standardCode',
    //   label: '贯标编码',
    //   componentProps: {
    //     placeholder: '请输入贯标编码',
    //   },
    // },
  ].filter(
    ({ fieldName }) => !hiddenFields.includes(fieldName),
  ) as VbenFormSchema[];
}

export function genColumns(hiddenFields: string[]) {
  const route = useRoute();

  return [
    { type: 'checkbox', title: '多选', width: 50, align: 'center' },
    { title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'productCode',
      visible: !hiddenFields.includes('productCode'),
      title: '药品编码',
      minWidth: '120',
      // hover: true,
      sortable: true,
    },
    {
      field: 'name',
      visible: !hiddenFields.includes('name'),
      title: '药品名称',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'medicineName',
      visible: !hiddenFields.includes('medicineName'),
      title: '通用名',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'productName',
      visible: !hiddenFields.includes('productName'),
      title: '品牌',
      minWidth: '150',
      sortable: true,
    },
    // {
    //   field: 'modelNo',
    //   visible: false,
    //   // visible: !hiddenFields.includes('modelNo'),
    //   title: '型号',
    //   minWidth: '120',
    //   sortable: true,
    // },
    {
      field: 'productSpec',
      visible: !hiddenFields.includes('productSpec'),
      title: '规格',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'manufacturerName',
      visible: !hiddenFields.includes('manufacturerName'),
      title: '生产厂家',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'value',
      visible: !hiddenFields.includes('value'),
      title: '拼音码',
      minWidth: '80',
      sortable: true,
    },
    {
      field: 'baseUOMName',
      visible: !hiddenFields.includes('baseUOMName'),
      title: '最小单位',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'baseUOMPrecision',
      visible: !hiddenFields.includes('baseUOMPrecision'),
      title: '最小单位精度',
      minWidth: '110',
      align: 'right',
    },
    {
      field: 'uomName',
      visible: !hiddenFields.includes('uomName'),
      title: '采购单位',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'baseUOMQty',
      visible: !hiddenFields.includes('baseUOMQty'),
      title: '采购单位转换比',
      minWidth: '130',
      sortable: true,
      align: 'right',
    },
    {
      field: 'certificateNo',
      visible: !hiddenFields.includes('certificateNo'),
      title: '注册证号',
      minWidth: '150',
      hover: true,
    },
    {
      field: 'certValidTo',
      visible: !hiddenFields.includes('certValidTo'),
      title: '注册证号效期',
      minWidth: '110',
      // render(item) {
      //   if (item.certValidTo && new Date(item) < new Date()) return 'red';
      //   return '';
      // },
    },
    {
      field: 'hasCert',
      visible: !hiddenFields.includes('hasCert'),
      title: '是否有证照',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'upc',
      visible: !hiddenFields.includes('upc'),
      title: '产品条码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'upc1',
      visible: !hiddenFields.includes('upc1'),
      title: '原产品条码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'productStyleName',
      visible: !hiddenFields.includes('productStyleName'),
      title: '剂型',
      minWidth: '70',
    },
    {
      field: 'casNo',
      visible: !hiddenFields.includes('casNo'),
      title: 'CAS号',
      minWidth: '100',
      sortable: true,
    },
    {
      field: 'isActive',
      visible: !hiddenFields.includes('isActive'),
      title: '是否有效',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      // color(value) {
      //   return value == 'N' ? 'red' : '';
      // },
    },
    {
      field: 'isPurchasePriceUnify',
      visible: !hiddenFields.includes('isPurchasePriceUnify'),
      title: '统一定价',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'settlementPriceMode',
      visible: !hiddenFields.includes('settlementPriceMode'),
      title: '后结算价格模式',
      minWidth: '130',
      sortable: true,
    },
    {
      field: 'pricePO',
      visible: !hiddenFields.includes('pricePO'),
      title: '采购价',
      minWidth: '70',
      format: '0.000##',
      sortable: true,
      align: 'right',
    },
    {
      field: 'priceList',
      visible: !hiddenFields.includes('priceList'),
      title: '零售价',
      minWidth: '70',
      format: '0.000##',
      sortable: true,
      align: 'right',
    },
    {
      field: 'defaultVendorName',
      visible: !hiddenFields.includes('defaultVendorName'),
      title: '默认供应商',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'productCategoryName',
      visible: !hiddenFields.includes('productCategoryName'),
      title: '商品类别',
      minWidth: '100',
      sortable: true,
    },
    {
      field: 'productControlLevelName',
      visible: !hiddenFields.includes('productControlLevelName'),
      title: '商品组',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'lpackageQty',
      visible: !hiddenFields.includes('lpackageQty'),
      title: '大包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'mpackageQty',
      visible: !hiddenFields.includes('mpackageQty'),
      title: '中包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'spackageQty',
      visible: !hiddenFields.includes('spackageQty'),
      title: '小包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'isColdStorage',
      visible: !hiddenFields.includes('isColdStorage'),
      title: '需冷藏',
      minWidth: '80',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'storageConditionName',
      visible: !hiddenFields.includes('storageConditionName'),
      title: '存储条件',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'careLevelName',
      visible: !hiddenFields.includes('careLevelName'),
      title: '养护级别',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'isLot',
      visible: !hiddenFields.includes('isLot'),
      title: '批号管理',
      minWidth: '110',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isGuaranteeDateMandatory',
      visible: !hiddenFields.includes('isGuaranteeDateMandatory'),
      title: '有效期必填',
      minWidth: '110',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isProductionDateMandatory',
      visible: !hiddenFields.includes('isProductionDateMandatory'),
      title: '生产日期必填',
      minWidth: '120',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isProductAreaMandatory',
      visible: !hiddenFields.includes('isProductAreaMandatory'),
      title: '产地必填',
      minWidth: '110',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isCertificateNoMandatory',
      visible: !hiddenFields.includes('isCertificateNoMandatory'),
      title: '批准文号必填',
      minWidth: '120',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'guaranteeDaysMin',
      visible: !hiddenFields.includes('guaranteeDaysMin'),
      title: '近效期天数',
      minWidth: '100',
      sortable: true,
      align: 'right',
    },
    {
      field: 'isStoragePackage',
      visible: !hiddenFields.includes('isStoragePackage'),
      title: '包装管理',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isBasePackage',
      visible: !hiddenFields.includes('isBasePackage'),
      title: '是否单包',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isSerNo',
      visible: !hiddenFields.includes('isSerNo'),
      title: '厂家码管理',
      minWidth: '100',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isControlledProduct',
      visible: !hiddenFields.includes('isControlledProduct'),
      title: '双人作业',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      //		}, {
      //			"field" : "sPackageQty",
      //			"title" : "<%小包装数%>",
      //			"minWidth" : "120"
    },
    {
      field: 'productTypeName',
      visible: !hiddenFields.includes('productTypeName'),
      title: '商品分类',
      minWidth: '140',
      sortable: true,
    },
    {
      field: 'productUserCode',
      visible: !hiddenFields.includes('productUserCode'),
      title: '自定义编码',
      minWidth: '120',
      sortable: true,
    },
    // {
    //   field: 'standardCode',
    //   visible: !hiddenFields.includes('standardCode'),
    //   title: '贯标编码',
    //   minWidth: '220',
    //   sortable: true,
    // },
    {
      field: 'productStateCode',
      visible: !hiddenFields.includes('productStateCode'),
      title: '商品本位码',
      minWidth: '100',
    },
    {
      field: 'marketingAuthorizationHolder',
      visible: !hiddenFields.includes('marketingAuthorizationHolder'),
      title: '上市许可持有人',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'essentialDrugTypeName',
      visible: !hiddenFields.includes('essentialDrugTypeName'),
      title: '基药类型',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'isBulkPurchase',
      visible: !hiddenFields.includes('isBulkPurchase'),
      title: '带量采购',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'bulkPurchaseQty',
      visible: !hiddenFields.includes('bulkPurchaseQty'),
      title: '带量报量',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'bulkPurchaseTypeName',
      visible: !hiddenFields.includes('bulkPurchaseTypeName'),
      title: '带量采购类型',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'priceTypeName',
      visible: !hiddenFields.includes('priceTypeName'),
      title: '价格类型',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'isBid',
      visible: !hiddenFields.includes('isBid'),
      title: '是否省标',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'markCode',
      visible: !hiddenFields.includes('markCode'),
      title: '省标编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'isCityBid',
      visible: !hiddenFields.includes('isCityBid'),
      title: '是否市标',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'cityBidCode',
      visible: !hiddenFields.includes('cityBidCode'),
      title: '市标编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'bidsStatusName',
      visible: !hiddenFields.includes('bidsStatusName'),
      title: '招标状态',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'zlTypeName',
      visible: !hiddenFields.includes('zlTypeName'),
      title: '医保分类',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'insurance',
      visible: !hiddenFields.includes('insurance'),
      title: '医保编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'insuranceFeeName',
      visible: !hiddenFields.includes('insuranceFeeName'),
      title: '病案费目',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'serviceToTypeName',
      visible: !hiddenFields.includes('serviceToTypeName'),
      title: '应用对象',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'isPrecious',
      visible: !hiddenFields.includes('isPrecious'),
      title: '是否高值',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isFee',
      visible: !hiddenFields.includes('isFee'),
      title: '是否计价',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'materialBigTypeName',
      visible: !hiddenFields.includes('materialBigTypeName'),
      title: '重点监管分类',
      minWidth: '130',
    },
    {
      field: 'materialLevelName',
      visible: !hiddenFields.includes('materialLevelName'),
      title: '医疗器械分类',
      minWidth: '110',
    },
    {
      field: 'isInterPose',
      visible: !hiddenFields.includes('isInterPose'),
      title: '是否介入',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isImPlanTation',
      visible: !hiddenFields.includes('isImPlanTation'),
      title: '是否植入',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isSurgicalTool',
      visible: !hiddenFields.includes('isSurgicalTool'),
      title: '是否工具',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isNarcotic',
      visible: !hiddenFields.includes('isNarcotic'),
      title: '麻精药品',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isDisinfectant',
      visible: !hiddenFields.includes('isDisinfectant'),
      title: '消毒液',
      minWidth: '80',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isInfusion',
      visible: !hiddenFields.includes('isInfusion'),
      title: '大输液',
      minWidth: '80',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isHighRisk',
      visible: !hiddenFields.includes('isHighRisk'),
      title: '高警示药品',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isReported',
      visible: !hiddenFields.includes('isReported'),
      title: '报告药',
      minWidth: '70',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isTwoVote',
      visible: !hiddenFields.includes('isTwoVote'),
      title: '两票制',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isNew',
      visible: !hiddenFields.includes('isNew'),
      title: '是否新品',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isConfused',
      visible: !hiddenFields.includes('isConfused'),
      title: '易混淆',
      minWidth: '80',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isSpecial',
      visible: !hiddenFields.includes('isSpecial'),
      title: '特殊品种',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isAntitumor',
      visible: !hiddenFields.includes('isAntitumor'),
      title: '抗肿瘤',
      minWidth: '80',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isOnLine',
      visible: !hiddenFields.includes('isOnLine'),
      title: '是否线上',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isShortPo',
      visible: !hiddenFields.includes('isShortPo'),
      title: '是否临采',
      minWidth: '90',
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isMonitor',
      visible: !hiddenFields.includes('isMonitor'),
      title: '监控品种',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isReserve',
      visible: !hiddenFields.includes('isReserve'),
      title: '储备品种',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isInnovate',
      visible: !hiddenFields.includes('isInnovate'),
      title: '是否创新',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'antiDrugTypeName',
      visible: !hiddenFields.includes('antiDrugTypeName'),
      title: '抗菌药物类型',
      minWidth: '120',
    },
    {
      field: 'tracCodepreFix',
      visible: !hiddenFields.includes('tracCodepreFix'),
      title: '追溯码前7位',
      minWidth: '120',
    },
    {
      field: 'tracCodeDivideRate',
      visible: !hiddenFields.includes('tracCodeDivideRate'),
      title: '追溯码乘率',
      minWidth: '120',
    },
    {
      field: 'tracCodeMultiplyRate',
      visible: !hiddenFields.includes('tracCodeMultiplyRate'),
      title: '追溯码除率',
      minWidth: '120',
    },
    {
      field: 'executiveStandardName',
      visible: !hiddenFields.includes('executiveStandardName'),
      title: '中药执行标准',
      minWidth: '110',
    },
    {
      field: 'narcoticTypeName',
      visible: !hiddenFields.includes('narcoticTypeName'),
      title: '麻精分类',
      minWidth: '90',
    },
    {
      field: 'antitumorTypeName',
      visible: !hiddenFields.includes('antitumorTypeName'),
      title: '抗肿瘤分类',
      minWidth: '90',
    },
    {
      field: 'skinTestTypeName',
      visible: !hiddenFields.includes('skinTestTypeName'),
      title: '皮试类型',
      minWidth: '90',
    },
    {
      field: 'description',
      visible: !hiddenFields.includes('description'),
      title: '备注',
      minWidth: '200',
      sortable: true,
    },
    {
      field: 'changeActiveUser',
      visible: !hiddenFields.includes('changeActiveUser'),
      title: '启/停用人',
      minWidth: '90',
    },
    {
      field: 'changeActiveReason',
      visible: !hiddenFields.includes('changeActiveReason'),
      title: '启/停用原因',
      minWidth: '150',
    },
    {
      field: 'changeActiveTime',
      visible: !hiddenFields.includes('changeActiveTime'),
      title: '启/停用时间',
      minWidth: '140',
    },
    {
      field: 'created',
      visible: !hiddenFields.includes('created'),
      title: '创建时间',
      minWidth: '140',
      sortable: true,
    },
    {
      field: 'commitUserName',
      visible:
        route.name !== '商品首营' && !hiddenFields.includes('commitUserName'),
      title: '提交人',
      minWidth: '120',
    },
    {
      field: 'commitTime',
      visible:
        route.name !== '商品首营' && !hiddenFields.includes('commitTime'),
      title: '提交时间',
      minWidth: '120',
    },
    {
      field: 'checkUserName',
      visible:
        route.name !== '商品审批' && !hiddenFields.includes('checkUserName'),
      title: '审批人',
      minWidth: '120',
    },
    {
      field: 'checkTime',
      visible: route.name !== '商品审批' && !hiddenFields.includes('checkTime'),
      title: '审批时间',
      minWidth: '120',
    },
    {
      field: 'rejectReason',
      visible:
        route.name === '商品首营' && !hiddenFields.includes('rejectReason'),
      title: '审批备注',
      minWidth: '120',
    },
    {
      field: 'statusName',
      visible:
        route.name === '商品首营' && !hiddenFields.includes('statusName'),
      title: '审批状态',
      minWidth: '120',
    },
  ];
}

export function genFormOptions(hiddenFields: string[], isBatch = false) {
  const route = useRoute();

  let formSchemas = [
    {
      component: h(
        'div',
        {
          style: {
            fontWeight: 'bold',
          },
        },
        '基本信息',
      ),
      fieldName: '_divider',
      formItemClass: 'col-span-12',
      hideLabel: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入编码前缀',
      },
      fieldName: 'prefix', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '编码前缀',
      hidden: route.meta.urlParams?.isManualCode !== 'Y' || !isBatch,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品编码',
      },
      fieldName: 'productCode', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '药品编码',
      rules: 'required',
      hidden: isBatch && route.meta.urlParams?.isManualCode === 'Y',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品名称',
      },
      fieldName: 'name', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '药品名称',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入通用名',
      },
      fieldName: 'medicineName', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '通用名',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入药品名称',
    //   },
    //   fieldName: 'priorityTypeName', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '药品名称',
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入品牌',
      },
      fieldName: 'productName', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '品牌',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入型号',
    //   },
    //   fieldName: 'modelNo', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '型号',
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入规格',
      },
      fieldName: 'productSpec', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '规格',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000391',
          // showSearch: true,
          placeholder: '请选择',
          paginate: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          paramsMap: {
            value: 'value',
          },
          allowClear: true,
          showChooseAll: false,
          showSearch: true,
          filterByFrontEnd: false,
          // onChange(val: any, option: any) {
          //   console.log('onChange', val, option);
          // },
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'manufacturerId', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '生产厂家',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入拼音码',
      },
      fieldName: 'value', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '拼音码',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入计费编码',
      },
      fieldName: 'value2', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '计费编码',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=114',
          // showSearch: true,
          placeholder: '请选择',
          paginate: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          paramsMap: {
            value: 'value',
          },
          allowClear: true,
          showSearch: true,
          filterByFrontEnd: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'baseUOMId', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '最小单位',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入最小单位精度',
      },
      fieldName: 'baseUOMPrecision', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '最小单位精度',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=114',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'uomId', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '采购单位',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购单位转换比',
      },
      fieldName: 'baseUOMQty', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[120px] ',
      label: '采购单位转换比',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购单位精度',
      },
      fieldName: 'uomPrecision', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '采购单位精度',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入注册证号',
      },
      fieldName: 'certificateNo', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '注册证号',
    },

    {
      component: 'DatePicker',
      // componentProps: {
      //   valueFormat: 'YYYY-MM-DD',
      //   allowClear: true,
      //   placeholder: '请选择注册证效期',
      // },
      componentProps: () => {
        return {
          valueFormat: 'YYYY-MM-DD',
          allowClear: true,
          placeholder: '请选择注册证效期',
          getPopupContainer: (triggerNode: any) =>
            triggerNode?.closest('form') ?? document.body,
        };
      },

      fieldName: 'certValidTo', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '注册证效期',
    },
    {
      component: 'Switch',
      fieldName: 'isCertValidTo', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      defaultValue: 'N',
      label: '注册证效期检验',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000183',
          // showSearch: true,
          placeholder: '请选择',
          showChooseAll: false,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productStyle', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '剂型',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'marketingAuthorizationHolder', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '上市许可持有人',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入产品条码',
      },
      fieldName: 'upc', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '产品条码',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入原产品条码',
      },
      fieldName: 'upc1', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '原产品条码',
    },
    {
      component: 'DateGroup',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
      },
      fieldName: 'contractDate', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '合同日期',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'casNo', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: 'CAS号',
    },
    {
      component: h(
        'div',
        {
          style: {
            fontWeight: 'bold',
          },
        },
        '商品设置',
      ),
      fieldName: '_divider',
      formItemClass: 'col-span-12',
      hideLabel: true,
    },
    {
      component: 'Switch',
      fieldName: 'isPurchasePriceUnify', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      label: '统一定价',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Product.SettlementPriceMode',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'settlementPriceMode', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '后结算价格模式',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购价格',
      },
      fieldName: 'pricePO', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '采购价格',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入零售价',
      },
      fieldName: 'priceList', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '零售价',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/productAction/productCategoryList.do',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productCategoryId', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品类别',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: 'baseHandleAction/refList.do?id=1000244',
          // showSearch: true,
          placeholder: '请选择商品组',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productControlLevel', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品组',
      rules: isBatch ? '' : 'required',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入原产品条码',
    //   },
    //   fieldName: 'productControlLevel', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '商品组',
    // },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'lpackageQty', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '大包装数',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'mpackageQty', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '中包装数',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'spackageQty', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '小包装数',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000004',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'storageCondition', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '存储条件',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000587',
          // showSearch: true,
          placeholder: '请选择',
          showChooseAll: false,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'careLevel', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '养护级别',
    },
    {
      fieldName: 'isColdStorage', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      label: '需冷藏',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isLot', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '批号管理',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isGuaranteeDateMandatory', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '有效期必填',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isProductionDateMandatory', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '生产日期必填',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入近效期天数',
      },
      fieldName: 'guaranteeDaysMin', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '近效期天数',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isProductAreaMandatory', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '产地必填',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isCertificateNoMandatory', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '批准文号必填',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          // checkedValue: 'Y',
          // unCheckedValue: 'N',
          // checkedChildren: '是',
          // unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isStoragePackage', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '包装管理',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          // checkedValue: 'Y',
          // unCheckedValue: 'N',
          // checkedChildren: '是',
          // unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isBasePackage', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否单包',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isSerNo', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '厂家码管理',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isControlledProduct', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '双人作业',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isAloneCharge', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '单独收费',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isDedicated', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '专机专用',
    },
    {
      component: h(
        'div',
        {
          style: {
            fontWeight: 'bold',
          },
        },
        '扩展信息',
      ),
      fieldName: '_divider',
      formItemClass: 'col-span-12',
      hideLabel: true,
    },

    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/productAction/productTypeList.do',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品分类',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'productUserCode', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '自定义编码',
    },
    // TODO:medicine cancel 贯标码
    // {
    //   component: 'Input',
    //   componentProps: {
    //     maxLength: 30,
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'standardCode', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '贯标编码',
    // },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'productStateCode', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品本位码',
    },
    {
      component: 'Switch',
      fieldName: 'isTwoVote', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      label: '两票制药品',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000491',
          // showSearch: true,
          placeholder: '请选择',
          showChooseAll: false,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'essentialDrugType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '基药类型',
    },
    // {
    //   component: 'ChcSelect',
    //   componentProps: () => {
    //     return {
    //       dictUrl: '/baseHandleAction/refList.do?id=114',
    //       // showSearch: true,
    //       placeholder: '请选择',
    //       paginate: false,
    //       immediate: true,
    //       labelField: 'name',
    //       valueField: 'id',
    //       afterFetch(res: any) {
    //         return { ...res, rows: undefined, records: res.rows };
    //       },
    //     };
    //   },
    //   fieldName: 'uomId', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '采购单位',
    // },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'bidsStatus', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '招标状态',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000629',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'bidsStatus', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '招标状态',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isBulkPurchase', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '带量采购',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'bulkPurchaseQty', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '带量报量',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000563',
          // showSearch: true,
          placeholder: '请选择',
          showChooseAll: false,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'bulkPurchaseType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '带量采购类型',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000524',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'priceType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '价格类型',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'priceType', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '价格类型',
    // },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isBid', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否省标',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'markCode', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '省标编码',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isCityBid', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否市标',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'cityBidCode', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '市标编码',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isOnLine', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否线上',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isShortPo', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否临采',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: '"', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '医保分类',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000426',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'zlType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '医保分类',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 50,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'insurance', // 医保编码
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '医保编码',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'insuranceFee', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '病案费目',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000581',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'insuranceFee', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '病案费目',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'serviceToType', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '应用对象',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000575',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'serviceToType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '应用对象',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000549',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'materialBigType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '重点监管分类',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000548',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'materialLevel', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '医疗器械分类',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isPrecious', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '高值',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isFee', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否计价',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isForeign', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否进口',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'insurancePaymentType', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '医保支付类别',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000630',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'insurancePaymentType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '医保支付类别',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isImPlanTation', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否植入',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isInterPose', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否介入',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000520',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'executiveStandard', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '中药执行标准',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000570',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'skinTestType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '皮试类型',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isInfusion', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '大输液',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000492',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'antiDrugType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '抗菌药物分类',
    },

    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isNarcotic', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '麻精药品',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000568',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          allowClear: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'narcoticType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '麻精分类',
    },

    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isAntitumor', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '抗肿瘤',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000569',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          allowClear: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'antitumorType', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '抗肿瘤分类',
    },

    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isDisinfectant', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '消毒液',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isSpecial', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '特殊品种',
    },

    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isHighRisk', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '高警示药品',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isReported', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '报告药',
    },

    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isNew', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否新品',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isConfused', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '易混淆',
    },

    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isInnovate', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否创新',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isMonitor', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '监控品种',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isReserve', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '储备品种',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isNesis', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否缝线',
    },
    {
      component: 'Switch',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      fieldName: 'isSurgicalTool', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否工具',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入追溯码前7位',
      },
      fieldName: 'tracCodePreFix', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '追溯码前7位',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入追溯码乘率',
      },
      fieldName: 'tracCodeMultiplyRate', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '追溯码乘率',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入追溯码除率',
      },
      fieldName: 'tracCodeDivideRate', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '追溯码除率',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入备注',
      },
      fieldName: 'description', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '备注',
    },
  ];
  if (route.name === 'spd.web.basicData.product.hc.manage' && isBatch) {
    // 商品维护（耗材）并且是批量修改
    formSchemas = formSchemas.map((item) => {
      // Switch改查ChcSelect
      if (item.component === 'Switch') {
        return {
          ...item,
          component: 'ChcSelect',
          componentProps: () => {
            return {
              placeholder: '请选择',
              allowClear: true,
              paginate: false,
              immediate: false,
              options: [
                {
                  label: '是',
                  value: 'Y',
                },
                {
                  label: '否',
                  value: 'N',
                },
              ],
            };
          },
        };
      }
      return item;
    });
  }

  // 耗材先展示隐藏计费信息
  // const extraSchemas = [
  //   {
  //     component: h(
  //       'div',
  //       {
  //         style: {
  //           fontWeight: 'bold',
  //         },
  //       },
  //       '计费信息',
  //     ),
  //     fieldName: '_divider',
  //     formItemClass: 'col-span-12',
  //     hideLabel: true,
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl:
  //           '/baseHandleAction/refList.do?id=M_Product_Item.Code_acc_share',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'code_acc_share', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[120px] ',
  //     label: '共用核算体系编码',
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl: '/baseHandleAction/refList.do?id=M_Product_Item.Code_inc_ip',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'code_inc_ip', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '住院账单项编码',
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl: '/baseHandleAction/refList.do?id=M_Product_Item.Code_inc_op',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'code_inc_op', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '门诊账单项编码',
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl: '/baseHandleAction/refList.do?id=M_Product_Item.Code_srvca',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'code_srvca', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '服务分类编码',
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl: '/baseHandleAction/refList.do?id=M_Product_Item.Sd_pritp',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'sd_pritp', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '收费分类编码',
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl: '/baseHandleAction/refList.do?id=M_Product_Item.Sd_srvtp',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'sd_srvtp', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '服务类型编码',
  //   },
  //   {
  //     component: 'ChcSelect',
  //     componentProps: () => {
  //       return {
  //         dictUrl: '/baseHandleAction/refList.do?id=M_Product_Item.Code_unit',
  //         // showSearch: true,
  //         placeholder: '请选择',
  //         paginate: false,
  //         immediate: true,
  //         allowClear: true,
  //         labelField: 'name',
  //         valueField: 'id',
  //         afterFetch(res: any) {
  //           return { ...res, rows: undefined, records: res.rows };
  //         },
  //       };
  //     },
  //     fieldName: 'code_unit', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '计量单位编码',
  //   },
  //   {
  //     component: 'Input',
  //     componentProps: {
  //       maxLength: 20,
  //       allowClear: true,
  //       placeholder: '请输入',
  //     },
  //     fieldName: 'insurancePaymentRate', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '医保自付比例',
  //   },
  //   {
  //     component: 'Input',
  //     componentProps: {
  //       maxLength: 20,
  //       allowClear: true,
  //       placeholder: '请输入',
  //     },
  //     fieldName: 'maxFee', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     label: '医保上限',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_active', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '启用标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_active_bl', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '费用启用标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_er', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '急诊流水标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_er1', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '急诊留观标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_er2', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '急诊抢救标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_fm', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '家庭标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_ip', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '住院标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_op', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '门诊标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_pe', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '体检标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_use_pip', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '预住院标志',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_or', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '医嘱标识',
  //   },
  //   {
  //     component: 'Switch',
  //     fieldName: 'fg_nur', // 药品名称
  //     formItemClass: 'col-span-6 ',
  //     labelClass: ' w-[105px] ',
  //     componentProps: () => {
  //       return {
  //         checkedValue: 'Y',
  //         unCheckedValue: 'N',
  //         checkedChildren: '是',
  //         unCheckedChildren: '否',
  //         style: {
  //           width: '40px',
  //         },
  //       };
  //     },
  //     label: '护嘱标识',
  //   },
  // ];
  const extraSchemas: any[] = [];
  const formOptions: VbenFormProps = {
    layout: 'horizonal',
    schema: [
      // route.meta.urlParams?.isManualCode !== Y 时展示编码前缀 prefix
      ...formSchemas.filter(({ hidden }) => !hidden),
      ...(route.meta.urlParams?.type === 'hc' && !isBatch ? extraSchemas : []),
    ].filter(({ fieldName }) => !hiddenFields.includes(fieldName)),
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
  };

  return formOptions;
}

const formDefaultValue = {
  baseUOMPrecision: '0',
  uomPrecision: '2',
  essentialDrugType: '0',
  isForeign: 'N',
  isStop: 'N',
  isActive: 'Y',
  isSelfPaying: 'N',
  isPrecious: 'N',
  isControlledProduct: 'N',
  isStoragePackage: 'N',
  isSerNo: 'N',
  isDisinfectant: 'N',
  isInfusion: 'N',
  isHighRisk: 'N',
  isReported: 'N',
  isTwoVote: 'N',
  isNarcotic: 'N',
  isBulkPurchase: 'N',
  isFee: 'N',
  isNew: 'N',
  isConfused: 'N',
  isMonitor: 'N',
  isReserve: 'N',
  isSpecial: 'N',
  isAntitumor: 'N',
  isBid: 'N',
  isShortPo: 'N',
  isOnLine: 'N',
  isPurchasePriceUnify: 'Y',
  isColdStorage: 'N',
  isLot: 'Y',
  isGuaranteeDateMandatory: 'Y',
  isNesis: 'N',
  isSurgicalTool: 'N',
  isImPlanTation: 'N',
  isInterPose: 'N',
  isAloneCharge: 'N',
  isDedicated: 'N',

  fg_active: 'Y',
  fg_active_bl: 'Y',
  fg_use_er: 'Y',
  fg_use_er1: 'Y',
  fg_use_er2: 'Y',
  fg_use_fm: 'Y',
  fg_use_ip: 'Y',
  fg_use_op: 'Y',
  fg_use_pe: 'Y',
  fg_use_pip: 'Y',
  isInnovate: 'N',
};

export function useProductYP({
  modificationModalRef,
  approveFromModalApi,
  parentGridApi,
}: any) {
  const route = useRoute();
  function handleAdd() {
    modificationModalRef.value?.modalApi
      .setData({
        title: '添加',
        form: {
          ...formDefaultValue,
        },
        submit(params: any) {
          return saveProduct(params, { page: route.meta.urlParams?.page });
        },
      })
      .open();
  }

  function handleEdit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }
    if (selectedRows.length > 1) {
      message.error('只能选择一条记录修改！');
      return;
    }

    const [{ productId, ...form }] = selectedRows;

    modificationModalRef.value?.modalApi
      .setData({
        title: '修改',
        form,
        submit(params: any) {
          return saveProduct(
            {
              productId,
              ...params,
            },
            { page: route.meta.urlParams?.page },
          );
        },
      })
      .open();
  }

  function handleCommit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: '确认提交？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await commitProduct({
            ids: JSON.stringify(
              selectedRows.map(({ productId }: any) => productId),
            ),
          });

          message.success('提交成功');

          parentGridApi.query();
        } catch {
          message.error('提交失败');
        }
      },
    });
  }

  function handleDel() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: '确认删除？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteProduct(
            qs.stringify(
              {
                productId: selectedRows.map(({ productId }: any) => productId),
              },
              { arrayFormat: 'repeat' },
            ),
          );

          message.success('删除成功');

          parentGridApi.query();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }
  // 新增审批弹框
  function handleApprove() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }
    approveFromModalApi
      .setData({
        title: '审批',
        form: {
          isApproved: 'Y',
          rejectReason: '',
        },
        submit(params: any) {
          // 获取选中的商品id
          const newParams = {
            ids: JSON.stringify(
              selectedRows.map(({ productId }: any) => productId),
            ),
            ...params,
          };
          console.warn(newParams);
          return approveProduct(newParams);
        },
      })
      .open();
  }
  return {
    handleAdd,
    handleEdit,
    handleCommit,
    handleDel,
    handleApprove,
  };
}

export function useProductHC({
  addToDepartmentModalApi,
  activationModalApi,
  productSpecModalApi,
  productPackModalApi,
  parentGridApi,
  modificationModalRef,
  batchModificationModalRef,
}: any) {
  const route = useRoute();

  function handleAdd() {
    modificationModalRef.value?.modalApi
      .setData({
        title: '添加',
        form: {
          baseUOMPrecision: '0',
          uomPrecision: '2',
          essentialDrugType: '0',
          isForeign: 'N',
          isStop: 'N',
          isActive: 'Y',
          isSelfPaying: 'N',
          isPrecious: 'N',
          isControlledProduct: 'N',
          isStoragePackage: 'N',
          isSerNo: 'N',
          isDisinfectant: 'N',
          isInfusion: 'N',
          isHighRisk: 'N',
          isReported: 'N',
          isTwoVote: 'N',
          isNarcotic: 'N',
          isBulkPurchase: 'N',
          isFee: 'N',
          isNew: 'N',
          isConfused: 'N',
          isMonitor: 'N',
          isReserve: 'N',
          isSpecial: 'N',
          isAntitumor: 'N',
          isBid: 'N',
          isShortPo: 'N',
          isOnLine: 'N',
          isPurchasePriceUnify: 'Y',
          isColdStorage: 'N',
          isLot: 'Y',
          isGuaranteeDateMandatory: 'Y',
          isNesis: 'N',
          isSurgicalTool: 'N',
          isImPlanTation: 'N',
          isInterPose: 'N',
          isAloneCharge: 'N',
          isDedicated: 'N',

          fg_active: 'Y',
          fg_active_bl: 'Y',
          fg_use_er: 'Y',
          fg_use_er1: 'Y',
          fg_use_er2: 'Y',
          fg_use_fm: 'Y',
          fg_use_ip: 'Y',
          fg_use_op: 'Y',
          fg_use_pe: 'Y',
          fg_use_pip: 'Y',
          isInnovate: 'N',
        },
        
        submit(params) {
          if (params.isStoragePackage === 'Y' && params.isBasePackage !== 'Y' && (!params.lpackageQty || params.lpackageQty === '0')) {
            return {
              msg: '请添加大包装数',
            };
          }
          return saveProduct(params, { page: route.meta.urlParams?.page });
        },
      })
      .open();
  }

  function handleEdit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }
    // console.warn('selectedRows===>ppf', selectedRows[0]);
    const [{ productId, versionStamp, isActive, ...form }] = selectedRows;
    modificationModalRef.value?.modalApi
      .setData({
        title: '修改',
        form,
        submit(params: any) {
          console.warn('入参====>', { productId, versionStamp, ...params });
          
          if (params.isStoragePackage === 'Y' && params.isBasePackage !== 'Y' && (!params.lpackageQty || params.lpackageQty === '0')) {
            return {
              msg: '请添加大包装数',
            };
          }
         
          return saveProduct(
            {
              productId,
              versionStamp,
              isActive,
              ...params,
            },
            { page: route.meta.urlParams?.page },
          );
        },
      })
      .open();
  }

  function handleBatchEdit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    batchModificationModalRef.value?.modalApi
      .setData({
        title: '批量修改',
        submit(params: any) {
          console.warn('入参====>', params);

          if (params.isStoragePackage === 'Y' && params.isBasePackage !== 'Y' && (!params.lpackageQty || params.lpackageQty === '0')) {
            return {
              msg: '请添加大包装数',
            };
          }
          return new Promise((resolve, reject) => {
            Modal.confirm({
              title: '提示',
              content: `确认批量修改${selectedRows.length}条商品吗？`,
              onOk: async () => {
                try {
                  const res = await saveBatchProduct({
                    ...params,
                    productIds: JSON.stringify(
                      selectedRows.map(({ productId }) => productId),
                    ),
                  });
                  resolve(res);
                } catch {
                  reject(new Error('请求失败'));
                }
              },
              onCancel: () => {
                reject(new Error('用户取消'));
              },
            });
          });
        },
      })
      .open();
  }

  function handleCopy() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ productId, productCode, ...form }] = selectedRows;

    modificationModalRef.value?.modalApi
      .setData({
        title: '复制',
        form,
        submit(params: any) {
          if (params.isStoragePackage === 'Y' && params.isBasePackage !== 'Y' && (!params.lpackageQty || params.lpackageQty === '0')) {
            return {
              msg: '请添加大包装数',
            };
          }
          return saveProduct(
            {
              ...params,
            },
            { page: route.meta.urlParams?.page },
          );
        },
      })
      .open();
  }

  function handleActivation() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    activationModalApi
      .setData({
        title: '启用或停用商品',
        submit(params: any) {
          return activateProduct(
            qs.stringify(
              {
                ...params,
                productId: selectedRows.map(({ productId }) => productId),
              },
              { arrayFormat: 'repeat' },
            ),
          );
        },
      })
      .open();
  }

  function handleSpec() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }
    if (selectedRows.length > 1) {
      message.error('只能选择一条记录维护规格');
      return;
    }
    const [{ productId }] = selectedRows;
    queryProductSpec({
      productId,
      limit: 0,
    }).then(({ rows }) => {
      productSpecModalApi
        .setData({
          title: '商品规格',
          schema: selectedRows[0],
          rows,
          submit({ rows, removed }: any) {
            return saveProductSpec({
              productId,
              lineData: JSON.stringify({
                created: rows.filter(({ productSpecId }) => !productSpecId),
                updated: rows.filter(({ productSpecId }) => productSpecId),
                removed,
              }),
            });
          },
        })
        .open();
    });
  }

  function handlePack() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }
    if (selectedRows.length > 1) {
      message.error('只能选择一条记录维护定数');
      return;
    }
    const [{ productId }] = selectedRows;

    queryProductPack({
      productId,
      limit: 0,
    }).then(({ rows }) => {
      productPackModalApi
        .setData({
          title: '商品定数',
          rows,
          schema: selectedRows[0],
          submit({ rows, removed }: any) {
            return saveProductPack({
              productId,
              lineData: JSON.stringify({
                created: rows.filter(({ productPackId }) => !productPackId),
                updated: rows.filter(({ productPackId }) => productPackId),
                removed,
              }),
            });
          },
        })
        .open();
    });
  }

  function handleSyncCert() {
    Modal.confirm({
      title: '提示',
      content: '确认同步证照信息吗？',
      onOk: async () => {
        try {
          await syncCert({ success: true });
          parentGridApi.query();
          message.success('操作成功');
        } catch {
          message.success('操作失败');
        }
      },
    });
  }

  function addDepartment() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    addToDepartmentModalApi
      .setData({
        title: '添加商品到科室',
        submit({ bpartnerId }: any) {
          return saveProductToBpartner({
            bpartnerId: bpartnerId.join(','),
            productIds: JSON.stringify(
              selectedRows.map(({ productId }) => productId),
            ),
          });
        },
      })
      .open();
  }

  function onUomIdChange(id: string, scope: any) {
    scope.row.uomName =
      uomNameOptions.value.find(({ value }) => value === id)?.label ?? '';
  }

  queryProductUnit().then(({ rows }) => {
    uomNameOptions.value = rows?.map(({ id: value, name: label }) => ({
      label,
      value,
    }));
  });
  function handleIsStoragePackageChange(
    checked: 'N' | 'Y' | undefined,
    action?: string,
  ) {
    if (action === 'batch') {
      batchModificationModalRef.value?.formApi.setFieldValue('isStoragePackage', checked);
      // 批量修改不做联动逻辑
      return;
    }

    if ((checked === 'N' || !checked) && !action) {
      // 关闭包装管理，需要同步将是否单包关闭
      modificationModalRef.value?.formApi.setFieldValue('isBasePackage', 'N');
    } else {
      // 关闭包装管理，需要同步将是否单包关闭(批量修改)
      batchModificationModalRef.value?.formApi.setFieldValue(
        'isBasePackage',
        'N',
      );
    }
  }
  function handleIsBasePackageChange(
    checked: 'N' | 'Y' | undefined,
    action?: string,
  ) {
    if (action === 'batch') {
      
      batchModificationModalRef.value?.formApi.setFieldValue('isBasePackage', checked);
      // 批量修改不做联动逻辑
      return;
    }

    if (checked === 'Y' && !action) {
      // 开启单包 自动将包装管理开启
      modificationModalRef.value?.formApi.setFieldValue(
        'isStoragePackage',
        'Y',
      );
    } else {
      // 开启单包 自动将包装管理开启(批量修改)
      batchModificationModalRef.value?.formApi.setFieldValue(
        'isStoragePackage',
        'Y',
      );
    }
  }
  return {
    handleAdd,
    handleEdit,
    handleBatchEdit,
    handleCopy,
    handleSpec,
    handlePack,
    uomNameOptions,
    onUomIdChange,
    handleActivation,
    handleSyncCert,
    addDepartment,
    handleIsStoragePackageChange,
    handleIsBasePackageChange,
  };
}

export function useImportModal() {
  // 药品导入组件 ref
  const drugImportModalRef = ref<ExtendedModalApi | undefined>();
  const specImportModalRef = ref<ExtendedModalApi | undefined>();
  const allocationImportModalRef = ref<ExtendedModalApi | undefined>();

  // 药品导入组件 form-options
  const importSchemas = [
    {
      component: 'Switch',
      fieldName: 'isOverWrite', // 药品名称
      labelClass: ' w-[150px] ',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      defaultValue: 'N',
      label: '是否覆盖已有商品',
    },
    {
      component: 'Switch',
      fieldName: 'isCreateDict', // 药品名称
      labelClass: ' w-[150px] ',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      defaultValue: 'N',
      label: '是否自动创建字典',
    },
    {
      component: 'ChcSelect',
      labelClass: ' w-[150px] ',
      controlClass: 'w-full',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/listProductServers.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'serverId',
      label: '商品站点',
      rules: 'required',
    },
  ];

  const ypTemplateURL = new URL(
    '#/assets/excels/product-yp.xls',
    import.meta.url,
  ).toString();
  const hcTemplateURL = new URL(
    '#/assets/excels/product-hc.xls',
    import.meta.url,
  ).toString();

  const specTemplateURL = new URL(
    '#/assets/excels/initialproductspec.xls',
    import.meta.url,
  ).toString();

  const allocationTemplateURL = new URL(
    '#/assets/excels/productPackLocator.xls',
    import.meta.url,
  ).toString();

  return {
    drugImportModalRef,
    specImportModalRef,
    allocationImportModalRef,
    importSchemas,
    ypTemplateURL,
    hcTemplateURL,
    specTemplateURL,
    allocationTemplateURL,
  };
}
