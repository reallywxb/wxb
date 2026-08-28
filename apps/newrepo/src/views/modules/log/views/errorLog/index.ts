import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { createErrorLog, delErrorLog, getFileUrl, updateErrorLog } from './api';
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
      dataTableId: '/datatable/data/page/log.errorLog',
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
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'error',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '错误',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'classname',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '类名',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'method',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '方法名',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'params',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        label: '参数',
        labelClass: 'leading-2 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'createdByName',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '执行人名',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'clientId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '客户端',
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
        submit: (params: any) => createErrorLog(params),
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
          updateErrorLog({
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
          await delErrorLog(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleFile({ id }: any) {
    getFileUrl(id).then((data) => {
      window.open(data, '_blank');
    });
  }

  return {
    modificationModalRef,
    formOption,
    handleAdd,
    handleEdit,
    handleDel,
    handleFile,
  };
}
