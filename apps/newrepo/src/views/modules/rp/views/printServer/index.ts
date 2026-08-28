import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { createReceiveLog, delReceiveLog, updateReceiveLog } from './api';
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
      dataTableId: '/datatable/data/page/rp.printServer',
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

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:md.warehouse?orgId={{orgId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        dependencies: {
          trigger(values) {
            const compRef =
              gridApi.formApi?.getFieldComponentRef?.('warehouseId');
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.orgId) {
                compRef.value?.formApi?.setFieldValue('warehouseId', undefined);
              }
              compRef.params.dependencies = {
                orgId: values.orgId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'warehouseId',
        label: '仓库',
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
        fieldName: 'name',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '名称',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'code',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '编码',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'ipAddress',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: 'IP地址',
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
        label: '是否启用',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: false,
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

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createReceiveLog(params),
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
          updateReceiveLog({
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
          await delReceiveLog(id);
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
