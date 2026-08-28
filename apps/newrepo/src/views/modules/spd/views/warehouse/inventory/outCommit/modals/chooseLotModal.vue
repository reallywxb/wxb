<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Modal as AntModal, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const props = defineProps<{
  afterSubmit: () => void;
}>();

const modalTitle = ref('选择批号');
const modalData = ref<Record<string, any>>({});

const qtyAvailableColVisible = ref(false);

const checkedRow = ref<Record<string, any>>({});
const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        checkedRow.value = {};
        checkedRow.value = row;
      },
    },
  },
  {
    gridColumns: [
      {
        type: 'radio',
        visible: false,
        align: 'center',
        width: 50,
        title: '单选',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '90',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '180',
        sortable: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '80',
        sortable: false,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '130',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '80',
        sortable: false,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '80',
        sortable: false,
      },
      {
        field: 'qtyAvailable',
        title: '数量',
        width: '70',
        sortable: false,
        align: 'right',
        visible: qtyAvailableColVisible.value,
      },
      {
        field: 'price',
        title: '采购价',
        width: '70',
        align: 'right',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: false,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '180',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '100',
        sortable: true,
      },
    ],
    formSchema: [],
    queryUrl: '/storageAction/queryStorageLot.do',
    id: 'outCommit_chooseLot',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      params.haveAvailableQty = modalData.value.docType === 'I-' ? 'Y' : 'N';
      params.warehouseId = modalData.value.warehouseId;
      params.productId = modalData.value.row.productId;
      params.showPrice = 'Y';
      return params;
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
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
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

    AntModal.confirm({
      title: '提示',
      content: '确认选择此批号吗？',
      onOk: async () => {
        if (isEmpty(checkedRow.value)) {
          message.warning('请选择一条记录！');
          return;
        }
        try {
          const params: Record<string, any> = {};
          params.inventoryLineId = modalData.value.row.inventoryLineId;
          params.lot = checkedRow.value.lot;
          params.vendorId = checkedRow.value.vendorId;
          params.guaranteeDate = checkedRow.value.guaranteeDate;
          params.price = checkedRow.value.price;
          params.locatorId = checkedRow.value.locatorId;
          params.storageStatus = checkedRow.value.storageStatus;
          params.warehouseId = modalData.value.warehouseId;
          params.productId = modalData.value.row.productId;
          const res = await requestFormClient.post(
            `/inventoryAction/inventoryChooseLot.do`,
            params,
          );
          if (res.success) {
            message.success('成功');
            modalApi.close();
            props.afterSubmit();
          }
        } catch (error) {
          console.error('作废失败', error);
        }
      },
    });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const mData = modalApi.getData<Record<string, any>>();
      modalData.value = {};
      modalData.value = mData;
      console.warn('modalData', modalData);
      qtyAvailableColVisible.value = modalData.value.row?.docType !== 'I+';
      checkedRow.value = {};
      modalTitle.value = mData.modalTitle || modalTitle.value;
      console.warn('onOpenChange modalData', modalData.value);
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});
onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]" confirm-text="确定" :title="modalTitle">
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
