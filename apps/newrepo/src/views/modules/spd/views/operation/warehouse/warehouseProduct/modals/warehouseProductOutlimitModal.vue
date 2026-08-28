<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { onMounted, ref, toRaw } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import { multiply } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { useSpdGrid } from '#/components/spd';

import { setOutLimit } from '../api';

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');

const handleOutLimitQtyChange = (value: number) => {
  console.warn('handleOutLimitQtyChange value:', value);

  const tableData = chcGridApi.grid.getTableData().fullData || [];
  console.warn('handleOutLimitQtyChange tableData', tableData);
  const unProxyTableData = toRaw(tableData).map((item) => {
    return {
      ...item,
      outLimitQty: multiply(value, item.outLimitQtyPercent),
    };
  });
  chcGridApi.grid.reloadData(unProxyTableData);
};

// 基本信息的表单配置
const baseFormSchemas: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'warehouseName',
    label: '仓库',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '药品名称',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productCode',
    label: '药品编码',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productSpec',
    label: '规格',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'manufacturer',
    label: '厂家',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'uomName',
    label: '单位',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'storageQty',
    label: '当前库存',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'inPoQty',
    label: '采购未完结数量',
    labelClass: 'w-[120px]',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'outLimitQty',
    label: '出库限量',
    componentProps: () => {
      return {
        placeholder: '',
        maxLength: 50,
        onChange: handleOutLimitQtyChange,
      };
    },
  },
  // {
  //   component: 'InputNumber',
  //   componentProps: {
  //     allowClear: true,
  //     placeholder: '请输入标准差系数',
  //     maxlength: 10,
  //     triggerFields: ['calculateMethod'],
  //   },
  //   fieldName: 'standardDiviationRatio',
  //   label: '标准差系数',
  //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
  //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
  //   dependencies: {
  //     triggerFields: ['calculateMethod'],
  //     disabled(values) {
  //       const calculateMethod = values.calculateMethod;
  //       if (calculateMethod === 'A' || calculateMethod === 'V') {
  //         return true;
  //       }
  //       if (calculateMethod === 'L') {
  //         return false;
  //       }
  //       return false;
  //     },
  //     trigger(values) {
  //       console.warn('标准差系数 trigger values', values);
  //       if (values.calculateMethod === 'A' || values.calculateMethod === 'V') {
  //         cuFormApi.setFieldValue('standardDiviationRatio', '');
  //       }
  //     },
  //   },
  // },
];

// 基本信息
const [BaseForm, BaseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  schema: baseFormSchemas,
  wrapperClass: 'grid-cols-2',
});
const EDITABLE_FIELDS = new Set(['outLimitQtyPercent']);

const handleEditActivated = (scope: any) => {
  console.warn('handleEditActivated scope:', scope);
};
const handleEditClosed = async (scope: any) => {
  console.warn('handleEditClosed scope:', scope);
  const formValues = await BaseFormApi.getValues();
  const outLimitQtyPercent = scope.row.outLimitQtyPercent;
  const outLimitQty = formValues.outLimitQty;
  console.warn('handleEditClosed outLimitQtyPercent:', outLimitQtyPercent);
  console.warn('handleEditClosed outLimitQty:', outLimitQty);
  if (outLimitQty && outLimitQtyPercent) {
    scope.row.outLimitQty = multiply(outLimitQty, outLimitQtyPercent);
  }
};
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: {
      seqConfig: {
        seqMethod: ({ rowIndex }: any) => rowIndex + 1,
        startIndex: 1,
      },
      editConfig: {
        trigger: 'click',
        mode: 'cell',
      },
      cellStyle: ({ column }: { column: any }) => {
        if (EDITABLE_FIELDS.has(column.field)) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      columns: [
        {
          title: '序号',
          type: 'seq',
          width: 40,
          align: 'center',
          sortable: false,
          // formatter(scope: any) {
          //   return scope.rowIndex + 1;
          // },
        },

        {
          field: 'warehouseName',
          minWidth: 200,
          title: '药房',
          sortable: true,
        },
        {
          field: 'storageQty',
          minWidth: 120,
          title: '当前库存',
          sortable: true,
        },

        {
          field: 'lastMonthConsumeQty',
          minWidth: 120,
          title: '上月消耗',
          sortable: true,
        },
        {
          field: 'outLimitQtyPercent',
          minWidth: 120,
          title: '出库占比',
          sortable: true,
          editRender: {
            name: 'VxeNumberInput',
            props: {},
            events: {},
          },
        },
        {
          field: 'outLimitQty',
          minWidth: 150,
          title: '出库限量',
          sortable: true,
        },
      ],
      proxyConfig: {
        autoLoad: true,
      },
      // 取消分页
      pagerConfig: {
        enabled: false,
      },
    },
    // 添加表格事件监听
    gridEvents: {
      editActivated: handleEditActivated,
      editClosed: handleEditClosed,
    },
  },
  {
    dataTableId: '/warehouseAction/queryOutLimit.do',
    id: 'outLimitTable',
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return {
        ...params,
        replenishId: modalData.value.row.replenishId,
      };
    },
    // tableSearchExtraParams: selectParams.value,
    afterFetchFn: (params) => {
      BaseFormApi.setValues({
        storageQty: params.replenishData.storageQty,
        inPoQty: params.replenishData.notCompleteQty,
        outLimitQty: params.replenishData.outLimitQty || undefined,
      });
      return {
        ...params,
        records: params.yfReplenishRows,
      };
    },
  },
);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '提交',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle;
      setTimeout(() => {
        BaseFormApi.setValues({
          warehouseName: modalData.value.row.warehouseName,
          productName: modalData.value.row.productName,
          productCode: modalData.value.row.productCode,
          productSpec: modalData.value.row.productSpec,
          manufacturer: modalData.value.row.manufacturer,
          uomName: modalData.value.row.uomName,
        });
        chcGridApi.query({
          replenishId: modalData.value.row.replenishId,
        });
      }, 100);
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const formValues = await BaseFormApi.getValues();
    const tableData = chcGridApi.grid.getTableData().tableData || [];
    console.warn('tableData', tableData);
    console.warn('formValues', formValues);
    const params = {
      replenishId: modalData.value.row.replenishId,
      outLimitQty: formValues.outLimitQty,
      lineData: JSON.stringify(tableData),
    };

    const result = await setOutLimit(params);
    if (result && result.success) {
      message.success('操作成功');
      modalApi.close();
      modalData.value?.callback();
    } else {
      message.error(result.msg || '设置失败');
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[600px] w-[800px]">
    <BaseForm />
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
.form-title {
  margin-bottom: 20px;
  padding: 0 10px;
  font-size: 20px;
  font-weight: 500;
}
</style>
