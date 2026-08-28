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
  createConsumeLog,
  delConsumeLog,
  getContent,
  updateConsumeLog,
  updateContent,
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
      dataTableId: '/datatable/data/page/mq.consumeLog',
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
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/sys.client.clientCode',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '客户端',
        fieldName: 'clientCode',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        label: '主题',
        fieldName: 'topic',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        label: '消息类型',
        fieldName: 'messageType',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        label: '消息主键',
        fieldName: 'messageKey',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/mq.log.processStatus',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '处理状态',
        fieldName: 'processStatus',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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
        label: '是否异常',
        fieldName: 'isError',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: false,
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        label: '错误内容',
        fieldName: 'errorMessage',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
      },
      {
        component: 'DatePicker',
        label: '上次处理时间',
        fieldName: 'processTime',
        componentProps: () => {
          return {
            showTime: true,
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            format: 'YYYY-MM-DD HH:mm',
          };
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
      },
      {
        component: 'DatePicker',
        label: '下次处理时间',
        fieldName: 'nextProcessTime',
        componentProps: () => {
          return {
            showTime: true,
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            format: 'YYYY-MM-DD HH:mm',
          };
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
      },
      {
        component: 'InputNumber',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        label: '重试次数',
        fieldName: 'retryCount',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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
        submit: (params: any) => createConsumeLog(params),
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
          updateConsumeLog({
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
          await delConsumeLog(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleMessage({ id }: any) {
    messageModalRef.value?.modalApi
      .setData({
        title: '消息内容',
        submit: (params: any) =>
          updateContent({
            ...params,
            id,
          }),
      })
      .open();
    messageModalRef.value?.modalApi.setState({
      loading: true,
    });

    getContent(id)
      .then((data) => {
        messageModalRef.value?.formApi?.setFieldValue('content', data);
      })
      .finally(() => {
        messageModalRef.value?.modalApi.setState({
          loading: false,
        });
      });
  }

  function handleRetry() {}
  return {
    messageModalRef,
    modificationModalRef,
    formOption,
    messageFormOption,
    handleAdd,
    handleEdit,
    handleDel,
    handleMessage,
    handleRetry,
  };
}
