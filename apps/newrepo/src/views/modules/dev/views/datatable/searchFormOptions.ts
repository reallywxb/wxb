import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import type { VbenFormProps } from '#/adapter/form';

import { message } from 'ant-design-vue';

export const useSearchForm = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          autoChooseFirstOption: true,
          dictUrl: '/datatable/getModules',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records) => ({ records }),
        }),
        fieldName: 'module',
        label: '模块',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入编码',
        },
        fieldName: 'id',
        label: '编码',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入名称',
        },
        fieldName: 'title',
        label: '名称',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入表名',
        },
        fieldName: 'tableName',
        label: '表名',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    async handleSubmit() {
      const gridApi = fn();

      try {
        const values = await gridApi.formApi.getValues();
        if (values.module) {
          gridApi.query(values);
        } else {
          message.error('请选择模块');
        }
      } catch (error) {
        console.warn(error);
      }
    },
    async handleReset() {
      const gridApi = fn();

      const formValues = await gridApi.formApi.getValues();

      await gridApi.formApi.resetForm();
      gridApi.formApi.setFieldValue('module', formValues.module);
    },
    showCollapseButton: false,
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
