import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  batchDeleteDictItemOrg,
  copyDict,
  createDictItemOrg,
  delDictItemOrg,
  updateDictItemOrg,
} from '#/views/modules/sys/views/dictItemOrg/api/dictOrg.ts';

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

  const dictCopyModalRef = ref<
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
        componentProps: computed(() => ({
          dictUrl: '/datatable/getDict/entity:sys.dept',
          placeholder: '请选择',
          paginate: false,
          afterFetch(data: any) {
            return { records: data };
          },
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
          dictUrl: '/datatable/dict/entity:sys.dict',
          placeholder: '请选择',
          paginate: false,
          afterFetch(data: any) {
            return { records: data };
          },
          onChange: () => {
            modificationModalRef.value?.formApi?.setFieldValue(
              'dictItemId',
              null,
            );
          },
        }),
        fieldName: 'dictId',
        label: '字典',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.dictItem?dictId={{dictId}}',
          placeholder: '请选择',
          afterFetch(data: any) {
            return { records: data };
          },
          paginate: false,
          triggerFields: ['dictId'],
        }),
        dependencies: {
          trigger(values) {
            const dictItemIdRef =
              modificationModalRef.value?.formApi?.getFieldComponentRef(
                'dictItemId',
              );
            if (dictItemIdRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (dictItemIdRef.params.dependencies.dictId) {
                modificationModalRef.value?.formApi?.setFieldValue(
                  'dictItemId',
                  undefined,
                );
              }

              dictItemIdRef.params.dependencies = {
                dictId: values.dictId,
              };
              dictItemIdRef.fetchApi();
            }
          },
          triggerFields: ['dictId'],
        },
        fieldName: 'dictItemId',
        label: '字典项',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'InputNumber',
        fieldName: 'sort',
        label: '序号',
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

  const dictCopyFormOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          afterFetch(data: any) {
            return { records: data };
          },
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.dict',
          placeholder: '请选择',
          paginate: false,
          afterFetch(data: any) {
            return { records: data };
          },
        }),
        fieldName: 'dictId',
        label: '字典',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
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

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createDictItemOrg(params),
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
          updateDictItemOrg({
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
      onOk: async () => {
        try {
          await delDictItemOrg(id);

          message.success('删除成功');
          gridApi.query();
        } catch {}
      },
    });
  }

  function handleCopyDict() {
    dictCopyModalRef.value?.modalApi
      .setData({
        title: '字典引入',
        submit: (params: any) => copyDict(params),
      })
      .open();
  }
  function batchDelete() {
    const selectRows = gridApi.grid.getCheckboxRecords();

    if (selectRows.length === 0) {
      message.error('请选择记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确认批量删除${selectRows.length}条记录吗?`,
      onOk: async () => {
        try {
          await batchDeleteDictItemOrg(selectRows.map((item) => item.id));

          message.success('删除成功');
          gridApi.query();
        } catch {}
      },
    });
  }
  function clearSelection() {
    gridApi.grid.clearCheckboxRow();
  }

  return {
    dictCopyModalRef,
    dictCopyFormOption,
    modificationModalRef,
    formOption,
    handleAdd,
    handleEdit,
    handleDel,
    handleCopyDict,
    batchDelete,
    clearSelection,
  };
}
