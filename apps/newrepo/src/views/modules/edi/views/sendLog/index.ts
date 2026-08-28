import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { createSendLog, delSendLog, updateSendLog } from './api';
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
      dataTableId: '/datatable/data/page/edi.sendLog',
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
        fieldName: 'requestTime',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '调用时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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
        fieldName: 'serviceUrl',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '接口地址',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/dict/itemList/edi.log.serviceType',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'serviceType',
        label: '接口类型',
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
        fieldName: 'serviceName',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '接口名称',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'msgNo',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '消息编号',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },

      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'parameter',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '调用参数',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'result',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '返回结果',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'messageOutId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '出站消息',
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
        fieldName: 'isSuccess',
        label: '是否成功',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: false,
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'errorMsg',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '错误信息',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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
        submit: (params: any) => createSendLog(params),
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
          updateSendLog({
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
          await delSendLog(id);
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
            ? updateMessageInBody(params)
            : createMessageInBody({
                ...params,
                messageInId: row.id,
              });
        },
      })
      .open();
    messageModalRef.value?.modalApi.setState({
      loading: true,
    });

    getMessageInBody({
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
