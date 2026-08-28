import type { VxeGridPropTypes } from 'vxe-table';

import type { VbenFormSchema } from '@vben/common-ui';

import { ref } from 'vue';

/**
 * 生成查询表单配置（仅hc耗材场景）
 * 不包含hiddenFields参数，直接写死hc场景需要的查询字段
 */
export function queryFormOptions(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'productName',
      label: '商品',
      componentProps: {
        maxLength: 50,
        placeholder: '编码/搜索码/名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'modelNo',
      label: '型号',
      componentProps: {
        placeholder: '请输入型号',
      },
    },
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
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品组',
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
      fieldName: 'isShortPo',
      label: '是否临采',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
        };
      },
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
    {
      component: 'Input',
      fieldName: 'standardCode',
      label: '贯标编码',
      componentProps: {
        placeholder: '请输入贯标编码',
      },
    },
  ] as VbenFormSchema[];
}

/**
 * 生成表格列配置（仅hc耗材场景）
 * 不包含hiddenFields参数，直接写死hc场景需要显示的列
 * 固镇专属字段通过isGZCustom参数控制显示
 */
export function genColumns(isGZCustom = false): VxeGridPropTypes.Columns {
  return [
    {
      type: 'checkbox',
      title: '多选',
      width: 50,
      fixed: 'left',
      align: 'center',
    },
    { title: '序号', type: 'seq', width: 50, fixed: 'left', align: 'center' },
    {
      field: 'productCode',
      title: '商品编码',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'name',
      title: '商品名称',
      minWidth: 150,
      sortable: true,
    },
    // 固镇专属字段
    ...(isGZCustom
      ? [
          {
            field: 'accountingItemName',
            title: '核算项目',
            minWidth: 100,
            sortable: true,
          },
          {
            field: 'chargeTypeName',
            title: '计费项目',
            minWidth: 100,
            sortable: true,
          },
          {
            field: 'invoiceName',
            title: '发票项目',
            minWidth: 100,
            sortable: true,
          },
        ]
      : []),
    {
      field: 'medicineName',
      title: '通用名',
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'brandName',
      title: '品牌',
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'modelNo',
      title: '型号',
      minWidth: 80,
      sortable: true,
    },
    {
      field: 'productSpec',
      title: '规格',
      minWidth: 70,
      sortable: true,
    },
    {
      field: 'manufacturerName',
      title: '生产厂家',
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'value',
      title: '拼音码',
      minWidth: 80,
      sortable: true,
    },
    {
      field: 'baseUOMName',
      title: '最小单位',
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'baseUOMPrecision',
      title: '最小单位精度',
      minWidth: 110,
      align: 'right',
    },
    {
      field: 'uomName',
      title: '采购单位',
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'baseUOMQty',
      title: '采购单位转换比',
      minWidth: 130,
      sortable: true,
      align: 'right',
    },
    {
      field: 'certificateNo',
      title: '注册证号',
      minWidth: 100,
    },
    {
      field: 'certValidTo',
      title: '注册证号效期',
      minWidth: 110,
    },
    {
      field: 'hasCert',
      title: '是否有证照',
      minWidth: 90,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'upc',
      title: '产品条码',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'upc1',
      title: '原产品条码',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'isPurchasePriceUnify',
      title: '统一定价',
      minWidth: 90,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'settlementPriceMode',
      title: '后结算价格模式',
      minWidth: 130,
      sortable: true,
    },
    {
      field: 'pricePO',
      title: '采购价',
      minWidth: 70,
      // format: '0.000##',
      sortable: true,
      align: 'right',
    },
    {
      field: 'priceList',
      title: '零售价',
      minWidth: 70,
      // format: '0.000##',
      sortable: true,
      align: 'right',
    },
    {
      field: 'productCategoryName',
      title: '商品类别',
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'productControlLevelName',
      title: '商品组',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'lpackageQty',
      title: '大包装数',
      minWidth: 90,
      sortable: true,
      align: 'right',
    },
    {
      field: 'mpackageQty',
      title: '中包装数',
      minWidth: 90,
      sortable: true,
      align: 'right',
    },
    {
      field: 'isColdStorage',
      title: '需冷藏',
      minWidth: 80,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'storageConditionName',
      title: '存储条件',
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'careLevelName',
      title: '养护级别',
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'isLot',
      title: '批号管理',
      minWidth: 90,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isGuaranteeDateMandatory',
      title: '有效期必填',
      minWidth: 100,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isProductionDateMandatory',
      title: '生产日期必填',
      minWidth: 120,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isProductAreaMandatory',
      title: '产地必填',
      minWidth: 90,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isCertificateNoMandatory',
      title: '批准文号必填',
      minWidth: 120,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'guaranteeDaysMin',
      title: '近效期天数',
      minWidth: 100,
      sortable: true,
      align: 'right',
    },
    {
      field: 'isStoragePackage',
      title: '包装管理',
      minWidth: 90,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isBasePackage',
      title: '是否单包',
      minWidth: 90,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isSerNo',
      title: '厂家码管理',
      minWidth: 100,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isControlledProduct',
      title: '双人作业',
      minWidth: 90,
      sortable: true,
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'productTypeName',
      title: '商品分类',
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'productUserCode',
      title: '自定义编码',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'standardCode',
      title: '贯标编码',
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'isBulkPurchase',
      title: '带量采购',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'bulkPurchaseQty',
      title: '带量报量',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'bulkPurchaseTypeName',
      title: '带量采购类型',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'priceTypeName',
      title: '价格类型',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'isBid',
      title: '是否省标',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'markCode',
      title: '省标编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'bidsStatusName',
      title: '招标状态',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'zlTypeName',
      title: '医保分类',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'insurance',
      title: '医保编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'serviceToTypeName',
      title: '应用对象',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'isPrecious',
      title: '是否高值',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },
    {
      field: 'isShortPo',
      title: '是否临采',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : cellValue === 'N' ? '否' : '';
      },
      sortable: true,
    },
    {
      field: 'isFee',
      title: '是否计价',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
      sortable: true,
    },

    {
      field: 'materialBigTypeName',
      title: '重点监管分类',
      minWidth: '130',
    },
    {
      field: 'materialLevelName',
      title: '医疗器械分类',
      minWidth: '110',
    },
    {
      field: 'isInnovate',
      title: '是否创新',
      minWidth: '90',
      formatter({ cellValue }) {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'tracCodepreFix',
      title: '追溯码前7位',
      minWidth: '120',
    },
    {
      field: 'tracCodeDivideRate',
      title: '追溯码乘率',
      minWidth: '120',
    },
    {
      field: 'tracCodeMultiplyRate',
      title: '追溯码除率',
      minWidth: '120',
    },
    {
      field: 'description',
      title: '备注',
      minWidth: '200',
      sortable: true,
    },
    {
      field: 'changeActiveUser',
      title: '启/停用人',
      minWidth: '90',
    },
    {
      field: 'changeActiveReason',
      title: '启/停用原因',
      minWidth: '150',
    },
    {
      field: 'changeActiveTime',
      title: '启/停用时间',
      minWidth: '140',
    },
    {
      field: 'created',
      title: '创建时间',
      minWidth: '140',
      sortable: true,
    },
    {
      field: 'commitUserName',
      title: '提交人',
      minWidth: '80',
    },
    {
      field: 'commitTime',
      title: '提交时间',
      minWidth: '140',
    },
    {
      field: 'checkUserName',
      title: '审批人',
      minWidth: '80',
    },
    {
      field: 'checkTime',
      title: '审批时间',
      minWidth: '120',
    },
  ];
}
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-05-09
// @prompt 弹框配置项迁移到config.ts
// @description 将index.ts中的specColumns、packColumns、activationFormOptions、approveFormOptions、addToDepartmentFormOptions、genSpecAndPackFormSchemas迁移到config.ts
// AI-GENERATED-END

