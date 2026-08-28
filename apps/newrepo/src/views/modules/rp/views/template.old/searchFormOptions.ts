import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api';

export const primarySearchFormOptions = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    layout: 'horizontal',
    commonConfig: {
      labelWidth: 70,
    },
    arrayToStringFields: ['noticeTime'],
    handleSubmit(values: any) {
      fn().reload(values);
    },
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/rp.templateType',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'templateType',
        label: '模板类型',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'name',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '名称',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Select',
        componentProps: () => ({
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: true, label: '是' },
            { value: false, label: '否' },
          ],
          placeholder: '请选择',
        }),
        defaultValue: '',
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    showCollapseButton: false,
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
