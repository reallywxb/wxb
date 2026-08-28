<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');

const [EditForm, FormApi] = useVbenForm({
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
        placeholder: '请输入追溯码',
      },
      fieldName: 'tracCode',
      label: '追溯码',
      formItemClass: 'col-span-1',
      labelClass: 'leading-1 mb-[0px]',
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
  wrapperClass: 'grid-cols-1',
});

const submitLoading = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onCancel() {
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      modalTitle.value = modalData.value.modalTitle;
      console.warn('onOpenChange modalData', modalData.value);
      console.warn('onOpenChange FormApi', FormApi);

      setTimeout(() => {
        FormApi.setValues({
          warehouseId: modalData.value.warehouseId,
          departmentId: modalData.value.departmentId,
        });
      }, 100);
    }
  },
  async onConfirm() {
    if (submitLoading.value) {
      message.warning('提交中！');
      return;
    }
    const { valid } = await FormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await FormApi.getValues();
    console.warn('onConfirmformValues', formValues);

    Modal.confirm({
      title: '提示',
      content: '确定要修改吗？',
      onOk: async () => {
        try {
          submitLoading.value = true;
          await requestFormClient.post('/asnAction/updateAsnTracCode.do', {
            asnTracCodeId: modalData.value?.row?.asnTracCodeId,
            tracCode: formValues.tracCode,
          });
          message.success('修改成功！');
          modalApi.close();
          modalData.value?.callback?.();
        } catch (error) {
          console.warn('err', error);
        } finally {
          submitLoading.value = false;
        }
      },
    });
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[400px] w-[600px]">
    <EditForm />
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
