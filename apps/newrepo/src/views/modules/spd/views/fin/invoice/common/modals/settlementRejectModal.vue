<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { rejectWorkflow } from '#/views/modules/spd/views/warehouse/warehouseOrder/orderReturnApproval/api';

const props = defineProps<{
  afterSubmit: () => void;
}>();

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    formApi.getValues().then(async ({ rejectReason }: any) => {
      try {
        await rejectWorkflow({
          rejectReason,
          wfActivityId: JSON.stringify(
            modalApi.getData<Record<string, any>>()?.wfActivityId,
          ),
        });

        message.success('操作成功');

        modalApi.close();
        props.afterSubmit();
      } catch {}
    });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
    formApi.setValues({ rejectReason: '' });
  },
});
const [Form, formApi] = useVbenForm({
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
          rows: 5,
        };
      },
      fieldName: 'rejectReason',
      label: '拒绝原因',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal class="w-[500px]" title="拒绝申请">
    <Form />
  </Modal>
</template>
