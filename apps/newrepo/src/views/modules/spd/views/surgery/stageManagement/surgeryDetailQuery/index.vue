<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  SvgPrintFillIcon,
  // ResetActionIcon,
  // SvgBatchJobIcon,
  // SvgCloseIcon,
  // SvgGearIcon,
  // SvgSaveIcon,
  // UploadCloudIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, InputNumber } from 'ant-design-vue';

// import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

import { formSchema } from './options';

const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const orderType = urlParams.orderType || '';
// const movementType = urlParams.movementType || '';
// const returnNegative = urlParams.returnNegative || '';
// const isExchange = urlParams.isExchange || '';
const isNarcotic = urlParams.isNarcotic || undefined;
const extParams = ref<any>({
  isNarcotic,
  specShowType: 'warehouse',
});
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
const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
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
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        summarizeRef.value.refreshNumber(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ checked }: any) => {
        if (checked) {
          summarizeRef.value.refreshNumber(
            chcGridApi.grid.getCheckboxRecords(),
          );
        } else {
          summarizeRef.value.refreshNumber([]);
        }
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
          summarizeRef.value.refreshNumber([row]);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'bpartnerName',
        title: '申请仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '上级仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '200',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '申请数量',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qtyReceiveLeft',
        title: '未发数量',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'StorageQty',
        title: '上级仓库数量',
        minWidth: '125',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '125',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '申请时间',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'lineStatusName',
        title: '申请状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '200',
        sortable: true,
      },
    ],
    formSchema,
    dataTableId:
      'orderAction/queryDetail.do?orderType=WO&page=short&specShowType=from&returnDoc=N',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: false,
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
      // 'DescriptionModal-descriptionModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: DescriptionModalComp,
      // },
      // 'ScatterCreateModal-scatterCreateModalApi': {
      //   connectedComponent: ScatterCreateComp,
      // },
    },
  },
);
const summarizeRef = ref();

onMounted(() => {
  console.warn('urlParams');
  // chcGridApi.query();
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #qtyProcessDefault="scope">
        <InputNumber v-model:value="scope.row.qtyProcess" class="w-full" />
      </template>
      <!-- <template #toolbar-tools>
        <Summarize
          ref="summarizeRef"
          :calculate-selected-amount="calculateSelectedAmount"
        />
      </template> -->
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button> -->
        <Button type="primary" class="mr-[0.5rem]" @click="handleExport">
          打印
          <template #icon>
            <SvgPrintFillIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
