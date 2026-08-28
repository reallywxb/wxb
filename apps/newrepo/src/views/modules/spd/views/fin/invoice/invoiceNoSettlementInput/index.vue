<script setup lang="ts">
import type { InvoiceTableRow } from './api';

import { onMounted, ref, toRaw } from 'vue';

import { SvgBatchJobIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { cloneDeep, isFunction, isObject } from '@vben/utils';

import { Button, InputNumber, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

// import { useRoute } from 'vue-router';
import BatchSetModalComp from './batchSetModal.vue';
import { formSchema } from './options';

const extParams = ref<any>({});

const departmentId = ref<number | string | undefined>(undefined);

const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

// 辅助函数
function resolvePropsFn(cp: any): () => any {
  return isFunction(cp) ? cp : () => (isObject(cp) ? cp : {});
}

// 处理表单院区和仓库级联
const handleFormSchema = () => {
  // 深拷贝
  const schema = cloneDeep(formSchema);
  schema?.forEach((item: any) => {
    if (item.fieldName === 'departmentId') {
      // 保存原始的 componentProps 函数
      const baseFn = resolvePropsFn(item.componentProps);
      console.warn('baseFn=====>', baseFn);
      // 始终保持 componentProps 为“函数返回对象”
      item.componentProps = () => {
        // 执行原始函数获取基础props
        const props = baseFn() as any;
        const originalOnChange = props?.onChange;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props,
          onChange: (val: any, ...rest: any[]) => {
            departmentId.value = val; // 更新响应式变量
            isFunction(originalOnChange) && originalOnChange(val, ...rest);
          },
          afterFetch: (res: any, ...rest: any[]) => {
            // 首次没选院区时，让仓库下拉拿 -1/-1 的全量
            // const hasGetRef =
            //   chcGridApi.formApi?.getFieldComponentRef &&
            //   typeof chcGridApi.formApi?.getFieldComponentRef === 'function';
            // if (!departmentId.value && hasGetRef) {
            //   const warehouseSelectRef =
            //     chcGridApi.formApi.getFieldComponentRef('warehouseId');
            //   if (warehouseSelectRef && warehouseSelectRef.params) {
            //     warehouseSelectRef.params.dependencies = {
            //       regionId: -1,
            //       departmentId: -1,
            //     };
            //     warehouseSelectRef.fetchApi(); // 触发仓库选择器重新获取数据
            //   }
            // }
            return isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
          },
        };
      };
    }
    if (item.fieldName === 'warehouseId') {
      // 保存原始的 componentProps 函数
      const baseFn = resolvePropsFn(item.componentProps);
      item.componentProps = () => {
        // 执行原始函数获取基础props
        const props = baseFn() as any;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props, // 展开所有原始props
          afterFetch: (res: any, ...rest: any[]) => {
            if (res.rows?.length) {
              const firstOption = res.rows[0];
              chcGridApi.formApi?.setFieldValue('warehouseId', firstOption.id);
            }
            return isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
          },
        };
      };
    }
  });
  return schema;
};

const [ChcGrid, chcGridApi, { BatchSetModal, batchSetModalApi }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [
        ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
      ],
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      compact: true,
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      editConfig: {
        enabled: true,
        trigger: 'click',
        mode: 'row',
        autoClear: false,
      },
      // virtualYConfig: {
      //   enabled: false,
      // },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
      cellStyle(scope: any) {
        if (scope.column.field === 'qtyInvoiced') {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        if (
          scope.column.field === 'qtyArrived' ||
          scope.column.field === 'lineAmtInvoice'
        ) {
          return {
            color: 'red',
          };
        }
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {
        chcGridApi.grid.clearEdit();
      },
      // 全选/全不选事件
      checkboxAll: () => {
        chcGridApi.grid.clearEdit();
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
      },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'checkbox',
        title: '多选',
        width: 50,
        align: 'center',
        fixed: 'left',
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'ProductFullName',
        title: '药品名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'qtyArrived',
        title: '待开票数量',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmtInvoiceLeft',
        title: '待开票金额',
        minWidth: '100',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          // 待开票金额 = 待开票数量 * 采购价
          return handlePriceToFixedTwo(row.qtyArrived * row.priceActual);
        },
      },
      {
        field: 'qtyInvoiced',
        title: '本次开票数量',
        minWidth: '140',
        align: 'right',
        sortable: true,
        editRender: {},
        slots: {
          edit: 'qtyInvoiceEdit',
        },
      },
      {
        field: 'lineAmtInvoice',
        title: '本次开票金额',
        minWidth: '130',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          // 本次开票金额 = 本次开票数量 * 采购价
          return handlePriceToFixedTwo(row.qtyInvoiced * row.priceActual);
        },
      },
      {
        field: 'priceActual',
        title: '采购价',
        minWidth: '70',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceActual);
        },
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productName',
        minWidth: 100,
        sortable: true,
        title: '品牌',
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'description',
        minWidth: '150',
        title: '备注',
      },
    ],
    formSchema: handleFormSchema(),
    queryUrl: '/asnAction/queryMaterialLine',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'invoiceNoSettlementInput',
    autoSelectFirstRow: true,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'BatchSetModal-batchSetModalApi': {
        // 连接抽离的组件
        connectedComponent: BatchSetModalComp,
      },
    },
  },
);

