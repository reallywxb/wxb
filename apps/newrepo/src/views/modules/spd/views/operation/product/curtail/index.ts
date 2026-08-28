import type { ExtendedModalApi, VbenFormProps } from '@vben/common-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { saveCurtail } from '#/views/modules/spd/views/operation/product/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';

export function useGrid() {
  // 父表
  const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        showCollapseButton: false,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        checkboxConfig: {
          trigger: 'row',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'curtail',
      // api地址
      queryUrl: `productAction/queryCurtail.do`,
      gridColumns: [
        {
          type: 'checkbox',
          title: '',
          width: 50,
          align: 'center',
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'productCode',
          title: '药品编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'manufacturer',
          title: '生产厂家',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '采购单位',
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'markCode',
          title: '省标编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'qty',
          title: '限购数量',
          edit: 'number',
          verify: 'number|required',
          minWidth: 90,
          align: 'right',
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'Input',
          fieldName: 'productName',
          label: '商品',
          componentProps: () => {
            return {
              placeholder: `编码/搜索码/名称`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'markCode',
          label: '省标编码',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'Select',
          componentProps: {
            options: [
              { value: '', label: '全部' },
              {
                label: '是',
                value: 'Y',
              },
              {
                label: '否',
                value: 'N',
              },
            ],
            placeholder: '请选择',
          },
          defaultValue: '',
          fieldName: 'isSet',
          label: '已设限量',
        },
      ],
      beforeFetchFn: ({ isActive, ...extra }) => {
        return {
          ...extra,
          isActive: isActive ? 'Y' : null,
        };
      },
    },
  );

  return {
    handleExport,
    ParentGrid,
    parentGridApi,
  };
}
export function useModificationModal({ parentGridApi }: any) {
  const [ModificationModal, modificationModalApi] = useVbenModal({
    class: 'w-[400px] h-[300px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  const modificationFormOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        label: '限购数量',
        component: 'InputNumber',
        fieldName: 'qty',
        formItemClass: 'col-span-12',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-12',
  };

  function handleBatchModification() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    modificationModalApi
      .setData({
        title: '批量修改',
        form: {
          qty: 0,
        },
        submit: (parasm: any) =>
          saveCurtail({
            ids: JSON.stringify(selectedRows.map(({ productId }) => productId)),
            ...parasm,
          }),
      })
      .open();
  }
  function handleReset() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确认重置数量？`,
      onOk: async () => {
        try {
          await saveCurtail({
            ids: JSON.stringify(selectedRows.map(({ productId }) => productId)),
            qty: '',
          });

          message.success('重置成功');

          parentGridApi.query();
        } catch {
          message.error('重置失败');
        }
      },
    });
  }

  return {
    modificationFormOptions,
    ModificationModal,
    handleBatchModification,
    handleReset,
  };
}

export function useImportModal() {
  const importModalRef = ref<ExtendedModalApi | undefined>();
  const templateUrl = new URL(
    '#/assets/excels/curtail.xls',
    import.meta.url,
  ).toString();

  return {
    importModalRef,
    templateUrl,
  };
}
