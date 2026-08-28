import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createTenant,
  delTenant,
  updateTenant,
} from '#/views/modules/sys/views/tenant/api/tenant.ts';

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
    layout: 'vertical',
    schema: [
      {
        component: 'Input',
        fieldName: 'code',
        label: '租户编码',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '租户名称',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Switch',
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        defaultValue: false,
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
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
        submit: (params: any) => createTenant(params),
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
          updateTenant({
            ...params,
            id,
          }),
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
          await delTenant(id);
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
    handleDel,
  };
}