/** 规格表格列配置 */
export function specColumns(): VxeGridPropTypes.Columns {
  return [
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
    },
    {
      field: 'productSpec',
      minWidth: 100,
      title: '规格',
      sortable: true,
      editRender: { name: 'VxeInput' },
    },
    {
      field: 'productSpecCode',
      minWidth: 60,
      title: '规格编码',
      sortable: true,
      editRender: { name: 'VxeInput' },
    },
    {
      field: 'uomName',
      minWidth: 60,
      title: '单位',
      sortable: true,
      editRender: {},
      slots: { edit: 'edit_uomName' },
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
}

/** 定数表格列配置 */
export function packColumns(): VxeGridPropTypes.Columns {
  return [
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
    },
    {
      field: 'baseUomUnitPackQty',
      minWidth: 100,
      title: '个',
      sortable: true,
      editRender: { name: 'VxeNumberInput' },
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
}

/** 启停对话框表单配置 */
export function activationFormOptions() {
  return {
    layout: 'horizontal',
    schema: [
      {
        component: 'Select',
        componentProps: {
          options: [
            { label: '启用', value: 'Y' },
            { label: '停用', value: 'N' },
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
    showCollapseButton: false,
    submitOnChange: false,
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };
}

/** 审批对话框表单配置 */
export function approveFormOptions() {
  return {
    layout: 'horizontal',
    schema: [
      {
        component: 'Select',
        componentProps: {
          options: [
            { label: '通过', value: 'Y' },
            { label: '不通过', value: 'N' },
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
      },
    ],
    showCollapseButton: false,
    submitOnChange: false,
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };
}

/** 添加到科室对话框表单配置 */
export function addToDepartmentFormOptions() {
  return {
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
    showCollapseButton: false,
    submitOnChange: false,
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };
}

/** 规格/定数对话框表单schema配置 */
export function genSpecAndPackFormSchemas(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'productCode',
      label: '商品编码',
      disabled: true,
      formItemClass: 'col-span-2',
      labelClass: 'w-[70px]',
      componentProps: {
        placeholder: '',
      },
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '商品名称',
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
    {
      component: 'Input',
      fieldName: 'modelNo',
      label: '型号',
      disabled: true,
      formItemClass: 'col-span-2',
      labelClass: 'w-[70px]',
      componentProps: {
        placeholder: '',
      },
    },
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
  ] as VbenFormSchema[];
}

/** 采购单位选项 */
export const uomNameOptions = ref<Array<{ label: string; value: string }>>([]);
