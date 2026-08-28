import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createPos,
  createPosRole,
  delPos,
  delPosRole,
  updatePos,
  updatePosRole,
} from '#/views/modules/sys/views/position/api/position.ts';

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
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'code',
        label: '岗位编码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '岗位名称',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/sys.position.positionType',
          placeholder: '请选择',
          paginate: false,
          allowClear: true,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'positionType',
        label: '岗位类别',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
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
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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
        submit: (params: any) => createPos(params),
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
          updatePos({
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
          await delPos(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  const subFormOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/sys/user/orgEditRoleList/{{orgId}}',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
          triggerFields: ['orgId'],
        }),
        dependencies: {
          trigger(values) {
            const roleIdRef =
              subModificationModalRef.value?.formApi?.getFieldComponentRef(
                'roleId',
              );
            if (roleIdRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (roleIdRef.params.dependencies.orgId) {
                subModificationModalRef.value?.formApi?.setFieldValue(
                  'roleId',
                  undefined,
                );
              }
              roleIdRef.params.dependencies = {
                orgId: values.orgId,
              };
              roleIdRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'roleId',
        label: '角色',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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

  function handleSubAdd() {
    formMode.value = ModalMode.add;
    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createPosRole(params),
      })
      .open();
  }
  function handleSubEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑',
        form,
        submit: (params: any) =>
          updatePosRole({
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
          await delPosRole(id);
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
