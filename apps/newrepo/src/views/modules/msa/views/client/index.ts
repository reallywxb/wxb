import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { createClient, delClient, updateClient } from './api';
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
      dataTableId: '/datatable/data/page/sys.client',
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
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        label: '客户端编号',
        fieldName: 'clientCode',
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
        label: '回调地址',
        fieldName: 'webServerRedirectUri',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        label: '客户端密钥',
        fieldName: 'clientSecret',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/sys.client.authorizedGrantType',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          mode: 'multiple',
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '授权方式',
        fieldName: 'authorizedGrantTypes',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/sys.client.scope',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          mode: 'multiple',
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '作用域',
        fieldName: 'scopes',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/sys.client.resource',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          mode: 'multiple',
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '授权资源',
        fieldName: 'resourceIds',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/sys.client.authority',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          mode: 'multiple',
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '权限',
        fieldName: 'authorities',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/sys.client.scope',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          mode: 'multiple',
          afterFetch: (records: any[]) => ({ records }),
        }),
        label: '自动授权作用域',
        fieldName: 'autoApproveScopes',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },

      {
        label: '令牌有效期(s)',
        fieldName: 'accessTokenValidity',
        component: 'InputNumber',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        label: '更新令牌有效期(s)',
        fieldName: 'refreshTokenValidity',
        component: 'InputNumber',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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
        submit: (params: any) => createClient(params),
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
          updateClient({
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
          await delClient(id);
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
