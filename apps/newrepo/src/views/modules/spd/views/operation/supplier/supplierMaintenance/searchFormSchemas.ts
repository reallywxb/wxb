import type { VbenFormSchema } from '@vben/common-ui';

export const searchFormSchemas: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'value',
    label: '搜索码',
    componentProps: {
      placeholder: '请输入搜索码',
    },
  },
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
        options: [
          { value: '', label: '全部' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择是否停用',
        defaultValue: '',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isStop',
    label: '是否停用',
  },
];
