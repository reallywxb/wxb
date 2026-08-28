<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { rejectWorkflow } from '../api';

const props = defineProps<{
  rejectOrders: number[];
}>();

const emit = defineEmits(['close']);
// application/vnd.ms-excel;base64,

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
          placeholder: '请输入拒绝原因',
          type: 'textarea',
        };
      },
      fieldName: 'rejectReason',
      label: '拒绝原因',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    // ChcGridApi.query({ ...res });
    rejectWorkflow({
      wfActivityId: JSON.stringify(props.rejectOrders),
      rejectReason: res.rejectReason,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
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
  <Modal class="w-[500px]" title="导入" title-tooltip="拒绝申请">
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
