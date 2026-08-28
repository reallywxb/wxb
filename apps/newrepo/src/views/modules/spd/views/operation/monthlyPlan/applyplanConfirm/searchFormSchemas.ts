import type { VbenFormSchema } from '@vben/common-ui';

import dayjs from 'dayjs';

export const searchFormSchemas: VbenFormSchema[] = [
  {
    component: 'DatePicker',
    fieldName: 'applyPlanDate',
    label: '计划月份',
    componentProps: () => {
      return {
        picker: 'month',
        format: 'YYYY-MM',
        valueFormat: 'YYYY-MM-DD',
      };
    },
    defaultValue: dayjs().add(1, 'month').format('YYYY-MM-01'),
    formItemClass: 'col-span-1',
  },

  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=N',
        // showSearch: true,
        placeholder: '请选择申请仓库',
        allowClear: true,
        // onChange(val: any, option: any) {
        //   // console.warn('toWarehouseId', val, option);
        //   // console.warn('selectToWarehouseId', selectToWarehouseId);
        //   // selectToWarehouseId.value = option.id;
        // },
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
    fieldName: 'toWarehouseId',
    label: '申请仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: '请选择院区',
        paginate: false,
        filterByFrontEnd: true,
        allowClear: true,
        onChange(val: any, option: any) {
          console.warn('toWarehouseId', val, option);
        },
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'departmentId',
    label: '院区',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
        // showSearch: true,
        placeholder: '请选择上级仓库',
        triggerFields: ['departmentId'],
        paginate: false,
        allowClear: true,
        // onChange(val: any, option: any) {
        //   extParams.value.bpartnerId_text = option.name;
        // },
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'warehouseId',
    formItemClass: 'pl-[10px] pr-[10px]',
    labelClass: 'leading-1 mb-[1px] pl-[4px]',
    label: '上级仓库',
  },
];
