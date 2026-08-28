import type { VbenFormSchema } from '@vben/common-ui';

export const searchFormSchemas: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: '供应商名称',
    componentProps: {
      placeholder: '请输入供应商名称',
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
];
