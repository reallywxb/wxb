import type { VbenFormSchema } from '@vben/common-ui';

export const searchFormSchemas: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'productName',
    label: '商品',
    componentProps: {
      placeholder: '请输入商品',
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
    defaultValue: '',
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
    defaultValue: '',
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
    defaultValue: '',

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
        onChange(val: any, option: any) {
          console.warn('defaultVendorId', val, option);
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
    defaultValue: '',
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
    defaultValue: '',
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
    fieldName: 'dateOrdered',
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
  // TODO:medicine cancel 贯标码
  // {
  //   component: 'Input',
  //   fieldName: 'standardCode',
  //   label: '贯标编码',
  //   componentProps: {
  //     placeholder: '请输入贯标编码',
  //   },
  // },
];