const createInvoiceFormData = ref<any>({
  bpartnerId: undefined,
  warehouseId: undefined,
  invoiceAmt: undefined,
  lineData: undefined,
});

// 创建发票
const createInvoice = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  console.warn('createInvoice_records:', records);
  if (!records || records.length === 0) {
    return message.warning('请选择一条记录');
  }
  // 校验
  const validationResult = validateRecords(records);
  if (!validationResult.success) {
    message.error(validationResult.errorMsg);
    return;
  }
  // 计算
  const { totalAmt, lineItems } = calculateInvoiceData(records);
  if (totalAmt === 0) {
    message.error('开票金额不可为0');
    return;
  }
  const createInvoiceParam = {
    bpartnerId: records[0]?.bpartnerId,
    warehouseId: records[0]?.warehouseId,
    invoiceAmt: totalAmt.toFixed(2),
    lineData: JSON.stringify({
      created: lineItems || [],
    }),
  };
  createInvoiceFormData.value = JSON.generalParse(
    JSON.stringify(createInvoiceParam),
  );
  console.warn('createInvoice_param:', createInvoiceParam);
  batchSetModalApi
    ?.setData({
      data: createInvoiceFormData.value,
      callback() {
        chcGridApi.query();
      },
    })
    .open();
};

// 辅助函数: 批量校验
const validateRecords = (records: InvoiceTableRow[]) => {
  let warehouseId = 0;
  let bpartnerId = 0;
  for (const [i, record] of records.entries()) {
    const item = record as InvoiceTableRow;
    // 校验数量
    const qtyError = validateQty(item);
    if (qtyError) {
      return {
        success: false,
        errorMsg: `第${i + 1}行 ${qtyError}`,
      };
    }
    // 校验客户一致性
    if (warehouseId === 0) {
      warehouseId = item.warehouseId;
    } else if (warehouseId !== item.warehouseId) {
      return {
        success: false,
        errorMsg: '不可跨仓库开票',
      };
    }

    // 校验供应商一致性
    if (bpartnerId === 0) {
      bpartnerId = item.bpartnerId;
    } else if (bpartnerId !== item.bpartnerId) {
      return {
        success: false,
        errorMsg: '不可以跨供应商开票',
      };
    }
  }

  return {
    success: true,
    warehouseId,
    bpartnerId,
  };
};

// 辅助函数2: 计算金额(不包含折后开票金额)
const calculateInvoiceData = (records: InvoiceTableRow[]) => {
  let totalAmt = 0;
  const lineItems: Array<{
    asnLineId: number | string;
    qtyInvoiced: number | string;
  }> = [];

  records.forEach((item) => {
    // 计算行金额
    const lineAmtInvoice = Number(
      ((item.qtyInvoiced || 0) * (item.priceActual || 0)).toFixed(2),
    );

    // 累加总金额
    totalAmt = Number((totalAmt + lineAmtInvoice).toFixed(2));

    // 收集行数据
    lineItems.push({
      asnLineId: item.asnLineId,
      qtyInvoiced: item.qtyInvoiced,
    });
  });

  return {
    totalAmt,
    lineItems,
  };
};

