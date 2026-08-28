import type { VbenFormSchema } from '@vben/common-ui';

export const searchFormSchemas: VbenFormSchema[] = [
  /* 测试要求隐藏*/
  // {
  //   component: 'ChcSelect',
  //   componentProps: () => {
  //     return {
  //       // autoChooseFirstOption: true,
  //       dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
  // apiType: 'post',
  // requestContentType: 'application/x-www-form-urlencoded',
  //       showSearch: true,
  //       placeholder: '请选择院区',
  //       onChange(val: any, option: any) {
  //         console.warn('departmentId', val, option);
  //       },
  //       paginate: false,
  //       filterByFrontEnd: true,
  //       showChooseAll: '',
  //       immediate: true,
  //       labelField: 'name',
  //       valueField: 'id',
  //       afterFetch(res: any) {
  //         return { ...res, rows: undefined, records: res.rows };
  //       },
  //     };
  //   },
  //   fieldName: 'departmentId',
  //   label: '院区',
  // },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '商品',
    componentProps: {
      allowClear: true,
      placeholder: '请输入商品',
    },
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
        // autoChooseFirstOption: true,
        dictUrl: '/productAction/productCategoryList.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: '请选择商品类别',
        onChange(val: any, option: any) {
          console.warn('productCategory', val, option);
        },
        mode: 'multiple',
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
    fieldName: 'productCategoryId',
    label: '商品类别',
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
    component: 'DateGroup',
    fieldName: 'dateOrderedStart',
    label: '起始日期',
  },
  {
    component: 'DateGroup',
    fieldName: 'dateOrderedEnd',
    label: '结束日期',
  },
  {
    component: 'Input',
    fieldName: 'markCode',
    label: '中标编码',
    componentProps: {
      allowClear: true,
      placeholder: '请输入中标编码',
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
        placeholder: '请选择默认供应商',
        defaultValue: '',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isDefault',
    label: '默认供应商',
  },
];
