<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { InputNumber, message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const refreshFatherTable = inject<() => void>('refreshFatherTable', () => {});

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('退回申请');
const FormOptions: VbenFormProps = {
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
};

const [EditForm, FormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...FormOptions,
});

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await FormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await FormApi.getValues();
    console.warn('onConfirmformValues', formValues);

    const params = {
      applyId: modalData.value?.row?.packUnitChangeApplyID,
      rejectReason: modalData.value.rejectReason,
    };
    Modal.confirm({
      title: '提示',
      content: '确认拒绝吗？',
      onOk: () => {
        requestFormClient
          .post('/packUnitChangeApplyAction/reject.do', params)
          .then(() => {
            message.success('退回申请成功！');
            modalApi.close();
            refreshFatherTable();
          })
          .catch((error) => {
            console.error('失败', error);
          });
      },
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
      // setTimeout(() => {
      //   FormApi.setValues({});
      // }, 100);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst confirm-text="确定" :title="modalTitle">
    <EditForm>
      <template #xianshishunxu="slotProps">
        <InputNumber
          v-bind="slotProps"
          :keyboard="true"
          :min="1"
          :default-value="1"
          :step="1"
          :precision="0"
          data-testid="InputNumber_xianshishunxu_rejectModal"
        />
      </template>
    </EditForm>
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
