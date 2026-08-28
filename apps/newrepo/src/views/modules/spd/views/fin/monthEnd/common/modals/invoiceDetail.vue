<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

const router = useRouter();
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

      Object.assign(searchForm, modalOuterData.value.params);

      // ChcGridApi.query();
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});

const searchForm = reactive({
  warehouseId: '',
  productId: '',
  dateFrom: '',
  dateTo: '',
  isRejectDoc: '',
  isAdjustDoc: null,
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      cellClassName({ column }: any) {
        return column.field === 'invoiceId' ? 'highlight' : null;
      },
    },
  },
  {
    layout: 'vertical',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'invoiceId',
        title: '发票单号',
        minWidth: '90',
        hover: true,
        sortable: true,
      },
      {
        field: 'dateAcct',
        title: '记账日期',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '140',
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
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '70',
        summary: true,
        align: 'right',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        minWidth: '80',
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'amt',
        title: '进价金额',
        minWidth: '90',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'invoicePriceDiffAmt',
        title: '发票价差金额',
        minWidth: '120',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        minWidth: '80',
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'amtPriceList',
        title: '零售价金额',
        minWidth: '100',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'isRejectDoc',
        title: '是否红冲',
        minWidth: '100',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
        sortable: true,
      },
      {
        field: 'isAdjustDoc',
        title: '是否调价',
        minWidth: '100',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '120',
        sortable: true,
      },
    ],
    gridEvents: {
      cellClick({ column, row: { invoiceId } }: any) {
        if (column.field === 'invoiceId') {
          // 跳转到发票查询
          router.push({
            path: '/fin/invoice/invoiceQuery',
            query: { invoiceId },
          });
        }
      },
    },
    dataTableId: '/finInvoiceAction/query.do',
    tableSearchExtraParams: searchForm,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[50%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    :title="modalOuterData?.title"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleExport"
            data-testid="button_export_invoiceDetail"
          >
            导出
            <template #icon>
              <ExportActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
::v-deep(.vxe-grid--table-container .vxe-table--column.highlight) {
  color: #006afc;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
