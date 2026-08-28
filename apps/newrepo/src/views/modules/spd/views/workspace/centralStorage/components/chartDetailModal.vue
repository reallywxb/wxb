<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('选择');

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {},
      showCollapseButton: false,
      resetButtonOptions: {
        show: false,
      },
      wrapperClass: 'grid-cols-2',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'storageStatusChartTable',
    // api地址
    queryUrl: '/dashboardAction/queryStockStatusDetailList.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50 },
      { field: 'productName', title: '产品名称', width: 100 },
      { field: 'specModel', title: '规格/型号', width: 100 },
      { field: 'qtyOnHand', title: '现有库存', width: 100, align: 'center' },
      {
        field: 'levelReplenish',
        title: '补货点',
        width: 100,
        align: 'center',
      },
      { field: 'supplierName', title: '供应商', width: 70 },
      { field: 'brandName', title: '品牌', width: 100 },
      { field: 'manufacturer', title: '生产企业' },
    ],
    // 表单配置
    formSchema: [],
    gridEvents: {},
    // showCustomBtn: true,
    // showZoomBtn: true,
    beforeFetchFn: (params) => {
      params.warehouseId = modalData?.value?.warehouseId;
      params.type = modalData?.value?.type;
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.data,
      };
    },
  },
);
const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  showConfirmButton: false,
  confirmDisabled: false,
  showCancelButton: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      setTimeout(() => {
        ChcGridApi.query();
      }, 500);
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[600px] w-[800px]">
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less"></style>
