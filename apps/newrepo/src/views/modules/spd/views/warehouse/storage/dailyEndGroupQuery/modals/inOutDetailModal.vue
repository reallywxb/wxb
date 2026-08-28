<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const searchParams = ref<Record<string, any>>({});
const modalTitle = ref('');
const inoutType = ref('');
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      console.warn('modalData', modalData);
      modalTitle.value = modalData.modalTitle;
      inoutType.value = modalData.inoutType;
      searchParams.value = {};
      searchParams.value = {
        ...getFormatQueryParams(modalData.row),
      };
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});

function getFormatQueryParams(row: any) {
  console.warn('getFormatQueryParams row', row);
  const params: Record<string, any> = {};
  if (row.warehouseId) {
    params.warehouseId = row.warehouseId;
  }
  params.productId = row.productId;
  params.specShowType = 'warehouse'; // 规格转换
  if (row.dateFrom) {
    params.dateFrom = row.dateFrom;
    params.dateTo = row.dateTo;
  } else {
    params.dateFrom = row.storageDate;
    params.dateTo = row.storageDate;
  }
  switch (inoutType.value) {
    case 'endQty': {
      params.movementType = 'V+,M+,C+,PC+,I+,V-,M-,C-,PC-,I-';
      params.inoutNegative = 'Y';

      break;
    }
    case 'IIQty': {
      params.movementType = 'I+';

      break;
    }
    case 'inPut': {
      params.movementType = 'V+,M+,C+,PC+,I+';

      break;
    }
    case 'IOQty': {
      params.movementType = 'I-';

      break;
    }
    case 'MIQty': {
      params.movementType = 'M+';

      break;
    }
    case 'MOQty': {
      params.movementType = 'M-';

      break;
    }
    case 'outPut': {
      params.movementType = 'V-,M-,C-,PC-,I-';

      break;
    }
    case 'POQty': {
      params.movementType = 'V+';

      break;
    }
    case 'PRQty': {
      params.movementType = 'V-';

      break;
    }
    case 'PSOQty': {
      params.movementType = 'PC-';

      break;
    }
    case 'PSRQty': {
      params.movementType = 'PC+';

      break;
    }
    case 'shipmentQty': {
      params.movementType = 'M+,C+,PC+,I+,M-,C-,PC-,I-';
      params.inoutNegative = 'Y';

      break;
    }
    case 'SOQty': {
      params.movementType = 'C-';

      break;
    }
    case 'SRQty': {
      params.movementType = 'C+';

      break;
    }
    default: {
      params.movementType = '未知';
    }
  }
  // if (cfg.lot) {
  //   params.lot = cfg.lot;
  // }
  return params;
}
const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      async handleSubmit(values: any) {
        console.warn('请求的参数', values);
        console.warn('请求的参数 searchParams', searchParams.value);
        ChcGridApi.query({
          ...searchParams.value,
          ...values,
        });
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'inoutId',
        title: '单号',
        width: '100',
        sortable: false,
      },
      {
        field: 'movementTypeName',
        title: '类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'orderTypeName',
        title: '单据类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'movementDate',
        title: '日期',
        width: '120',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '150',
        sortable: false,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '150',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: false,
      },
      {
        field: 'movementQty',
        title: '数量',
        width: '70',
        align: 'right',
        sortable: false,
      },
      {
        field: 'endQty',
        title: '结余数量',
        width: '70',
        align: 'right',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: false,
      },
      {
        field: 'price',
        title: '采购价',
        width: '80',
        align: 'right',
        sortable: false,
      },
      {
        field: 'lineAmt',
        title: '采购金额',
        width: '80',
        align: 'right',
        sortable: false,
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '80',
        align: 'right',
        sortable: false,
      },
      {
        field: 'lineAmtPricelist',
        title: '零售金额',
        width: '80',
        align: 'right',
        sortable: false,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '120',
        sortable: false,
      },
      {
        field: 'bpartnerName',
        title: '作业对象',
        width: '120',
        sortable: false,
      },
      {
        field: 'createdByName',
        title: '操作人',
        width: '150',
        sortable: false,
      },
    ],
    formSchema: [],
    dataTableId: '/inoutAction/queryDetail.do?page=trace',
    id: 'dailyEndGroupQuery_inOutDetailModal',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      return {
        ...params,
        ...searchParams.value,
      };
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]" :title="modalTitle">
    <div class="h-full">
      <ChcGridUI />
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
