<script setup lang="ts">
// import type { NotificationItem } from '@vben/chc-ui';

import { useGlobalPrintStore } from '@vben/stores';

import { useVbenForm } from '#/adapter/form';

withDefaults(
  defineProps<{
    // messageInfo: NotificationItem;
    // showBtns: boolean;
    // title: string;
  }>(),
  {
    // title: '标题',
  },
);
const emit = defineEmits(['submit']);
const globalPrintStore = useGlobalPrintStore();
const printers = globalPrintStore.printers.map((item) => {
  return {
    label: item.name,
    value: item.name,
  };
});
const [BaseForm] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'vertical',
  schema: [
    {
      formItemClass: 'pl-[0px] pr-[0px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: printers,
        placeholder: '请选择打印机',
        showSearch: true,
      },
      defaultValue: globalPrintStore.printerDefaultOptions.printer,
      fieldName: 'printer',
      label: '打印机',
    },
    {
      formItemClass: 'pl-[0px] pr-[0px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入标签名',
      },
      defaultValue: globalPrintStore.printerDefaultOptions.paperName || '',
      // 字段名
      fieldName: 'paperName',
      // 界面显示的label
      label: '标签名',
    },
  ],
  wrapperClass: 'grid-cols-1',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    class: 'w-full ml-[0px]',
  },
});
function onSubmit(values: any) {
  globalPrintStore.setPrinterDefaultOptions(values);
  emit('submit', 'submit');
}
</script>
<template>
  <div style="" class="change-password-container">
    <div class="change-password-container__title">
      <h1 style="">
        {{ '修改打印机和标签' }}
      </h1>
    </div>
    <BaseForm />
  </div>
</template>
<style scoped>
.change-password-container {
  width: 100%;
  padding: 0 20px;
}

.change-password-container__title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: hsl(var(--foreground));
  text-align: left;
}
</style>
