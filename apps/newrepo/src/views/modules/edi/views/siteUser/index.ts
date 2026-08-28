import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, reactive, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import {
  createSiteUser,
  createSiteUserMap,
  delSiteUser,
  delSiteUserMap,
  updateSiteUser,
  updateSiteUserMap,
} from './api';
import { usePrimaryGridOptions, useSubGridOptions } from './gridOptions';
import { primarySearchFormOptions } from './searchFormOptions';

enum ModalMode {
  add,
  edit,
  view,
}

export function useGrid() {
  const parentTableParams = reactive({
    siteUserId: '',
  });

  // 主表
  const [Grid, gridApi] = useCommonGrid(
    {
      formOptions: primarySearchFormOptions,
      gridOptions: usePrimaryGridOptions(),
      gridEvents: {
        radioChange({ row }: any) {
          parentTableParams.siteUserId = row?.id;

          subGridApi?.query();
        },
      },
    },
    {
      dataTableId: '/datatable/data/page/edi.siteUser',
    },
  );

  // 子表
  const [SubGrid, subGridApi] = useCommonGrid(
    {
      gridOptions: useSubGridOptions(),
    },
    {
      id: 'SubGrid',
      dataTableId: '/datatable/data/page/edi.siteUserMap',
      parentTableParams,
    },
  );

  return {
    Grid,
    gridApi,
    SubGrid,
    subGridApi,
    parentTableParams,
  };
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
          dictUrl: '/datatable/getDict/entity:edi.site',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'siteId',
        label: '站点',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/sys/org/orgList',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'openId',
        label: 'Open ID',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'code',
        label: '用户编码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'type',
        label: '用户类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
        defaultValue: 'default',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '姓名',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'nickName',
        label: '昵称',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'sex',
        label: '性别',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'country',
        label: '国家',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'province',
        label: '省',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'city',
        label: '城市',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'headImgUrl',
        label: '头像图片地址',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'language',
        label: '语言',
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
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-2',
  };
  const subFormOption = [
    {
      component: 'ChcSelect',
      componentProps: computed(() => ({
        dictUrl: '/sys/org/pageOrgList',
        placeholder: '请选择',
        paginate: false,
      })),
      fieldName: 'orgId',
      label: '机构',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: computed(() => ({
        dictUrl: '/datatable/pageDict/entity:sys.user',
        placeholder: '请选择',
        paginate: false,
      })),
      fieldName: 'userId',
      label: '系统用户',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: computed(() => ({
        dictUrl: '/datatable/getDict/entity:edi.site',
        placeholder: '请选择',
        paginate: false,
      })),
      fieldName: 'siteId',
      label: '站点',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      fieldName: 'siteUserId',
      label: '站点用户',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'userType',
      label: '用户类型',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
  ] as VbenFormProps['schema'];

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createSiteUser(params),
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
          updateSiteUser({
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
          await delSiteUser(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleSubAdd() {
    formMode.value = ModalMode.add;

    const record = gridApi.grid.getRadioRecord();

    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        form: {
          siteUserId: record.id,
        },
        submit: (params: any) =>
          createSiteUserMap({
            siteUserId: record.id,
            ...params,
          }),
      })
      .open();
  }
  function handleSubEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;

    const record = gridApi.grid.getRadioRecord();

    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑',
        form: {
          ...form,
          siteUserId: record.id,
        },
        submit: (params: any) =>
          updateSiteUserMap({
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
          await delSiteUserMap(id);
          message.success('操作成功');

          reloadSubGrid();
        } catch {}
      },
    });
  }

  function reloadSubGrid() {
    subGridApi.reload();
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
    reloadSubGrid,
  };
}
