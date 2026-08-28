import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createMessageSubscribe,
  delMessageSubscribe,
} from '#/views/modules/sys/views/messageSubscribe/api/messageSubscribe.ts';

enum ModalMode {
  add,
  edit,
  view,
}

export function useCommonModal(gridApi: VxeGridApi) {
  const modificationModalRef = ref<
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
          dictUrl: '/sys/user/userDictList?orgId={{orgId}}',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
          triggerFields: ['orgId'],
        }),
        dependencies: {
          trigger(values: any) {
            const userIdRef =
              modificationModalRef.value?.formApi?.getFieldComponentRef(
                'userId',
              );
            if (userIdRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (userIdRef.params.dependencies.orgId) {
                modificationModalRef.value?.formApi?.setFieldValue(
                  'userId',
                  undefined,
                );
              }
              userIdRef.params.dependencies = {
                orgId: values.orgId,
              };
              userIdRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'userId',
        label: '用户',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/sys/org/pageOrgList',
          placeholder: '请选择',
          paginate: false,
        }),
        fieldName: 'messageOrgId',
        label: '消息机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/getDict/sys.message.messageType',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'messageType',
        label: '消息类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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
        fieldName: 'isActive',
        label: '有效状态',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createMessageSubscribe(params),
      })
      .open();
  }
  function handleEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params) =>
          createMessageSubscribe({
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
          await delMessageSubscribe(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  return {
    modificationModalRef,
    formOption,
    handleAdd,
    handleEdit,
    handleDel,
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
