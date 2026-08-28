<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',

  schema: [
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        rows: 5,
      },
      fieldName: 'comments',
      formItemClass: 'col-span-2',
      labelClass: 'leading-1 mb-[0px]',
      label: '价格差异说明',
    },
  ],
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
  wrapperClass: 'grid-cols-2',
});

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '确认',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await baseFormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await baseFormApi.getValues();
    console.warn('onConfirmformValues', formValues);

    try {
      const res = await requestFormClient.post(
        '/asnAction/priceDiffConfirm.do',
        {
          asnLineId: modalData.value?.row?.asnLineId,
          comments: formValues.comments,
        },
      );
      if (res.success) {
        message.success('确认成功！');
        modalApi.close();
        modalData.value?.callback();
      } else {
        message.error(`确认失败：：${res.msg}`);
      }
    } catch (error) {
      console.error(error);
    }
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      nextTick(() => {
        baseFormApi.setFieldValue(
          'comments',
          modalData.value?.row?.comments || '',
        );
      });
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst title="价格差异确认">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
