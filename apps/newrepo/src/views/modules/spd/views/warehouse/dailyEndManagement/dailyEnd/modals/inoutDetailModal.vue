<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

const props = defineProps<{
  filedName: string;
  orderData: any;
}>();

const data = ref();
const title = ref('');

// const props = defineProps<{
//   rejectOrders: number[];
// }>();

const selectParams = ref({});

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        {
          title: '序号',
          type: 'seq',
          width: 40,
          align: 'center',
        },

        {
          field: 'inoutId',
          minWidth: 100,
          title: '单号',
        },
        {
          field: 'movementTypeName',
          minWidth: 120,
          title: '类型',
        },

        {
          field: 'movementDate',
          minWidth: 120,
          title: '日期',
        },

        {
          field: 'productName',
          title: '药品名称',
          width: '200',
        },

        { field: 'productSpec', title: '规格', width: '150' },
        {
          field: 'manufacturer',
          title: '生产厂家',
          minWidth: '150',
        },

        { field: 'uomName', title: '单位', width: '72' },
        {
          field: 'movementQty',
          title: '数量',
          align: 'right',
          width: 120,
        },
        {
          field: 'endQty',
          title: '结余数量',
          align: 'right',
          width: 120,
        },
        {
          field: 'lot',
          title: '批号',
          width: 120,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          width: 100,
        },
        {
          field: 'price',
          title: '采购价',
          align: 'right',
          width: '80',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.price);
          },
        },
        {
          field: 'lineAmt',
          title: '采购金额',
          align: 'right',
          width: '80',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.lineAmt);
          },
        },
        {
          field: 'priceList',
          title: '零售价',
          align: 'right',
          width: '80',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.priceList);
          },
        },
        {
          field: 'lineAmtPricelist',
          title: '零售金额',
          align: 'right',
          width: '100',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.lineAmtPricelist);
          },
        },
        {
          field: 'warehouseName',
          title: '仓库',
          width: 120,
        },
        {
          field: 'bpartnerName',
          title: '作业对象',
          width: 120,
        },
        {
          field: 'createdByName',
          title: '操作人',
          width: 150,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    dataTableId: '/inoutAction/queryDetail.do?page=trace',
    id: 'approvalTable',

    tableSearchExtraParams: selectParams.value,
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params.totalPrice);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },

  showConfirmButton: false,
  showCancelButton: false,

  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      await nextTick();
      getParams();
      // console.log('selectParams.value111111111', selectParams.value);
      setTimeout(() => {
        chcGridApi.query(selectParams.value);
      }, 200);
    }
  },
});

const getParams = () => {
  // title.value = '审批详情';
  const params: any = {
    dateFrom: props.orderData.dateFrom || props.orderData.storageDate,
    dateTo: props.orderData.dateTo || props.orderData.storageDate,
    warehouseId: props.orderData.warehouseId || undefined,
    productId: props.orderData.productId,
    specShowType: 'warehouse',
  };

  switch (props.filedName) {
    case 'IIQty': {
      title.value = '报溢入库明细';
      params.movementType = 'I+';

      break;
    }
    case 'inStockQty': {
      title.value = '入库明细';
      params.movementType = 'V+,M+,C+,PC+,I+';

      break;
    }
    case 'IOQty': {
      title.value = '报损出库明细';
      params.movementType = 'I-';

      break;
    }
    case 'MIQty': {
      title.value = '调拨入库明细';
      params.movementType = 'M+';

      break;
    }
    case 'MOQty': {
      title.value = '调拨出库明细';
      params.movementType = 'M-';

      break;
    }
    case 'outStockQty': {
      title.value = '出库明细';
      params.movementType = 'V-,M-,C-,PC-,I-';

      break;
    }
    case 'POQty': {
      title.value = '采购入库明细';
      params.movementType = 'V+';

      break;
    }
    case 'PRQty': {
      title.value = '采退出库明细';
      params.movementType = 'V-';

      break;
    }
    case 'PSOQty': {
      title.value = '销售出库明细';
      params.movementType = 'PC-';

      break;
    }
    case 'PSRQty': {
      title.value = '销退入库明细';
      params.movementType = 'PC+';

      break;
    }
    case 'SOQty': {
      title.value = '科领出库明细';
      params.movementType = 'C-';

      break;
    }
    case 'SRQty': {
      title.value = '科退入库明细';
      params.movementType = 'C+';

      break;
    }
    // No default
  }
  // return params;
  Object.assign(selectParams.value, params);
};

onMounted(() => {});
</script>
<template>
  <ModalFirst class="h-[500px] w-[950px]" confirm-text="确定" :title="title">
    <div class="h-full">
      <ChcGrid />
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
