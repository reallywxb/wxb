import type { VbenFormProps } from '@vben/common-ui';

import { computed } from 'vue';

export const searchFormOptions: VbenFormProps = {
  actionWrapperClass: 'formActionAreaStyle',
  showCollapseButton: true,
  layout: 'horizontal',
  commonConfig: {
    labelWidth: 70,
  },
  schema: [
    {
      component: 'ChcSelect',
      componentProps: computed(() => ({
        dictUrl: '/datatable/getDict/entity:sys.dept',
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        afterFetch: (records: any) => ({ records }),
      })),
      fieldName: 'orgId',
      label: '机构',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/entity:sys.dept',
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        afterFetch: (records: any) => ({ records }),
      }),
      fieldName: 'userId',
      label: '用户',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/entity:sys.dept',
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        afterFetch: (records: any) => ({ records }),
      }),
      fieldName: 'messageOrgId',
      label: '消息机构',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/getDict/sys.message.messageType',
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        afterFetch: (records: any) => ({ records }),
      }),
      fieldName: 'messageType',
      label: '消息类型',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
      },
      fieldName: 'isActive',
      label: '是否有效',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
    },
  ],
  collapsed: true,
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
};
