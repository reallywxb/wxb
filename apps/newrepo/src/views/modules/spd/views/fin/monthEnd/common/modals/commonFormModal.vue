<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'ModifyInvoiceModal',
});

const props = defineProps<{
  afterSubmit: () => void;
  formOptions: VbenFormProps;
}>();

interface Param {
  form: any;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
}

const param = ref<Param>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...props.formOptions,
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      try {
        await param.value?.submit(await formApi.getValues());

        message.success('操作成功');

        modalApi.close();
        props.afterSubmit();
      } catch (error) {
        console.error(error);
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;

      formApi.setValues(param.value.form ?? {});
    }
  },
});
</script>
<template>
  <Modal :title="param?.title">
    <Form>
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </Form>
  </Modal>
</template>
