import type { VbenFormSchema } from '@vben/common-ui';

import dayjs from 'dayjs';

export const searchFormSchemas: VbenFormSchema[] = [
  {
    component: 'DateGroup',
    fieldName: 'dateOrdered',
    label: '协议日期',
    defaultValue: [dayjs().subtract(7, 'day').format('YYYY-MM-DD')],
  },
  {
    component: 'Input',
    fieldName: 'vendor',
    label: '供应商编码',
    componentProps: {
      placeholder: '请输入供应商编码',
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
    fieldName: 'bpartnerId',
    label: '供应商',
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
        placeholder: '请选择是否有效',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    defaultValue: 'Y',
    fieldName: 'isActive',
    label: '是否有效',
  },
  {
    component: 'Input',
    fieldName: 'siteContractID',
    label: '协议号',
    componentProps: {
      allowClear: true,
      placeholder: '请输入协议号',
    },
  },
];
