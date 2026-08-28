import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { createNotice, delNotice, updateNotice } from './api';
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
      dataTableId: '/datatable/data/page/edi.notice',
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
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD HH:mm',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
        fieldName: 'noticeTime',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '通知时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/entity:edi.site',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteId',
        label: '站点',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/entity:edi.siteUser',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteUserId',
        label: '站点用户',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/entity:sys.user',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'userId',
        label: '系统用户',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/entity:edi.noticeTemplate',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'noticeTemplateId',
        label: '通知模板',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'Textarea',
        fieldName: 'content',
        label: '内容',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        fieldName: 'params',
        label: '参数',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'priority',
        label: '优先级',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/edi.notice.processStatus',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'processStatus',
        label: '处理状态',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'Textarea',
        fieldName: 'processMsg',
        label: '处理消息',
        componentProps: {
          placeholder: '请输入',
        },
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
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: true,
      },
      {
        component: 'InputNumber',
        fieldName: 'retryCount',
        label: '重试次数',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD HH:mm',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
        fieldName: 'lastProcessTime',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '上次处理时间',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD HH:mm',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        },
        fieldName: 'nextProcessTime',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        label: '下次处理时间',
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
        submit: (params: any) => createNotice(params),
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
          updateNotice({
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
          await delNotice(id);
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