// 验证数量的逻辑
// const validateQty = (editRecord: InvoiceTableRow): string => {
//   let msg = '';
//   const qtyAvailable = editRecord.qtyArrived
//     ? Number(editRecord.qtyArrived)
//     : 0;

//   if (Number.isNaN(Number(editRecord.qtyInvoiced))) {
//     msg = '请输入本次开票数量';
//   } else if (qtyAvailable >= 0) {
//     if (Number(editRecord.qtyInvoiced || 0) <= 0) {
//       msg = '开票数量必须大于0';
//     } else if (qtyAvailable < Number(editRecord.qtyInvoiced || 0)) {
//       msg = '开票数量超过可开票数量';
//     }
//   } else if (qtyAvailable < 0) {
//     if (Number(editRecord.qtyInvoiced || 0) >= 0) {
//       msg = '开票数量必须小于0';
//     } else if (qtyAvailable > Number(editRecord.qtyInvoiced || 0)) {
//       msg = '开票数量超过可开票数量';
//     }
//   }

//   return msg;
// };

// 优化上述校验逻辑 避免大量if-else 嵌套
type Validator = (record: InvoiceTableRow) => string;

//  规则1：数字校验
const validateIsNumber: Validator = (record) => {
  return Number.isNaN(Number(record.qtyInvoiced)) ? '请输入本次开票数量' : '';
};

// 规则2：正数场景
const validatePositiveQty: Validator = (record) => {
  const qtyAvailable = Number(record.qtyArrived || 0);
  const qtyInvoiced = Number(record.qtyInvoiced || 0);

  if (qtyAvailable < 0) return '';

  if (qtyInvoiced <= 0) return '开票数量必须大于0';

  if (qtyInvoiced > qtyAvailable) return '开票数量超过可开票数量';

  return '';
};

// 规则3：负数场景
const validateNegativeQty: Validator = (record) => {
  const qtyAvailable = Number(record.qtyArrived || 0);
  const qtyInvoiced = Number(record.qtyInvoiced || 0);

  if (qtyAvailable >= 0) return '';

  if (qtyInvoiced >= 0) return '开票数量必须小于0';
  if (qtyInvoiced < qtyAvailable) return '开票数量超过可开票数量';
  return '';
};

// 组合规则
// const qtyValidationRules: Validator[] = [
//   validateIsNumber,
//   validatePositiveQty,
//   validateNegativeQty,
// ]

// 规则链执行器
const createValidationChain = (rules: Validator[]) => {
  return (record: InvoiceTableRow): string => {
    for (const rule of rules) {
      const error = rule(record);
      if (error) return error;
    }
    return '';
  };
};

// 使用
const validateQty = createValidationChain([
  validateIsNumber,
  validatePositiveQty,
  validateNegativeQty,
]);

// 本地开票数量发生改变 重新计算本次开票金额
const handlePriceChange = (scope: any) => {
  chcGridApi.grid.setRow(scope.row, {
    qtyInvoiced: scope.row.qtyInvoiced,
  });
  if (chcGridApi.grid.getEditCell() && chcGridApi.grid.getEditCell()!.row) {
    const currentRow = chcGridApi.grid.getEditCell()!.row;
    if (!currentRow) return null;
    currentRow.lineAmtInvoice = Number(
      ((currentRow.qtyInvoiced || 0) * (currentRow.priceActual || 0)).toFixed(
        2,
      ),
    );
  }
};

onMounted(() => {
  console.warn('urlParams');
  handleFormSubmit();
});
</script>
<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[transparent] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <BatchSetModal />
    <ChcGrid class="h-full">
      <template #qtyInvoiceEdit="scope">
        <InputNumber
          v-model:value="scope.row.qtyInvoiced"
          class="w-full"
          placeholder="请输入"
          @change="handlePriceChange(scope)"
          :data-testid="`InputNumber_qtyInvoice_${scope.rowIndex}`"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="createInvoice"
          data-testid="button_BatchSet"
        >
          创建发票
          <template #icon>
            <SvgBatchJobIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}

/* .custom-text {
  ::v-deep(.ant-input-number-input) {
    text-align: right;

    &:focus {
      text-align: center;
    }
  }
} */
</style>
