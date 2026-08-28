import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { message, Modal } from 'ant-design-vue';

import {
  createUser,
  createUserRole,
  delUser,
  delUserRole,
  updateUser,
  updateUserRole,
} from '#/views/modules/sys/views/user.old/api/user.ts';

enum ModalMode {
  add,
  edit,
  view,
}

const userStore = useUserStore();

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
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          disabled: formMode.value === ModalMode.view,
          apiType: 'post',
          dictUrl: '/datatable/data/page/sys.dept',
          placeholder: '请选择',
          paginate: false,
          labelField: 'name',
          valueField: 'id',
        })),
        fieldName: 'deptId',
        label: '部门',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '姓名',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        componentProps: () => {
          return {
            disabled: formMode.value === ModalMode.view,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'username',
        label: '登录名',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        componentProps: () => {
          return {
            disabled:
              formMode.value === ModalMode.view ||
              formMode.value === ModalMode.edit,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'password',
        label: '密码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        componentProps: () => {
          return {
            type: 'password',
            disabled:
              formMode.value === ModalMode.view ||
              formMode.value === ModalMode.edit,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'code',
        label: '用户编码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        componentProps: () => {
          return {
            disabled: formMode.value === ModalMode.view,
          };
        },
      },
      {
        component: 'Select',
        fieldName: 'sex',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '性别',
        componentProps: () => {
          return {
            allowClear: true,
            options: [
              { label: '男', value: 1 },
              { label: '女', value: 2 },
            ],
            disabled: formMode.value === ModalMode.view,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'mobile',
        label: '手机',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        rules: 'required',
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

  const subFormOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          apiType: 'post',
          dictUrl: '/datatable/data/page/sys.role',
          placeholder: '请选择',
          paginate: false,
          labelField: 'name',
          valueField: 'id',
        }),
        fieldName: 'roleId',
        label: '角色',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        rules: 'required',
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
          createUser({
            ...params,
            dataScope: '1',
            isActive: true,
            userType: 'system',
            orgId: userStore.userInfo?.orgId,
          }),
      })
      .open();
  }
  function handleEdit(form: any) {
    formMode.value = ModalMode.edit;
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params: any) =>
          updateUser({
            ...form,
            ...params,
          }),
      })
      .open();
  }

  function handleView(form: any) {
    formMode.value = ModalMode.view;
    modificationModalRef.value?.modalApi
      .setData({
        title: '查看 ',
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
          await delUser(id);
          message.success('删除成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleSubAdd(userId: string) {
    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增 ',
        submit: (params: any) =>
          createUserRole({
            userId,
            orgId: userStore.userInfo?.orgId,
            ...params,
          }),
      })
      .open();
  }
  function handleSubEdit({ id, userId, roleId }: any) {
    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form: {
          roleId,
        },
        submit: (params: any) =>
          updateUserRole({
            id,
            userId,
            orgId: userStore.userInfo?.orgId,
            ...params,
          }),
      })
      .open();
  }
  function handleSubDel({ id }: any) {
    Modal.confirm({
      title: '删除',
      content: '确定要删除该条数据吗？',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delUserRole(id);
          message.success('删除成功');

          subGridApi.reload();
        } catch {}
      },
    });
  }

  return {
    modificationModalRef,
    subModificationModalRef,
    formOption,
    subFormOption,
    handleAdd,
    handleEdit,
    handleView,
    handleDel,

    handleSubAdd,
    handleSubEdit,
    handleSubDel,
  };
}
