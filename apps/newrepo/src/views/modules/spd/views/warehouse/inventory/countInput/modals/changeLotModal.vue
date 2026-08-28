<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

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

const refreshFatherTable = inject<() => void>('refreshFatherTable', () => {});
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalTitle = ref('选择批号');
const modalData = ref<Record<string, any>>({});
const checkedRow = ref<Record<string, any>>({});
const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
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
        align: 'center',
        width: 50,
        title: '单选',
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
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
        // visible: modalData.value.row?.docType !== 'I+',
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
    id: 'countInput_changeLot',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      params.haveAvailableQty =
        modalData.value.row.docType === 'I-' ? 'Y' : 'N';
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
  cancelText: '取消',
  confirmText: '确认',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    if (isEmpty(checkedRow.value)) {
      message.warning('请选择记录！');
      return;
    }

    const params = {
      inventoryPlanLineLotId: modalData.value.row.inventoryPlanLineLotId,
      lot: checkedRow.value.lot,
      vendorId: checkedRow.value.vendorId,
      guaranteeDate: checkedRow.value.guaranteeDate,
      price: checkedRow.value.price,
      locatorId: checkedRow.value.locatorId,
      storageStatus: checkedRow.value.storageStatus,
      warehouseId: modalData.value.warehouseId,
      productId: modalData.value.row.productId,
    };
    AntModal.confirm({
      title: '提示',
      content: '确认选择此批号吗？',
      onOk: async () => {
        try {
          const res = await requestFormClient.post(
            '/inventoryPlanAction/inventoryPlanChooseLot.do',
            params,
          );
          if (res.success) {
            message.success('成功');
            modalApi.close();
            refreshFatherTable();
          } else {
            message.error(`创建失败: ${res.msg}`);
          }
        } catch (error) {
          console.error(error);
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
      modalTitle.value = mData.modalTitle || modalTitle.value;
      console.warn('onOpenChange modalData', modalData.value);

      setTimeout(() => {
        console.warn('ChcGridApi', ChcGridApi.grid.hideColumn);
        if (modalData.value.row?.docType === 'I+') {
          ChcGridApi.grid.hideColumn('qtyAvailable');
        } else {
          ChcGridApi.grid.showColumn('qtyAvailable');
        }
        ChcGridApi.query();
      }, 200);
    }
  },
});
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
