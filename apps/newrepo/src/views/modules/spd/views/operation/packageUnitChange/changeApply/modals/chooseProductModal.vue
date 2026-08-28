<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
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
const modalTitle = ref('商品选择');
const modalData = ref<Record<string, any>>({});

const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      resetButtonOptions: {
        show: false,
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
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
      {
        type: 'radio',
        align: 'center',
        width: 50,
        title: '单选',
        visible: false,
      },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      {
        field: 'productName',
        title: '药品名称',
        // width: '300',
        sortable: true,
      },
      { field: 'productSpec', title: '规格', width: '120', sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        width: '120',
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', width: '120', sortable: true },
      { field: 'uomName', title: '单位', width: '65', sortable: true },
      { field: 'lPackageQty', title: '大包装', width: '80', sortable: true },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
    ],
    queryUrl: '/productAction/query.do',
    id: 'changeApply_chooseProduct',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);

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
  async onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
    const checkedRow = ChcGridApi.grid.getRadioRecord(true);
    const unProxyRow: any = toRaw(checkedRow);
    console.warn('onConfirm checkedRow', unProxyRow);
    console.warn('onConfirm unProxyRow', unProxyRow);
    if (isEmpty(unProxyRow)) {
      message.warning('请选择一条记录');
      return;
    }
    modalData.value?.callback(unProxyRow);
    modalApi.close();
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
      modalTitle.value = mData.modalTitle || modalTitle.value;
      console.warn('onOpenChange modalData', modalData.value);
      setTimeout(() => {
        ChcGridApi.formApi.setValues({
          productName: modalData.value?.productCode,
        });
        ChcGridApi.query({
          productName: modalData.value?.productCode,
        });
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
