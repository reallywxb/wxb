import type { VbenFormProps } from '#/adapter/form';

// import type { GridColumn } from '@vben/chc-ui';
// import dayjs from 'dayjs';

export const formSchema: VbenFormProps['schema'] = [
  {
    component: 'DateGroup',
    fieldName: 'dateOrdered',
    label: '创建时间',
    // defaultValue: [
    //   dayjs(dayjs().format('YYYY-MM-DD'))
    //     .subtract(7, 'day')
    //     .format('YYYY-MM-DD'),
    // ],
    defaultValue: [],
    formItemClass: 'col-span-1',
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '药品',
    componentProps: {
      placeholder: '编码/拼音码/名称',
    },
  },
  {
    component: 'Input',
    fieldName: 'mInoutId',
    label: '单据号',
    componentProps: {
      placeholder: '请输入单据号',
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/vendor.do?categoryType=2',
        placeholder: '请选择供应商',
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
    // defaultValue: '',
    fieldName: 'vendorId',
    label: '供应商',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&categoryType=2',
        placeholder: '请选择仓库',
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
    // defaultValue: '',
    fieldName: 'warehouseId',
    label: '采购仓库',
  },
];
