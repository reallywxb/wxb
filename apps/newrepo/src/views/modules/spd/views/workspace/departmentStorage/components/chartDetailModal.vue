<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

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
    // queryUrl: '/ygcgProductAction/queryYPProducts.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50 },
      { field: 'prodcutName', title: '产品名称', width: 100 },
      { field: 'prodcutSpec', title: '规格/型号', width: 100 },
      { field: 'storage', title: '现有库存', width: 100, align: 'center' },
      {
        field: 'restockingPoint',
        title: '补货点',
        width: 100,
        align: 'center',
      },
      { field: 'supplierName', title: '供应商', width: 70 },
      { field: 'brand', title: '品牌', width: 100 },
      { field: 'componyName', title: '生产企业' },
    ],
    // 表单配置
    formSchema: [],
    gridEvents: {},
    // showCustomBtn: true,
    // showZoomBtn: true,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
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
  confirmDisabled: false,
  showCancelButton: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      setTimeout(() => {
        const arr: any[] = [];
        // 随机5个数据
        for (let i = 0; i < 10; i++) {
          const item: any = {
            rank: i + 1,
            prodcutName: '产品名称',
            prodcutSpec: '规格/型号',
            storage: Math.floor(Math.random() * 1000),
            restockingPoint: Math.floor(Math.random() * 1000),
            supplierName: '供应商',
            brand: '品牌',
            componyName: '深圳海纳生物科技有限公司',
          };
          arr.push(item);
        }
        ChcGridApi.grid.reloadData(arr);
      }, 500);
    }
  },
  async onConfirm() {
    const row = ChcGridApi.grid.getRadioRecord(true);
    const rawRow = toRaw(row);
    if (isEmpty(rawRow)) {
      message.warning('请选择一条记录');
      return;
    }

    const params = {
      productId: modalData.value?.row?.productId,
      ypProductId: rawRow.ypProductId,
    };
    rateModalApi
      .setData({
        ...params,
        callback() {
          modalApi.close();
          modalData.value?.callback();
        },
      })
      .open();
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[600px] w-[800px]">
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less"></style>
