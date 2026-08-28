<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { setBatchUnitPackQty } from '../api';

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');

const [BaseForm, BaseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] w-[70px]',
      fieldName: 'replenishPackageQty',
      label: '补货定数',
    },
  ],
});

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    // const { valid } = await BaseFormApi.validate();
    // console.warn('onConfirm valid', valid);
    const formValues = await BaseFormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    // if (formValues.productId === '') {
    //   message.warning('请录入商品信息');
    //   return;
    // }
    const params: Record<string, any> = {
      replenishId: modalData.value?.replenishId,
      replenishPackageQty: formValues.replenishPackageQty,
    };
    try {
      await setBatchUnitPackQty(params);
      message.success('成功');
      modalApi.close();
      BaseFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.warn('err', error);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[300px] w-[500px]">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
