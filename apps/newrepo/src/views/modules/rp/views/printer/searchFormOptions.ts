import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api';

export const primarySearchFormOptions = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    layout: 'horizontal',
    commonConfig: {
      labelWidth: 70,
    },
    handleSubmit(values: any) {
      fn().reload(values);
    },
    showCollapseButton: false,
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: 'datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:md.warehouse?orgId={{orgId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        dependencies: {
          trigger(values) {
            const compRef = fn().formApi?.getFieldComponentRef?.('warehouseId');
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.orgId) {
                compRef.value?.formApi?.setFieldValue('warehouseId', undefined);
              }
              compRef.params.dependencies = {
                orgId: values.orgId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'warehouseId',
        label: '仓库',
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
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
