<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { Button, Input } from 'ant-design-vue';
import { useSpdGrid } from '#/components/spd';

const modalOuterData = ref();
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;

      searchForm.value.summaryCols = modalData.summaryCols;
      searchForm.value.settlementLineId = modalData.settlementLineId;

      // ChcGridApi.query();
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  summaryCols: undefined,
  settlementLineId: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '120',
        sortable: true,
      },
      {
        field: 'dateInvoiced',
        title: '发票日期',
        width: '110',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        width: '110',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '120',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '120',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '120',
        sortable: true,
      },
      {
        field: 'qtyInvoiced',
        title: '数量',
        width: '120',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '120',
        sortable: true,
      },
      {
        field: 'priceActual',
        title: '进价',
        width: '120',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '进价金额',
        width: '120',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '120',
        sortable: true,
      },
      {
        field: 'invoiceId',
        title: '发票单号',
        width: '120',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '120',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '120',
        sortable: true,
      },
    ],
    dataTableId: '/invoiceAction/queryDetail.do',
    tableSearchExtraParams: searchForm.value,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[50%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="发票明细"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
