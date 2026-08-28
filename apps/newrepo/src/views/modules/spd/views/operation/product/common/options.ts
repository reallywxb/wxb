import type { VbenFormProps } from '@vben-core/form-ui';

import { h } from 'vue';

export const formOptions: VbenFormProps = {
  layout: 'horizonal',
  schema: [
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
      fieldName: 'prefix', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '编码前缀',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入商品名称',
      },
      fieldName: 'productCode',
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '药品编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入商品名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '药品名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入通用名',
      },
      fieldName: 'medicineName', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '通用名',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品名称',
      },
      fieldName: 'priorityTypeName', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '药品名称',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入品牌',
      },
      fieldName: 'productName', // 商品名称
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
    //   fieldName: 'modelNo', // 商品名称
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
      fieldName: 'productSpec', // 商品名称
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
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'manufacturerId', // 商品名称
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
      fieldName: 'value', // 商品名称
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
      fieldName: 'value2', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'baseUOMId', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '最小单位',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入最小单位精度',
      },
      fieldName: 'baseUOMPrecision', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '最小单位精度',
      rules: 'required',
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'uomId', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '采购单位',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购单位转换比',
      },
      fieldName: 'baseUOMQty', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[120px] ',
      label: '采购单位转换比',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购单位精度',
      },
      fieldName: 'uomPrecision', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '采购单位精度',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入注册证号',
      },
      fieldName: 'certificateNo', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '注册证号',
    },

    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入注册证效期',
      },
      fieldName: 'certValidTo', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productStyle', // 商品名称
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
      fieldName: 'marketingAuthorizationHolder', // 商品名称
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
      fieldName: 'upc', // 商品名称
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
      fieldName: 'upc1', // 商品名称
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
      fieldName: 'contractDate', // 商品名称
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
      fieldName: 'casNo', // 商品名称
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
      fieldName: 'isPurchasePriceUnify', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'settlementPriceMode', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '后结算价格模式',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入原产品条码',
      },
      fieldName: 'pricePO', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '采购价格',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入原产品条码',
      },
      fieldName: 'priceList', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productCategoryId', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品类别',
      rules: 'required',
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productControlLevel', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品组',
      rules: 'required',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入原产品条码',
    //   },
    //   fieldName: 'productControlLevel', // 商品名称
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
      fieldName: 'lpackageQty', // 商品名称
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
      fieldName: 'mpackageQty', // 商品名称
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
      fieldName: 'spackageQty', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'storageCondition', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'careLevel', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '养护级别',
    },
    {
      fieldName: 'isColdStorage', // 商品名称
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
      fieldName: 'isLot', // 商品名称
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
      fieldName: 'isGuaranteeDateMandatory', // 商品名称
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
      fieldName: 'isProductionDateMandatory', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '生产日期必填',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入原产品条码',
      },
      fieldName: 'guaranteeDaysMin', // 商品名称
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
      fieldName: 'isProductAreaMandatory', // 商品名称
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
      fieldName: 'isCertificateNoMandatory', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '批准文号必填',
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
      fieldName: 'isStoragePackage', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '包装管理',
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
      fieldName: 'isBasePackage', // 商品名称
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
      fieldName: 'isSerNo', // 商品名称
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
      fieldName: 'isControlledProduct', // 商品名称
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
      fieldName: 'isAloneCharge', // 商品名称
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
      fieldName: 'isDedicated', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productType', // 商品名称
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
      fieldName: 'productUserCode', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '自定义编码',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     maxLength: 30,
    //     allowClear: true,
    //     placeholder: '请输入',
    //   },
    //   fieldName: 'standardCode', // 商品名称
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
      fieldName: 'productStateCode', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '商品本位码',
    },
    {
      component: 'Switch',
      fieldName: 'isTwoVote', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'essentialDrugType', // 商品名称
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
    //   fieldName: 'uomId', // 商品名称
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
    //   fieldName: 'bidsStatus', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'bidsStatus', // 商品名称
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
      fieldName: 'isBulkPurchase', // 商品名称
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
      fieldName: 'bulkPurchaseQty', // 商品名称
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
      fieldName: 'bidsStatus', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'priceType', // 商品名称
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
    //   fieldName: 'priceType', // 商品名称
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
      fieldName: 'isBid', // 商品名称
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
      fieldName: 'markCode', // 商品名称
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
      fieldName: 'isCityBid', // 商品名称
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
      fieldName: 'cityBidCode', // 商品名称
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
      fieldName: 'isOnLine', // 商品名称
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
      fieldName: 'isShortPo', // 商品名称
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
    //   fieldName: '"', // 商品名称
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
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'zlType', // 商品名称
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
      fieldName: '"', // 商品名称
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
    //   fieldName: 'insuranceFee', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'insuranceFee', // 商品名称
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
    //   fieldName: 'serviceToType', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'serviceToType', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'materialBigType', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'materialLevel', // 商品名称
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
      fieldName: 'isPrecious', // 商品名称
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
      fieldName: 'isFee', // 商品名称
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
      fieldName: 'isForeign', // 商品名称
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
    //   fieldName: 'insurancePaymentType', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'insurancePaymentType', // 商品名称
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
      fieldName: 'isImPlanTation', // 商品名称
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
      fieldName: 'isInterPose', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'executiveStandard', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'skinTestType', // 商品名称
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
      fieldName: 'isInfusion', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'antiDrugType', // 商品名称
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
      fieldName: 'isNarcotic', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'narcoticType', // 商品名称
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
      fieldName: 'isAntitumor', // 商品名称
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
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'antitumorType', // 商品名称
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
      fieldName: 'isDisinfectant', // 商品名称
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
      fieldName: 'isSpecial', // 商品名称
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
      fieldName: 'isHighRisk', // 商品名称
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
      fieldName: 'isReported', // 商品名称
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
      fieldName: 'isNew', // 商品名称
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
      fieldName: 'isConfused', // 商品名称
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
      fieldName: 'isInnovate', // 商品名称
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
      fieldName: 'isMonitor', // 商品名称
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
      fieldName: 'isReserve', // 商品名称
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
      fieldName: 'isNesis', // 商品名称
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
      fieldName: 'isSurgicalTool', // 商品名称
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
      fieldName: 'tracCodePreFix', // 商品名称
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
      fieldName: 'tracCodeMultiplyRate', // 商品名称
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
      fieldName: 'tracCodeDivideRate', // 商品名称
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
      fieldName: 'description', // 商品名称
      formItemClass: 'col-span-6 ',
      labelClass: ' w-[105px] ',
      label: '备注',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};
