import type { VbenFormProps, VbenFormSchema } from '@vben/common-ui';

import { useRoute } from 'vue-router';

import { message } from 'ant-design-vue';

import { confirmProductApply } from '#/views/modules/spd/views/operation/product/api';

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
      fieldName: 'isApprove',
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

export function genFormOptions(hiddenFields: string[], isBatch = false) {
  const route = useRoute();
  const isManualCode =
    (route.meta.urlParams as Record<string, any>)?.isManualCode === 'Y';

  const formSchemas = [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入编码前缀',
      },
      fieldName: 'prefix',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '编码前缀',
      hidden: !isManualCode || !isBatch,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品编码',
      },
      fieldName: 'productCode',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '药品编码',
      rules: 'required',
      // disabled: isBatch,
      hidden: isBatch && isManualCode,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '药品名称',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入规格',
      },
      fieldName: 'productSpec',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '规格',
    },
    //  TODO:medicine cancel
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入型号',
    //   },
    //   fieldName: 'modelNo',
    //   formItemClass: 'col-span-1',
    //   labelClass: ' w-[90px]',
    //   label: '型号',
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入品牌',
      },
      fieldName: 'productName',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '品牌',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000391',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: '',
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'manufacturerId',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '生产厂家',
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
      fieldName: 'productControlLevel',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      rules: isBatch ? '' : 'required',
      label: '商品组',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入零售价',
      },
      fieldName: 'priceList',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '零售价',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购单价',
        disabled: true,
      },
      fieldName: 'pricePO',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '采购单价',
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
          disabled: true,
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
      label: '默认供应商',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=114',
          showSearch: false,
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
      fieldName: 'uomId',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      rules: isBatch ? '' : 'required',
      label: '单位',
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
          dictUrl: '/productAction/productCategoryList.do?categoryType=2',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: '',
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productCategoryId',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '商品类别',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'lpackageQty',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '大包装数',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'mpackageQty',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '中包装数',
    },
  ];
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
    wrapperClass: 'grid-cols-3',
  };

  return formOptions;
}

export function queryFormOptions(hiddenFields: Array<string>) {
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
          options: [
            { value: '', label: '全部' },
            { value: '1', label: '新增' },
            { value: '2', label: '修改' },
          ],
          placeholder: '请选择审批类型',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'applyType',
      label: '审批类型',
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
  ].filter(
    ({ fieldName }) => !hiddenFields.includes(fieldName),
  ) as VbenFormSchema[];
}

export function genColumns(hiddenFields: string[]) {
  return [
    { type: 'checkbox', title: '多选', width: 50, align: 'center' },
    { title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'applytypeName',
      visible: !hiddenFields.includes('applytypeName'),
      title: '审批类型',
      minWidth: '100',
      sortable: true,
      // formatter({ cellValue }: { cellValue: string }) {
      //   return cellValue === '1' ? '新增' : '修改';
      // },
    },
    {
      field: 'productCode',
      visible: !hiddenFields.includes('productCode'),
      title: '药品编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'mName',
      visible: !hiddenFields.includes('mName'),
      title: '药品名称',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'mProductspec',
      visible: !hiddenFields.includes('mProductspec'),
      title: '规格',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'mModelNo',
      visible: false,
      // visible: !hiddenFields.includes('mModelNo'),
      title: '型号',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'mProductname',
      visible: !hiddenFields.includes('mProductname'),
      title: '品牌',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'mManufacturer',
      visible: !hiddenFields.includes('mManufacturer'),
      title: '生产厂家',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'mUomName',
      visible: !hiddenFields.includes('mUomName'),
      title: '单位',
      minWidth: 80,
      sortable: true,
    },
    {
      field: 'mPricepo',
      visible: !hiddenFields.includes('mPricepo'),
      title: '单价',
      minWidth: '70',
      format: '0.000##',
      sortable: true,
      align: 'right',
    },
    {
      field: 'mVendorName',
      visible: !hiddenFields.includes('mVendorName'),
      title: '默认供应商',
      minWidth: '150',
      sortable: false,
      formatter({ row }: { row: any }) {
        return row.mVendorName;
      },
    },
    {
      field: 'mLPackageqty',
      visible: !hiddenFields.includes('mLPackageqty'),
      title: '大包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'mMPackageqty',
      visible: !hiddenFields.includes('mMPackageqty'),
      title: '中包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'createUser',
      // visible: route.name !== '商品首营' && !hiddenFields.includes('commitUserName'),
      title: '提交人',
      minWidth: '120',
    },
    {
      field: 'created',
      // visible: route.name !== '商品首营' && !hiddenFields.includes('commitTime'),
      title: '提交时间',
      minWidth: '120',
    },
    {
      align: 'center',
      field: 'action',
      slots: { default: 'action' },
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      minWidth: 130,
    },
  ];
}

export function useProductYP({ approveFromModalApi, parentGridApi }: any) {
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
              selectedRows.map(({ productApplyId }: any) => productApplyId),
            ),
            ...params,
          };
          console.warn(newParams);
          return confirmProductApply(newParams);
        },
      })
      .open();
  }
  return {
    handleApprove,
  };
}
