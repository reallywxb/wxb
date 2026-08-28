import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed } from 'vue';

export const useSearchForm = (fn: () => VxeGridApi) =>
  ({
    actionWrapperClass: 'formActionAreaStyle',
    showCollapseButton: false,
    layout: 'horizontal',
    commonConfig: {
      labelWidth: 70,
    },
    schema: [
      {
        component: 'DateGroup',
        componentProps: () => ({
          valueFormat: 'YYYY-MM-DD',
        }),
        fieldName: 'messageTime',
        formItemClass: 'pl-[10px] pr-[10px]',
        label: '消息时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          showChooseAll: '',
          afterFetch: (records: any) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/getDict/sys.message.messageType',
          placeholder: '请选择',
          paginate: false,
          showChooseAll: '',
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'messageType',
        label: '消息类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/getDict/sys.message.messageGroup',
          placeholder: '请选择',
          paginate: false,
          showChooseAll: '',
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'messageGroup',
        label: '消息分组',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
    ],
    arrayToStringFields: ['messageTime'],
    handleSubmit(values: any) {
      fn().reload(values);
    },
    wrapperClass:
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  }) as VbenFormProps;
