import type { GridColumn } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';

export const gridColumns: GridColumn[] = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  { type: 'checkbox', title: '多选', width: 50, align: 'center' },
  {
    field: 'bpartnerName',
    minWidth: 120,
    sortable: false,
    title: '供应商',
  },
  {
    field: 'productName',
    minWidth: 120,
    sortable: false,
    title: '产品名',
  },
  {
    field: 'medicineName',
    minWidth: 120,
    sortable: false,
    title: '商品名',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: false,
    title: '规格',
  },
  {
    field: 'productStyle',
    minWidth: 90,
    sortable: true,
    title: '剂型',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'isEssential',
    minWidth: 150,
    sortable: true,
    title: '是否基本药物',
    formatter: (row: any) => {
      return row.isEssential === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'isOtc',
    minWidth: 150,
    sortable: true,
    title: '是否OTC',
    formatter: (row: any) => {
      return row.isOtc === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'isInsurance',
    minWidth: 150,
    sortable: true,
    title: '是否医保',
    formatter: (row: any) => {
      return row.isInsurance === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'MAH',
    minWidth: 130,
    sortable: true,
    title: '上市许可持有人',
  },
  {
    field: 'insuranceUOMName',
    minWidth: 130,
    sortable: true,
    title: '医保结算单位',
  },
  {
    field: 'priceList',
    minWidth: 100,
    sortable: true,
    title: '零售价',
    align: 'right',
  },
  {
    field: 'manufacturer',
    minWidth: 120,
    sortable: true,
    title: '生产企业',
  },
  {
    field: 'certTypeName',
    minWidth: 120,
    sortable: false,
    title: '证照类型',
  },
  {
    field: 'certNo',
    minWidth: 120,
    sortable: false,
    title: '证照号',
  },
  {
    field: 'certDate',
    minWidth: 120,
    sortable: true,
    title: '发证日期',
  },
  {
    field: 'certValidto',
    minWidth: 120,
    sortable: true,
    title: '有效期至',
  },
  {
    field: 'productTypeName',
    minWidth: 120,
    sortable: true,
    title: '产品类型',
  },
  {
    field: 'statusName',
    minWidth: 120,
    sortable: true,
    title: '状态',
  },
  {
    field: 'description',
    minWidth: 120,
    sortable: true,
    title: '备注',
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    width: 120,
  },
];

export const formSchema: VbenFormProps['schema'] = [
  {
    component: 'Input',
    fieldName: 'productName',
    label: '产品名称',
    componentProps: {
      placeholder: '请输入产品名称',
    },
  },
  {
    component: 'Input',
    fieldName: 'manufacturer',
    label: '生产企业',
    componentProps: {
      placeholder: '请输入生产企业',
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/refList.do?id=1000503',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: '请选择产品类型',
        paginate: false,
        // allowClear: true,
        filterByFrontEnd: true,
        // mode: 'multiple',
        showChooseAll: '',
        defaultValue: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'productType',
    label: '产品类型',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/refList.do?id=192',
        showSearch: true,
        placeholder: '请选择供应商',
        paginate: false,
        // allowClear: true,
        filterByFrontEnd: true,
        // onChange(val: any, option: any) {
        //   extParams.value.bpartnerId_text = option.name;
        // },
        // mode: 'multiple',
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        defaultValue: '',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'vendorId',
    label: '供应商',
  },
];

export const commonFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
    },

    {
      component: 'Input',
      fieldName: 'username',
      label: '登录名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: '用户编码',
    },
    {
      component: 'Input',
      fieldName: 'avatar',
      label: '头像',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '男',
            value: '1',
          },
          {
            label: '女',
            value: '2',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'sex',
      label: '性别',
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: '手机',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Switch',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '是',
            value: 'true',
          },
          {
            label: '否',
            value: 'false',
          },
        ],
        placeholder: '请选择',
        style: {
          width: '40px',
        },
      },
      defaultValue: true,
      fieldName: 'isActive',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};
export const viewFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      formItemClass: 'readOnly',
      componentProps: {
        disabled: true,
      },
      fieldName: 'name',
      label: '姓名',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'username',
      label: '登录名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: {
        disabled: true,
        autocomplete: 'autocomplete',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'code',
      label: '用户编码',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'avatar',
      label: '头像',
    },
    {
      component: 'Select',
      componentProps: {
        disabled: true,
        allowClear: true,
        options: [
          {
            label: '男',
            value: '1',
          },
          {
            label: '女',
            value: '2',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'sex',
      label: '性别',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'mobile',
      label: '手机',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Switch',
      componentProps: {
        disabled: true,
        allowClear: true,
        options: [
          {
            label: '是',
            value: 'true',
          },
          {
            label: '否',
            value: 'false',
          },
        ],
        placeholder: '请选择',
        style: {
          width: '40px',
        },
      },
      defaultValue: true,
      fieldName: 'isActive',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      componentProps: {
        disabled: true,
      },
      formItemClass: 'col-span-2',
      label: '备注',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};
