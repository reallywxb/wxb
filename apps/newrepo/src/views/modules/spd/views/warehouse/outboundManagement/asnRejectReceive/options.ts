import type { GridColumn } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';

import dayjs from 'dayjs';

export const gridColumns: GridColumn[] = [
  { type: 'radio', title: '单选', width: 50, align: 'center', visible: false },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  { type: 'checkbox', title: '多选', width: 50, align: 'center' },
  {
    field: 'orderNo',
    title: '申请单号',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'orderTypeName',
    title: '申请类型',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'productCode',
    title: '药品编码',
    minWidth: '120',
    sortable: true,
  },
  {
    field: 'productName',
    title: '药品名称',
    minWidth: '200',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    minWidth: '90',
    sortable: true,
  },
  // TODO: medicine cancel 型号
  {
    field: 'modelNo',
    title: '型号',
    minWidth: '130',
    sortable: true,
    visible: false,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    minWidth: '150',
    sortable: true,
  },
  {
    field: 'uomName',
    title: '单位',
    minWidth: '70',
    sortable: true,
  },
  {
    field: 'qtyArrived',
    title: '发货数量',
    minWidth: '90',
    // hover: true,
    sortable: true,
    align: 'right',
    slots: { default: 'qtyArrived' },
  },
  {
    field: 'qtyReceived',
    title: '收货数量',
    minWidth: '90',
    sortable: true,
    align: 'right',
  },
  {
    field: 'qtyRejected',
    title: '拒收数量',
    minWidth: '90',
    sortable: true,
    align: 'right',
  },
  {
    field: 'qtyReturned',
    title: '退回数量',
    minWidth: '90',
    sortable: true,
    align: 'right',
  },
  {
    field: 'checkerName',
    title: '验收人',
    minWidth: '110',
    sortable: true,
  },
  {
    field: 'checkTime',
    title: '验收时间',
    minWidth: '110',
    sortable: true,
  },
  {
    field: 'lot',
    title: '批号',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'guaranteeDate',
    title: '效期',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'fromWarehouseName',
    title: '出库仓库',
    minWidth: '150',
    sortable: true,
  },
  {
    field: 'warehouseName',
    title: '拒收仓库',
    minWidth: '150',
    sortable: true,
  },
  {
    field: 'locatorName',
    title: '验收货位',
    minWidth: '180',
    slots: {
      default: 'locatorNameDefault',
    },
    // edit: 'ProductPopWin',
    sortable: true,
  },
  {
    field: 'docDate',
    title: '配送日期',
    minWidth: '120',
    sortable: true,
  },
  {
    field: 'rejectReasonName',
    title: '拒收原因',
    minWidth: '150',
    sortable: true,
  },
  {
    field: 'asnNo',
    title: '配送单号',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    minWidth: '150',
    sortable: true,
  },
];

export const formSchema: VbenFormProps['schema'] = [
  {
    component: 'DateGroup',
    fieldName: 'docDate', // 默认实际查询参数 dateFrom，dateTo
    label: '配送日期',
    defaultValue: [
      dayjs(dayjs().format('YYYY-MM-DD'))
        .subtract(7, 'day')
        .format('YYYY-MM-DD'),
    ],
    formItemClass: 'col-span-1',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        placeholder: '请选择院区',
        paginate: false,
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
    fieldName: 'departmentId',
    label: '院区',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/warehouseBPartner.do?readWrite=Y',
        placeholder: '请选择发货仓库',
        triggerFields: ['departmentId', 'regionId'],
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'bpartnerId',
    label: '发货仓库',
  },
  {
    component: 'Input',
    fieldName: 'asnNo',
    label: '配送单号',
    componentProps: {
      placeholder: '请输入配送单号',
    },
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '药品',
    componentProps: {
      placeholder: '请输入药品',
    },
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
