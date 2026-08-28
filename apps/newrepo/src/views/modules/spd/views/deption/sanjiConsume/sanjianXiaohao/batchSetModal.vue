<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { directConusme } from './api';

const data = ref<any>({
  paramLine: [],
});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const validateResult = await baseFormApi.validate();
    if (validateResult.valid) {
      const formValues = await baseFormApi.getValues();
      data.value.records.forEach((item: any) => {
        item.description = formValues.description;
      });
      const params = {
        ...data.value.formData,
        orderType: 'PSO',
        lineData: JSON.stringify(data.value.records),
      };
      console.warn('onConfirm', params);
      const res = await directConusme(params);
      if (res && res.success) {
        // 调用回调函数刷新数据
        message.success('成功');
        modalApi.close();
        if (data.value.callback && typeof data.value.callback === 'function') {
          data.value.callback();
        }
      } else {
        message.error(res.msg || '失败');
      }
    }
    // console.log(validateResult);
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange', data.value.formData);
      // setTimeout(() => {
      //   (baseFormApi.getFieldComponentRef('locatorIdTo') as SelectComponentRef)
      //     ?.fetchApi!();
      // }, 0);
    }
  },
});

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[50px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  showDefaultActions: false,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'vertical',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入备注',
        autosize: { minRows: 5 },
      },
      fieldName: 'description',
      label: '',
      formItemClass: 'col-span-1',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal class="w-[500px]" title="备注" title-tooltip="备注">
    <BaseForm />
  </Modal>
</template>
