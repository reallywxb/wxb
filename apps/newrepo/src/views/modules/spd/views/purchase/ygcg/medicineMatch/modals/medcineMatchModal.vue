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

import rateModalComp from './rateModal.vue';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('选择');
const [RateModal, rateModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rateModalComp,
  draggable: true,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'medicineMatch_son',
    // api地址
    queryUrl: '/ygcgProductAction/queryYPProducts.do',
    gridColumns: [
      {
        type: 'radio',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },

      {
        field: 'provinceId',
        title: '阳光省标',
        width: '100',
        sortable: true,
      },
      {
        field: 'goodsId',
        title: '阳光编码',
        width: '100',
        sortable: true,
      },
      {
        field: 'productName',
        title: '阳光商品名',
        width: '100',
        sortable: true,
      },
      {
        field: 'outlookc',
        title: '阳光规格',
        width: '100',
        sortable: true,
      },
      {
        field: 'companyNameSc',
        title: '阳光厂家',
        width: '100',
        sortable: true,
      },
      {
        field: 'medicinemodel',
        title: '剂型',
        width: '100',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        width: '100',
        sortable: true,
      },
      {
        field: 'unit',
        title: '单位',
        width: '100',
        sortable: true,
      },
      {
        field: 'companyNamePs',
        title: '配送公司',
        width: '100',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入药品名称',
            allowClear: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'outLookc',
        label: '规格',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入规格名称',
            allowClear: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'companyNameSc',
        label: '厂家',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入厂家名称',
            allowClear: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'provinceId',
        label: '省编码',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入省编码名称',
            allowClear: true,
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      params.orgId = modalData.value?.orgId; // 医院ID
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

  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: false,
  cancelText: '取消',
  confirmText: '匹配',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      setTimeout(() => {
        ChcGridApi.formApi.setValues({
          productName: modalData.value?.row?.productName,
          outLookc: modalData.value?.row?.productSpec,
          companyNameSc: modalData.value?.row?.manufacturer,
        });
        ChcGridApi.query({
          productName: modalData.value?.row?.productName,
          outLookc: modalData.value?.row?.productSpec,
          companyNameSc: modalData.value?.row?.manufacturer,
        });
      }, 200);
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
      orgId: modalData.value?.orgId, // 医院ID
    };
    rateModalApi
      .setData({
        ...params,
        orgId: modalData.value?.orgId, // 医院ID
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
    <RateModal />
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less"></style>
