<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

// import { Button, Input } from 'ant-design-vue';
import { useSpdGrid } from '#/components/spd';
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
      modalOuterData.value = modalApi.getData<Record<string, any>>();

      Object.assign(searchForm, modalOuterData.value.params);

      switch (modalOuterData.value.type) {
        case 'adj': {
          searchForm.movementType = 'PAJ';
          break;
        }
        case 'IIQty': {
          searchForm.movementType = 'I+';
          break;
        }
        case 'input': {
          searchForm.movementType = 'V+,M+,C+,PC+,I+';
          break;
        }
        case 'ioOutStock': {
          searchForm.negative = 'Y';
          searchForm.movementType = 'I+,I-';

          break;
        }
        case 'IOQty': {
          searchForm.movementType = 'I-';
          searchForm.negative = 'Y';

          break;
        }
        case 'mi': {
          searchForm.movementType = 'M+';

          break;
        }
        case 'MIQty': {
          searchForm.movementType = 'M+';

          break;
        }
        case 'mo': {
          searchForm.movementType = 'M-';
          searchForm.negative = 'Y';

          break;
        }
        case 'MOQty': {
          searchForm.movementType = 'M-';
          searchForm.negative = 'Y';

          break;
        }
        case 'mvInStock': {
          searchForm.movementType = 'M+,M-';

          break;
        }
        case 'output': {
          searchForm.movementType = 'V-,M-,C-,PC-,I-';
          searchForm.negative = 'Y';

          break;
        }
        case 'poInStock': {
          searchForm.movementType = 'V+,V-,LE+';

          break;
        }
        case 'POQty': {
          searchForm.movementType = 'V+';

          break;
        }
        case 'priceDiff': {
          searchForm.hasDiffAmt = 'Y';

          break;
        }
        case 'PRQty': {
          searchForm.movementType = 'V-';
          searchForm.negative = 'Y';

          break;
        }
        case 'PSOQty': {
          searchForm.movementType = 'PC-';
          searchForm.negative = 'Y';

          break;
        }
        case 'PSRQty': {
          searchForm.movementType = 'PC+';

          break;
        }
        case 'soOutStock': {
          searchForm.negative = 'Y';
          searchForm.movementType = 'C+,C-,PC+,PC-';

          break;
        }
        case 'SOQty': {
          searchForm.movementType = 'C-';
          searchForm.negative = 'Y';

          break;
        }
        case 'SRQty': {
          searchForm.movementType = 'C+';

          break;
        }
        default: {
          searchForm.movementType = '未知';
        }
      }
      // ChcGridApi.query();
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

  movementType: '',
  hasDiffAmt: '',
  negative: '',
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      cellClassName({ column }: any) {
        return column.field === 'inoutId' ? 'highlight' : null;
      },
    },
  },
  {
    layout: 'vertical',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'inoutId',
        title: '出入库单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'dateAcct',
        title: '记账日期',
        minWidth: '90',
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
        field: 'movementTypeName',
        title: '业务类型',
        minWidth: '100',
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
        field: 'endQty',
        title: '结余数量',
        minWidth: '90',
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
        field: 'amt',
        title: '进价金额',
        minWidth: '90',
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
        field: 'priceDiffAmt',
        title: '价差金额',
        minWidth: '100',
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
        field: 'bpartnerName',
        title: '业务对象',
        minWidth: '120',
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
    dataTableId: '/finInoutAction/query.do',
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
            data-testid="button_export_inoutDetail"
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
