import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createMessage,
  createMessageUser,
  delMessage,
  delMessageUser,
  updateMessage,
  updateMessageUser,
} from '#/views/modules/sys/views/message/api/message.ts';

enum ModalMode {
  add,
  edit,
  view,
}

export function useCommonModal(gridApi: VxeGridApi, subGridApi: VxeGridApi) {
  const modificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const subModificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'DatePicker',
        componentProps: () => ({
          showTime: { format: 'HH:mm' },
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm',
        }),
        fieldName: 'messageTime',
        label: '消息时间',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/sys/org/pageOrgList',
          placeholder: '请选择',
          onChange: () => {
            modificationModalRef.value?.formApi?.setFieldValue('userId', null);
          },
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/sys/message/getMessageTypeDictList',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        }),
        fieldName: 'messageType',
        label: '消息类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/getDict/sys.message.messageGroup',
          placeholder: '请选择',
          allowClear: true,
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'messageGroup',
        label: '消息分组',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        fieldName: 'content',
        label: '消息内容',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'url',
        label: 'PC端链接地址',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        labelWidth: 120,
      },

      {
        component: 'Input',
        fieldName: 'url',
        label: '移动端链接地址',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        labelWidth: 120,
      },

      {
        component: 'InputNumber',
        fieldName: 'readCount',
        label: '阅读数',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },

      {
        component: 'Input',
        fieldName: 'sender',
        label: '发送人',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'source',
        label: '消息来源',
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
  const subFormOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/entity:sys.user',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        }),
        fieldName: 'userId',
        label: '用户',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
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
        fieldName: 'isRead',
        label: '是否已阅',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: false,
        rules: 'required',
      },
      {
        component: 'DatePicker',
        componentProps: () => ({
          showTime: { format: 'HH:mm' },
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm',
        }),
        fieldName: 'readTime',
        label: '阅读时间',
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

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params) => createMessage(params),
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
          updateMessage({
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
          await delMessage(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleSubAdd() {
    formMode.value = ModalMode.add;
    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params) => createMessageUser(params),
      })
      .open();
  }
  function handleSubEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params: any) =>
          updateMessageUser({
            ...params,
            id,
          }),
      })
      .open();
  }

  function handleSubDel({ id }: any) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delMessageUser(id);
          message.success('操作成功');

          subGridApi.reload();
        } catch {}
      },
    });
  }

  return {
    subModificationModalRef,
    modificationModalRef,
    formOption,
    subFormOption,
    handleAdd,
    handleEdit,
    handleDel,
    handleSubAdd,
    handleSubEdit,
    handleSubDel,
  };
}

export function usePermissionModal() {
  const permissionModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  function handlePermission() {
    permissionModalRef.value?.modalApi.setData({}).open();
  }

  return {
    permissionModalRef,
    handlePermission,
  };
}
