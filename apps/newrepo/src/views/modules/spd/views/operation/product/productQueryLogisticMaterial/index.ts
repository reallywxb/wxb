import type { VbenFormProps, VbenFormSchema } from '@vben/common-ui';

import { h } from 'vue';
import { useRoute } from 'vue-router';

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
      fieldName: 'brandName',
      label: '品牌',
      componentProps: {
        placeholder: '请输入品牌',
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
            { value: 'Y', label: '已审批' },
            { value: 'N', label: '待审批' },
          ],
          placeholder: '请选择审批状态',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'productApplyStatus',
      label: '审批状态',
    },
  ].filter(
    ({ fieldName }) => !hiddenFields.includes(fieldName),
  ) as VbenFormSchema[];
}

export function genColumns(hiddenFields: string[]) {
  return [
    { type: 'checkbox', title: '多选', width: 50, align: 'center' },
    { title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'isActive',
      visible: !hiddenFields.includes('isActive'),
      title: '药品状态',
      minWidth: '100',
      sortable: true,
      formatter({ cellValue }: { cellValue: string }) {
        return cellValue === 'Y' ? '启用' : '停用';
      },
    },
    {
      field: 'productApplyStatus',
      visible: !hiddenFields.includes('productApplyStatus'),
      title: '审批状态',
      minWidth: '100',
      sortable: true,
    },
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
      field: 'productSpec',
      visible: !hiddenFields.includes('productSpec'),
      title: '规格',
      minWidth: '120',
      sortable: true,
    },

    {
      field: 'modelNo',
      visible: false,
      // visible: !hiddenFields.includes('modelNo'),
      title: '型号',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'productName',
      visible: !hiddenFields.includes('productName'),
      title: '品牌',
      minWidth: '150',
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
      field: 'uomName',
      visible: !hiddenFields.includes('uomName'),
      title: '单位',
      minWidth: '90',
      sortable: true,
    },
    {
      field: 'pricePO',
      visible: !hiddenFields.includes('pricePO'),
      title: '单价',
      minWidth: '70',
      format: '0.000##',
      sortable: true,
      align: 'right',
    },
    // {
    //   field: 'priceList',
    //   visible: !hiddenFields.includes('priceList'),
    //   title: '零售价',
    //   minWidth: '70',
    //   format: '0.000##',
    //   sortable: true,
    //   align: 'right',
    // },
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
      align: 'center',
      field: 'action',
      slots: { default: 'action' },
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 100,
    },
  ];
}

export function genFormOptions(hiddenFields: string[], isBatch = false) {
  const route = useRoute();

  const formSchemas = [
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
    //     placeholder: '请输入商品名称',
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
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入规格',
    //   },
    //   fieldName: 'productSpec', // 药品名称
    //   formItemClass: 'col-span-6 ',
    //   labelClass: ' w-[105px] ',
    //   label: '规格',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000391',
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
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        allowClear: true,
        placeholder: '请选择注册证效期',
      },
      fieldName: 'certValidTo', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '注册证效期',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000183',
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
      // componentProps: () => {
      //   return {
      //     checkedValue: 'Y',
      //     unCheckedValue: 'N',
      //     checkedChildren: '是',
      //     unCheckedChildren: '否',
      //     style: {
      //       width: '40px',
      //     },
      //   };
      // },
      fieldName: 'isStoragePackage', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '包装管理',
      componentProps: () => {
        return {
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      // componentProps: () => {
      //   return {
      //     checkedValue: 'Y',
      //     unCheckedValue: 'N',
      //     checkedChildren: '是',
      //     unCheckedChildren: '否',
      //     style: {
      //       width: '40px',
      //     },
      //   };
      // },
      fieldName: 'isBasePackage', // 药品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '是否单包',
      componentProps: () => {
        return {
          style: {
            width: '40px',
          },
        };
      },
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
