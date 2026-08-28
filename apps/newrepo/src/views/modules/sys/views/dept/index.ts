import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createDept,
  deleteDept,
  updateDept,
} from '#/views/modules/sys/views/dept/api/dept.ts';

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
        fieldName: 'name',
        label: '部门名称',
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
        fieldName: 'code',
        label: '部门编码',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        componentProps: () => {
          return {
            disabled: formMode.value === ModalMode.view,
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          apiType: 'post',
          dictUrl: '/datatable/data/page/sys.dept',
          placeholder: '请选择',
          paginate: false,
          labelField: 'name',
          valueField: 'id',
          disabled: formMode.value === ModalMode.view,
        }),
        fieldName: 'parentId',
        label: '上级部门',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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
          createDept({
            ...params,
            isActive: true,
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
          updateDept({
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
          await deleteDept(id);
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
