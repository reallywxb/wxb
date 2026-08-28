<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input, message, Modal } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

import priceModalUI from './priceModal.vue';

const emit = defineEmits(['confirm']);
const modalOuterData = ref();
const [priceModal, priceModalApi] = useVbenModal({
  connectedComponent: priceModalUI,
});

const searchForm: any = ref({
  productName: undefined,
  markCode: undefined,
});
const [FormModal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    const records = ChcGridApi.grid.getCheckboxRecords();
    if (records.length === 0) {
      message.warn('请至少选择一个调价商品！');
      return;
    }
    let priceList = '';
    let isPriceListSame = true;
    let pricePO = '';
    let isPricePOSame = true;
    const productIds: string[] = [];
    let errorMsg = '';
    records.forEach((record: any) => {
      if (record?.isPurchasePriceUnify === 'N') {
        errorMsg = `${errorMsg}【${record.productName}】`;
      }
      if (!priceList) {
        priceList = record.priceList;
      }
      if (priceList && record.priceList && priceList !== record.priceList) {
        isPriceListSame = false;
      }
      if (!pricePO) {
        pricePO = record.pricePO;
      }
      if (pricePO && record.pricePO && pricePO !== record.pricePO) {
        isPricePOSame = false;
      }
      // productIds = productIds + record.productId + ",";
      productIds.push(record.productId);
    });
    if (errorMsg !== '') {
      message.warn(
        `商品${
          errorMsg
        }属于非统一定价，此页面无法对其进行价格调整，请在“供应商调价”界面操作！`,
      );
      return;
    }
    // 确认
    if (!isPriceListSame || !isPricePOSame) {
      let msg = '';
      if (!isPricePOSame) {
        msg = `${msg}原采购价不统一、`;
      }
      if (!isPriceListSame) {
        msg = `${msg}原零售价不统一、`;
      }
      msg = `${msg}是否统一调价？`;
      Modal.confirm({
        title: '提示',
        content: msg,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          priceModalApi.setData({ productIds }).open();
        },
      });
    } else {
      priceModalApi.setData({ productIds }).open();
    }
    // modalApi.close();
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      searchForm.value.markCode = '';
      searchForm.value.productName = '';
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
    }
  },
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      // proxyConfig: {
      // autoLoad: false,
      // },
      checkboxConfig: {},
    },
  },
  {
    gridColumns: [
      {
        type: 'checkbox',
        fixed: 'left',
        title: '',
        width: 50,
        align: 'center',
      },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      {
        field: 'productName',
        title: '药品名称',
        width: 220,
        sortable: true,
      }, // 其中 edit 的名字需要与弹窗里div的名字一致
      { field: 'productCode', title: '药品编码', sortable: true, width: 140 },
      { field: 'productSpec', title: '规格', sortable: true, width: 130 },
      { field: 'manufacturer', title: '厂家', sortable: true, width: 130 },
      { field: 'uomName', title: '单位', sortable: true, width: 70 },
      { field: 'markCode', title: '中标编码', sortable: true, width: 110 },
      {
        field: 'isPurchasePriceUnify',
        title: '统一定价',
        width: '120',
        sortable: true,
        formatter({ cellValue }: any) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'priceList',
        title: '零售价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
    ],
    id: 'batchChangePriceTable',
    dataTableId: '/productAction/query.do',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  if (searchForm.value.markCode || searchForm.value.productName) {
    ChcGridApi.query();
  } else {
    message.info('商品和中标编码不可同时为空！');
  }
}

const handleConfirm = () => {
  emit('confirm');
  modalApi.close();
};
</script>
<template>
  <FormModal
    class="h-[800px] w-[1200px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="批量调价"
  >
    <priceModal @confirm="handleConfirm" />
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Input
            v-model:value="searchForm.productName"
            placeholder="编码、名称、拼首码、规格"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_productName_batchChangePriceModal"
          />
          <Input
            placeholder="中标编码"
            v-model:value="searchForm.markCode"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_markCode_batchChangePriceModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_search_batchChangePriceModal"
          >
            查询
          </Button>
        </template>
      </ChcGrid>
    </div>
  </FormModal>
</template>
<style scoped>
/* ::v-deep(.vxe-table--render-default .vxe-cell--checkbox.is--disabled) {
  color: #929292;
} */

::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>
