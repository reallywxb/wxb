<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { confirmProductApply } from '../api';

const emit = defineEmits(['close']);
// application/vnd.ms-excel;base64,
const productData = ref<any>({});
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      productData.value = modalApi.getData<Record<string, any>>();
    }
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // fieldMappingTime: [['rangePicker', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  // 提交函数
  // handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'vertical',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入拒绝内容',
          type: 'textarea',
        };
      },
      fieldName: 'rejectReason',
      label: '拒绝内容',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    // ChcGridApi.query({ ...res });
    confirmProductApply({
      ...productData.value,
      description: res.rejectReason,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '成功拒绝！',
        });
        modalApi.close();
        emit('close');
      }
    });
  });
  // message.success({
  //   content: `form values: ${JSON.stringify(values)}`,
  // });
}
</script>
<template>
  <Modal class="w-[500px]" title="拒绝内容" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_rejectModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>
