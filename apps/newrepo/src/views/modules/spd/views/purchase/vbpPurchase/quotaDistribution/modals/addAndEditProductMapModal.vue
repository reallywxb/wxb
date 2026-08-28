<script lang="ts" setup>
import type { ProductMapItem } from '../api';

import { nextTick, ref, toRaw } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { batchSaveProductMapVBPAction } from '../api';

interface ModalDataType {
  parent: any;
  callback: () => void;
}

const emit = defineEmits(['close']);
const modalData = ref<ModalDataType>();
const title = '新增品种';

const handleFormSubmit = async () => {
  const formValues = await baseFormApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query({
    ...formValues,
    vbpProductId: modalData.value?.parent?.vbpProductId,
  });
};
const handleFormReset = async () => {
  await baseFormApi.resetForm();
  baseFormApi.setFieldValue('ygcgProductName', modalData.value?.parent?.name);
  const formValues = await baseFormApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(formValues);
  ChcGridApi.query(formValues);
};

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '取消',
  onCancel() {
    modalApi.close();
  },
  onClosed() {},
  onConfirm() {},

  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<ModalDataType>();
      nextTick(() => {
        baseFormApi.setValues({
          manufacturer: modalData.value?.parent?.manufacturer || '',
          vendorId: modalData.value?.parent?.vendorId || '',
          ygcgProductName: modalData.value?.parent?.name,
        });
      });
    }
  },
  onOpened() {
    // 打开动画结束
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    labelClass: 'w-[fit-content]',
    componentProps: {
      class: 'w-full',
    },
  },
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: true,
  submitButtonOptions: {
    content: '查询',
  },
  handleSubmit: handleFormSubmit,
  handleReset: handleFormReset,
  schema: [
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品',
      labelClass: 'pl-2',
      componentProps: () => {
        return {
          placeholder: '药品编码/药品名/中标编码',
          maxLength: 50,
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturer',
      label: '厂家',
      labelClass: 'pl-2',
      componentProps: () => {
        return {
          placeholder: '请输入厂家',
          allowClear: true,
        };
      },
    },
    {
      // 只显示
      component: 'Input',
      fieldName: 'ygcgProductName',
      label: '阳采通用名',
      labelClass: 'pl-2',
      disabled: true,
      componentProps: () => {
        return {};
      },
    },
  ],
  wrapperClass: 'grid-cols-4',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'addProductMapGrid',
    queryUrl: '/productVBPAction/queryProduct.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productName',
        minWidth: 150,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productCode',
        minWidth: 90,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'markCode',
        minWidth: 90,
        sortable: true,
        title: '中标编码',
      },
      {
        field: 'medicineName',
        minWidth: 150,
        sortable: true,
        title: '通用名',
      },
      {
        field: 'productSpec',
        minWidth: 130,
        sortable: true,
        title: '规格',
      },
      {
        field: 'productStyleName',
        minWidth: 80,
        sortable: true,
        title: '剂型',
      },
      {
        field: 'manufacturer',
        minWidth: 150,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'value',
        title: '拼音码',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'baseUomName',
        title: '最小单位',
        width: '90',
        sortable: true,
      },
      {
        field: 'pricePo',
        title: '价格',
        width: '80',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePo);
        },
      },
      {
        field: 'productUserCode',
        title: '用户自编码',
        width: '120',
        sortable: true,
      },
    ],
    afterFetchFn: (params: any) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        vbpProductId: modalData.value?.parent?.vbpProductId,
        // 通用名id
        ygcgProductNameId: modalData.value?.parent?.ygcgProductNameId,
        ygcgProductName: undefined,
      };
    },
  },
);

// 提交
async function onSubmit(isBulkPurchase: 'N' | 'Y') {
  const checkedArr = ChcGridApi.grid.getCheckboxRecords();
  if (checkedArr && checkedArr.length === 0) {
    message.error({ content: '请至少选择一个关联商品' });
    return;
  }
  const { parent } = modalData.value || {};
  const selectProducts = checkedArr.map((item: ProductMapItem) => ({
    mProductId: item.productId,
    vbpProductId: parent.vbpProductId,
    isBulkPurchase,
  }));
  const params = {
    data: JSON.stringify(selectProducts),
    isBulkPurchase,
  };
  batchSaveProductMapVBPAction(params).then((res) => {
    if (res && res.success) {
      message.success({ content: '添加成功' });
      modalApi.close();
      modalData.value?.callback();
      emit('close');
    }
  });
}
</script>
<template>
  <Modal class="w-[950px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <BaseForm />
      <ChcGrid class="h-[340px] w-full overflow-hidden" />
    </Page>
    <template #prepend-footer>
      <Button type="primary" @click="onSubmit('Y')"> 新增中标 </Button>
      <Button type="primary" @click="onSubmit('N')"> 新增非中标 </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped></style>
