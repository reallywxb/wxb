import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';
import type { ExtendedVxeGridApi } from '@vben/plugins/src/vxe-table/types.ts';

import { ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { message, Modal } from 'ant-design-vue';

import {
  createRole,
  delRole,
  saveMenuAuthTree,
  updateRole,
} from '#/views/modules/sys/views/role/api/role.ts';

enum ModalMode {
  add,
  edit,
  view,
}

const userStore = useUserStore();
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
    layout: 'vertical',
    schema: [
      {
        component: 'Input',
        fieldName: 'name',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '角色名称',
        componentProps: () => {
          return {
            disabled: formMode.value === ModalMode.view,
          };
        },
        rules: 'required',
      },
      {
        label: '下级机构可见',
        fieldName: 'isPublic',
        component: 'Switch',
        componentProps: {
          class: 'w-[50px]',
        },
        defaultValue: false,
        rules: 'required',
      },

      {
        label: '是否有效',
        fieldName: 'isActive',
        component: 'Switch',
        componentProps: {
          class: 'w-[50px]',
        },
        defaultValue: true,
        rules: 'required',
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '角色描述',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        componentProps: () => {
          return {
            disabled: formMode.value === ModalMode.view,
          };
        },
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
        submit: (params: any) =>
          createRole({
            ...params,
            isActive: true,
            orgId: userStore.userInfo?.orgId,
          }),
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
          updateRole({
            ...params,
            id,
          }),
      })
      .open();
  }

  function handleView(form: any) {
    formMode.value = ModalMode.view;
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
      })
      .open();
  }

  function handleDel({ id }: any) {
    Modal.confirm({
      title: '删除',
      content: '确定要删除该条数据吗？',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delRole(id);
          message.success('删除成功');

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
    handleView,
    handleDel,
  };
}

export function usePermissionModal() {
  const permissionModalRef = ref<
    | (Record<string, any> & {
        gridApi?: ExtendedVxeGridApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  function handlePermission({ id }: any) {
    permissionModalRef.value?.modalApi
      .setData({
        title: '权限设置',
        data: {
          id,
        },
        submit: async (params: Array<any>) => saveMenuAuthTree(id, params),
      })
      .open();
  }

  return {
    permissionModalRef,
    handlePermission,
  };
}
