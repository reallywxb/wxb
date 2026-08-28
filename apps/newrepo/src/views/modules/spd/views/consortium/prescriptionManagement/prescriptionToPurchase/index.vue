<script setup lang="ts">
import type { QuerySettlementRow } from './api';

import { ref, toRaw } from 'vue';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { savePrescriptionToPurchase } from './api';

const handlePrice = (price: any) => {
  if (typeof price === 'string') {
    return Number.parseFloat(price);
  } else if (typeof price === 'number') {
    return price;
  } else {
    return 0;
  }
};

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: true,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click', // dblclick
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
    }),
    gridEvents: {
      // 全选/全不选复选框改变
      checkboxAll: ({ records }: { records: QuerySettlementRow[] }) =>
        calculateSelectedAmount(records),
      // 单个复选框改变
      checkboxChange: ({ records }: { records: QuerySettlementRow[] }) =>
        calculateSelectedAmount(records),
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 200,
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'insuranceCodeNo',
        title: '医保编码',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'baseUomName',
        title: '最小单位',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'qty',
        title: '采购数量',
        minWidth: 90,
        align: 'right',
        // slots: { default: 'qtyOrdered' },
      },
      {
        field: 'pricePo',
        title: '采购单价',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePo);
        },
      },
      {
        field: 'priceAmt',
        title: '金额',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceAmt);
        },
      },
      {
        field: 'vendorName',
        title: '供应商',
        sortable: true,
        minWidth: 80,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        sortable: true,
        minWidth: 80,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
        defaultValue: [
          dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD'),
        ], // 默认时间范围为 一个月 ~ 今天
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        componentProps: {
          placeholder: '请输入药品名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'productCode',
        label: '药品编码',
        componentProps: {
          placeholder: '请输入药品编码',
        },
      },
      {
        component: 'Input',
        fieldName: 'insuranceCodeNo',
        label: '医保编码',
        componentProps: {
          placeholder: '请输入医保编码',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: `请选择采购仓库`,
            // onChange(val: any, option: any) {},
            showChooseAll: false,
            allowClear: false,
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        formItemClass: 'pb-2',
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            placeholder: `请选择需求仓库`,
            showSearch: true,
            allowClear: false,
            showChooseAll: false,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        formItemClass: 'pb-2',
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
      },
    ],
    dataTableId: 'settlementAction/querySettlementAll',
    id: 'prescriptionToPurchaseGrid',
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params) => {
      const rows = params.rows;
      if (Array.isArray(rows) && rows.length > 0) {
        let total = 0;
        rows.forEach((item: QuerySettlementRow) => {
          total += handlePrice(item.priceAmt) || 0;
        });
        totalAmount.value = Number.parseFloat(total.toFixed(2));
        setTimeout(() => {
          calculateSummarize();
        }, 200);
      }
      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
  },
);

const handleToPurchase = async () => {
  const selectedRows: QuerySettlementRow[] =
    ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择要转采购的药品');
    return;
  }
  try {
    const formValues = await ChcGridApi.formApi.getValues();
    const productIds: string[] = [];
    const pricePos: string[] = [];
    selectedRows.forEach((item: QuerySettlementRow) => {
      productIds.push(item.productId);
      const price = item.pricePo ?? 0;
      pricePos.push(String(price));
      // pricePos.push(handlePrice(item.pricePo) || 0);
    });
    const params = {
      startTime: formValues.dateFrom,
      endTime: formValues.dateTo,
      productIds: productIds.join(','),
      pricePos: pricePos.join(','),
      warehouseId: formValues.warehouseId,
      targetWarehouseId: formValues.applyBPartnerId,
    };
    await savePrescriptionToPurchase(params);
    message.success('转采购成功');
    ChcGridApi.reload();
    ChcGridApi.grid.clearCheckboxRow();
  } catch (error) {
    console.error('转采购失败', error);
    throw new Error('转采购失败');
  }
};

// 计算勾选总金额
const calculateSelectedAmount = (selectedRows: QuerySettlementRow[]) => {
  const total = selectedRows.reduce((sum, next) => {
    return sum + (handlePrice(next.priceAmt) || 0);
  }, 0);
  selectedAmount.value = Number.parseFloat(total.toFixed(2));
  calculateSummarize();
};

const summarizeRef = ref();
const selectedAmount = ref(0);
const totalAmount = ref(0);
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '勾选总金额',
      value: selectedAmount.value,
    },
    {
      label: '当前页面总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <div class="flex w-full justify-between">
          <Button
            type="primary"
            @click="handleToPurchase"
            class="mr-[0.5rem]"
            data-testid="button_auto_create_plan_infoQuery"
          >
            批量转采购
          </Button>
          <div>
            <Summarize ref="summarizeRef" />
          </div>
        </div>
      </template>
      <!-- 采购数量不可编辑 -->
      <!-- <template #qtyOrdered="scope">
        <InputNumber
          class="w-full"
          :min="0"
          v-model:value="scope.row.qtyOrdered"
          @change="
            scope.row.currentPriceAmt = (
              handlePrice(scope.row.qtyOrdered) * handlePrice(scope.row.price)
            ).toFixed(2)
          "
          :data-testid="`InputNumber_qtyOrdered_${scope.rowIndex}_editModal`"
        />
      </template> -->
    </ChcGrid>
  </div>
</template>
<style scoped></style>
