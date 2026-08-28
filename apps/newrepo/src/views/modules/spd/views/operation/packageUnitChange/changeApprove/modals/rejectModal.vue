<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('退回申请');

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
      },
      fieldName: 'rejectReason',
      formItemClass: 'col-span-10',
      labelClass: 'leading-1 mb-[0px]',
      label: '拒绝原因',
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
  wrapperClass: 'grid-cols-12',
});

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const formValues = await baseFormApi.getValues();
    console.warn('onConfirmformValues', formValues);

    const params = {
      rejectReason: formValues.rejectReason,
      applyId: modalData.value?.row?.packUnitChangeApplyID,
    };
    requestFormClient
      .post('packUnitChangeApplyAction/reject.do', params)
      .then((res) => {
        if (res && res.success) {
          message.success('拒绝成功！');
          modalApi.close();
          modalData.value?.callback();
        }
      })
      .catch((error) => {
        console.error('失败', error);
      });
  },
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
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
