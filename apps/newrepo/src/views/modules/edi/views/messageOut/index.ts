import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import {
  createMessageOut,
  createMessageOutBody,
  delMessageOut,
  getMessageOutBody,
  updateMessageOut,
  updateMessageOutBody,
} from './api';
import { usePrimaryGridOptions } from './gridOptions';
import { primarySearchFormOptions } from './searchFormOptions';

enum ModalMode {
  add,
  edit,
  view,
}

export function useGrid() {
  // 主表
  const [Grid, gridApi] = useCommonGrid(
    {
      formOptions: primarySearchFormOptions(() => gridApi),
      gridOptions: usePrimaryGridOptions(),
    },
    {
      dataTableId: '/datatable/data/page/edi.messageOut',
    },
  );

  return {
    Grid,
    gridApi,
  };
}

export function useCommonModal(gridApi: VxeGridApi) {
  const modificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const messageModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
        fieldName: 'msgTime',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '消息时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/dict/itemList/edi.message.msgType',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'msgType',
        label: '消息类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/dict/itemList/table:edi.site.id',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteId',
        label: '目标站点',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'msgNo',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '消息号',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/dict/itemList/edi.message.processStatus',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'processStatus',
        label: '处理状态',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'processMsg',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '错误消息',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },

      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'msgVersion',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '消息版本',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'msgGroup',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '消息分组',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'priority',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '优先级',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/dict/itemList/table:edi.siteApp.id',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteAppId',
        label: '目标应用',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'remark',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '备注',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
          showTime: true,
          format: 'YYYY-MM-DD HH:mm',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
        fieldName: 'lastProcessTime',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '上次处理时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'InputNumber',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'retryCount',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '重试次数',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isActive',
        label: '是否有效',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: true,
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-2',
  };

  const messageFormOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'Input',
        fieldName: 'messageInId',
        label: '',
        formItemClass: 'hidden',
      },
      {
        component: 'Input',
        fieldName: 'messageInId_name',
        label: '',
        formItemClass: 'hidden',
      },
      {
        component: 'Input',
        fieldName: 'rownum_',
        label: '',
        formItemClass: 'hidden',
      },
      {
        component: 'Textarea',
        fieldName: 'content',
        label: '',
        componentProps: () => ({
          rows: 8,
        }),
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        hideLabel: true,
      },
    ],
    showDefaultActions: false,
  };

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createMessageOut(params),
      })
      .open();
  }
  function handleEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params: any) =>
          updateMessageOut({
            ...params,
            id,
          }),
      })
      .open();
  }

  function handleDel({ id }: any) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delMessageOut(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleMessage(row: any) {
    messageModalRef.value?.modalApi
      .setData({
        title: '消息内容',
        submit: (params: any) => {
          return params.messageInId
            ? updateMessageOutBody(params)
            : createMessageOutBody({
                ...params,
                messageInId: row.id,
              });
        },
      })
      .open();
    messageModalRef.value?.modalApi.setState({
      loading: true,
    });

    getMessageOutBody({
      current: 1,
      size: 1,
      conditions: [
        {
          field: 'messageInId',
          operator: '=',
          value: row.id,
        },
      ],
    })
      .then(({ records }) => {
        messageModalRef.value?.formApi?.setValues(records?.[0]);
      })
      .finally(() => {
        messageModalRef.value?.modalApi.setState({
          loading: false,
        });
      });
  }

  return {
    modificationModalRef,
    formOption,
    messageFormOption,
    messageModalRef,
    handleAdd,
    handleEdit,
    handleDel,
    handleMessage,
  };
}
