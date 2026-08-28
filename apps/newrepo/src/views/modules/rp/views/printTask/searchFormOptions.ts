import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api';

export const primarySearchFormOptions = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    layout: 'horizontal',
    commonConfig: {
      labelClass: 'w-[80px]',
    },
    handleSubmit(values: any) {
      fn().reload(values);
    },
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
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:md.zone?warehouseId={{warehouseId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        dependencies: {
          trigger(values) {
            const compRef = fn().formApi?.getFieldComponentRef?.('zoneId');
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.warehouseId) {
                compRef.value?.formApi?.setFieldValue('zoneId', undefined);
              }
              compRef.params.dependencies = {
                warehouseId: values.warehouseId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['warehouseId'],
        },
        fieldName: 'zoneId',
        label: '库区',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: 'datatable/dict/entity:rp.printer',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'printerId',
        label: '后台打印机',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:rp.printServer',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'printServerId',
        label: '打印服务器',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:rp.report',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'reportId',
        label: '报表定义',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/rp.printTask.status',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'status',
        label: '状态',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
    ],
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
