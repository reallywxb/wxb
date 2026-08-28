<script lang="ts" setup>
import type { ModalApiOptions, VbenFormProps } from '@vben/common-ui';

import { ref, toRaw } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'CommonFormModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  disabled?: boolean;
  formOption: VbenFormProps;
  modalOption?: ModalApiOptions;
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
    disabled: props.disabled,
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'w-full',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
  ...props.formOption,
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[800px]',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();

    if (valid) {
      try {
        await param.value?.submit(toRaw(await formApi.getValues()));

        message.success('操作成功');

        modalApi.close();
        props.afterSubmit?.();
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
  ...props.modalOption,
});

defineExpose({ modalApi, formApi });
</script>
<template>
  <Modal :title="param?.title">
    <slot v-if="$slots.default" name="default" v-bind="{ Form }"></slot>
    <Form v-else>
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </Form>
  </Modal>
</template>
