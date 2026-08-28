import type { Ref } from 'vue';

import type { ExtendedModalApi } from '@vben/common-ui';

import type { VbenFormProps } from '@vben-core/form-ui';

import { reactive, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { deleteProductType, queryTypeTree, saveProductType } from '../api';
import commonFormModalComp from '../common/modals/commonFormModal.vue';

export function useTree() {
  const treeData = ref();
  const currentCategory = ref<
    | undefined
    | {
        id: string;
        text: string;
      }
  >();

  const tableSearchExtraParams = reactive<{
    parValue?: string;
  }>({});

  function queryTree() {
    return queryTypeTree(undefined, {
      value: 'ProductType',
      limit: 10_000,
    }).then(({ rows }) => {
      for (const row of rows) {
        if (!row.pid) {
          continue;
        }
        const parent = rows.find(({ id }) => id === row.pid);

        if (!parent) continue;

        if (parent.children) {
          parent.children.push(row);
        } else {
          parent.children = [row];
        }
      }

      treeData.value = rows.filter(({ pid }) =>
        rows.every(({ id }) => id !== pid),
      );

      currentCategory.value = treeData.value[0];
    });
  }

  watch(
    () => currentCategory.value?.id,
    (newVal) => {
      tableSearchExtraParams.parValue = newVal;
      gridApi.query();
    },
  );

  const [Grid, gridApi] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        showCollapseButton: false,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        radioConfig: {
          trigger: 'row',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'queryTypeList',
      // api地址
      queryUrl: 'dictHandleAction/queryLine.do?value=ProductType',
      gridColumns: [
        {
          type: 'radio',
          title: '',
          width: 50,
          align: 'center',
          visible: false,
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        { field: 'lineName', title: '名称', minWidth: '150', sortable: true },
        { field: 'lineCode', title: '编码', minWidth: '100', sortable: true },
        {
          field: 'created',
          title: '创建时间',
          minWidth: '140',
          sortable: true,
        },
        {
          field: 'seqNo',
          title: '排序',
          align: 'right',
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'description',
          title: '备注',
          minWidth: '150',
          sortable: true,
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'Input',
          fieldName: 'lineCode',
          label: '编码',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
      ],
      tableSearchExtraParams,
    },
  );

  function refresh() {
    queryTree();
    gridApi.query();
  }

  return {
    Grid,
    gridApi,
    treeData,
    currentCategory,
    queryTree,
    refresh,
  };
}

export function useGrid(
  refresh: () => void,
  currentCategory: Ref<{ id: string; text: string }>,
  gridApi: any,
) {
  const [ModificationModal, modificationModalApi] = useVbenModal({
    class: 'w-[75%]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  /**
   * 页面弹窗表单配置
   */
  const formOptions: VbenFormProps = {
    commonConfig: {
      // 所有表单项
      componentProps: {
        class: 'w-[20vw]',
      },
    },
    layout: 'horizonal',
    schema: [
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区名称',
        },
        fieldName: 'parName', // 批准文号
        formItemClass: 'col-span-1',
        label: '父类名称',
        rules: 'required',
        disabled: true,
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入',
        },
        fieldName: 'lineName', // 批准文号
        formItemClass: 'col-span-1',
        label: '名称',
        rules: 'required',
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入',
        },
        fieldName: 'lineCode', // 批准文号
        formItemClass: 'col-span-1',
        label: '编码',
        rules: 'required', // TODO 禅道2173 去除必填校验 ===> 变更 ===> 为必填 label 改成 编码
      },
      {
        component: 'Input',
        componentProps: {
          placeholder: '请输入',
        },
        fieldName: 'description', // 批准文号
        formItemClass: 'col-span-1',
        label: '备注',
      },
      {
        component: 'Switch',
        fieldName: 'isActiveLine',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            checkedValue: 'Y',
            unCheckedValue: 'N',
            checkedChildren: '是',
            unCheckedChildren: '否',
            style: {
              width: '40px',
            },
          };
        },
        defaultValue: 'Y',
        label: '是否有效',
      },
      {
        component: 'InputNumber',
        fieldName: 'seqNo',
        formItemClass: 'col-span-1',
        label: '排序',
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

  function handleCreation() {
    modificationModalApi
      .setData({
        title: '添加类型',
        form: {
          parName: currentCategory.value.text,
        },
        submit: (params: any) => {
          return saveProductType({
            parentDictValue: currentCategory.value.id,
            ...params,
            type: 'add',
          });
        },
      })
      .open();
  }

  function handleModification() {
    const selectedRow = gridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const { description, dictLineId, lineCode, lineName, seqNo } = selectedRow;

    modificationModalApi
      .setData({
        title: '修改类型',
        form: {
          parName: currentCategory.value.text,
          lineName,
          lineCode,
          description,
          seqNo,
        },
        submit: (params: any) => {
          return saveProductType({
            dictLineId,
            ...params,
            type: 'edit',
          });
        },
      })
      .open();
  }

  function handleDel() {
    const selectedRow = gridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确认删除吗？`,
      onOk: async () => {
        try {
          await deleteProductType({ dictLineId: selectedRow.dictLineId });

          message.success('删除成功');

          refresh();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  return {
    ModificationModal,
    formOptions,
    handleCreation,
    handleModification,
    handleDel,
  };
}

export function useImportModal() {
  const importModalRef = ref<ExtendedModalApi | undefined>();
  const templateUrl = new URL(
    '#/assets/excels/producttype.xls',
    import.meta.url,
  ).toString();

  return {
    importModalRef,
    templateUrl,
  };
}
