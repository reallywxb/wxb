<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

// import { Button, Input } from 'ant-design-vue';
import { formDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { getInoutAction } from '#/views/modules/spd/views/fin/monthEnd/api';

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

      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});
const searchForm = reactive({
  warehouseId: '',
  productId: '',
  dateFrom: '',
  dateTo: '',
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: {
      proxyConfig: {},
      cellClassName({ column }: any) {
        return column.field === 'inoutId' ? 'highlight' : null;
      },
    },
  },
  {
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=FIN_InOut.InvoiceMethod',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'invoiceMethod',
        label: '开票方式',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=FIN_InOut.ReceiptType',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'receiptType',
        label: '入库类型',
      },
    ],
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'inoutId',
        title: '出入库单号',
        minWidth: '100',
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
        minWidth: '120',
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
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'qty',
        title: '采购数量',
        minWidth: '90',
        summary: true,
        align: 'right',
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
        field: 'qtyNoInv',
        title: '未到票数量',
        minWidth: '100',
        summary: true,
        align: 'right',
        sortable: true,
      },
      {
        field: 'amtNoInv',
        title: '未到票金额',
        minWidth: '100',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
        //    		},{
        //    			"field": "amt",
        //    			"title": "进价金额",
        //    			"minWidth": "80",
        //    			"summary": true,
        //    			"sortable": true
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
        field: 'amtPriceListNoInv',
        title: '未到票零售价金额',
        minWidth: '140',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
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
        field: 'orderId',
        title: '订单号',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'settlementId',
        title: '结算单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '业务类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'receiptTypeName',
        title: '入库类型',
        minWidth: '90',
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
      async cellClick({ column, row: { inoutId } }: any) {
        if (column.field === 'inoutId') {
          try {
            const { rows } = await getInoutAction({
              inoutId,
            });

            if (rows?.length > 0) {
              const [{ movementType }] = rows;

              const lastChar = movementType ? movementType.slice(-1) : '';

              if (movementType === 'PAJ') {
                // 库存调价单
                router.push({
                  path: '/fin/finQuery/pajQuery',
                  query: {
                    inoutNo: inoutId,
                  },
                });
              } else if (lastChar === '+') {
                // 入库单
                router.push({
                  path: '/fin/finQuery/receiveQuery',
                  query: {
                    inoutNo: inoutId,
                  },
                });
              } else if (lastChar === '-') {
                // 出库单
                router.push({
                  path: '/fin/finQuery/shipmentQuery',
                  query: {
                    inoutNo: inoutId,
                  },
                });
              } else message.error(`不支持的业务类型：${movementType}`);
            } else message.error(`业务单据未找到：${inoutId}`);
          } catch (error: Error) {
            message.error('接口调用失败,', error.message);
          }
        }
      },
    },
    dataTableId: '/finInoutAction/queryNoInvDebit.do',
    tableSearchExtraParams: searchForm,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[75%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    :title="modalOuterData?.title"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleExport"
            data-testid="button_export_noInvDebitDetail"
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
