<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

const emit = defineEmits(['confirm']);
// application/vnd.ms-excel;base64,

const checkModalData: any = ref({
  content: [],
  msg: [],
});

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
      const modalData = modalApi.getData<Record<string, any>>();
      if (modalData.checkDescription) {
        baseFormApi.setFieldValue(
          'checkDescription',
          modalData.checkDescription,
        );
      }

      checkModalData.value = modalData;
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
          placeholder: '请输入验收备注',
          type: 'textarea',
          maxlength: 500,
          showCount: true,
          autoSize: { minRows: 6, maxRows: 8 },
        };
      },
      fieldName: 'checkDescription',
      label: '验收备注',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    emit('confirm', res.checkDescription);
    modalApi.close();
  });
}
</script>
<template>
  <Modal class="w-[500px]" title="验收" title-tooltip="">
    <div>
      <div v-if="checkModalData.content.length > 0" class="font-bold">
        产品效期预警
      </div>
      <div v-for="item in checkModalData.content" :key="item" class="mt-[10px]">
        {{ item }}
      </div>
      <div v-if="checkModalData.msg.length > 0">证照效期预警</div>
      <div v-for="item in checkModalData.msg" :key="item">
        {{ item }}
      </div>
    </div>
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_reject_checkModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>
