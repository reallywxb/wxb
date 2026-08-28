import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { clearCache, createMenu, delMenu, updateMenu, syncMenu } from './api';
import { usePrimaryGridOptions } from './gridOptions';
import { primarySearchFormOptions } from './searchFormOptions';
import { isEmpty } from '@vben/utils';

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
      dataTableId: '/datatable/data/page/sys.menu',
      showCellMenuIconBtn: true,
      showRadioRowTag: true,
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
        fieldName: 'id',
        label: '菜单编码',
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
        fieldName: 'label',
        label: '名称',
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
        fieldName: 'component',
        label: '页面',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'path',
        label: '路径',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'url',
        label: 'url',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'queryUrl',
        label: '待办url',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        defaultValue: 'ant-design:file-search-outlined',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'icon',
        label: '图标',
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
        fieldName: 'keepAlive',
        label: '保持页面状态',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: false,
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/sys.menu.openType',
          };
        },
        fieldName: 'openType',
        label: '打开方式',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Textarea',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'permissions',
        label: '按钮权限',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/pageDict/entity:sys.menu?isLeaf=false',
            pageSize: 200,
            paginate: true,
          };
        },
        fieldName: 'parentId',
        label: '父菜单ID',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },

      {
        label: '排序值',
        fieldName: 'sort',
        component: 'InputNumber',
        componentProps: {
          placeholder: '请输入',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: 0,
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
        fieldName: 'isLeaf',
        label: '叶子节点',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: false,
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
        fieldName: 'isHidden',
        label: '是否隐藏',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: false,
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
        fieldName: 'isSystem',
        label: '系统预置',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: false,
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
      // {
      //   component: 'Textarea',
      //   componentProps: {
      //     allowClear: true,
      //     placeholder: '请输入',
      //   },
      //   fieldName: 'remark',
      //   label: '备注',
      //   formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // },
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
    modificationModalRef.value?.formApi?.updateSchema([
      {
        fieldName: 'id',
        disabled: false,
      },
    ]);
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createMenu(params),
      })
      .open();
  }
  function handleEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    modificationModalRef.value?.formApi?.updateSchema([
      {
        fieldName: 'id',
        disabled: true,
      },
    ]);
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form: {
          id,
          ...form,
          icon: isEmpty(form?.icon) ? '' : form?.icon,
        },
        submit: (params: any) =>
          updateMenu({
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
          await delMenu(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleCache() {
    Modal.confirm({
      title: '提示',
      content: '确认清除菜单缓存吗?',
      centered: true,
      onOk: async () => {
        try {
          await clearCache();
          message.success('操作成功');
        } catch {}
      },
    });
  }

  function handleSyncMenu() {
    Modal.confirm({
      title: '提示',
      content: '确认同步菜单吗?',
      centered: true,
      onOk: async () => {
        try {
          await syncMenu();
          message.success('操作成功');
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
    handleCache,
    handleSyncMenu,
  };
}
