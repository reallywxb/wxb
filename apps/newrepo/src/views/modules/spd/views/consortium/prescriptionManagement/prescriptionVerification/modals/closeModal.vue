<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { savePrescriptionToPurchase } from '../api';

const emit = defineEmits(['close']);
// application/vnd.ms-excel;base64,

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '取消',
  onCancel() {
    modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
    }
  },
});

const serviceData = ref<any>({});
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
  contentClass: 'min-h-20 aa',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入关闭原因',
          type: 'textarea',
        };
      },
      fieldName: 'closeReason',
      label: '关闭原因',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    savePrescriptionToPurchase({
      prescriptionId: serviceData.value.prescriptionId,
      preStatus: '-1', // 关闭状态写死为-1
      lineList: serviceData.value.lineList,
      closeReason: res.closeReason,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
        });
        modalApi.close();
        emit('close');
      } else {
        message.error({
          content: res?.message || '操作失败',
        });
      }
    });
  });
}
</script>
<template>
  <Modal class="w-[500px]" title="提示">
    <div class="font-bold">请确认是否关闭当前外延订单</div>
    <BaseForm class="mt-[20px]" />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_reject_rejectModal"
      >
        确认
      </Button>
    </template>
  </Modal>
</template>
