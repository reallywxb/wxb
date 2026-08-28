<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'CommonFormModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  closeOnClickModal?: boolean | undefined;
  disabled?: boolean;
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
    disabled: props.disabled,
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'w-full',
  ...props.formOptions,
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: !props.closeOnClickModal,
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();

    if (valid) {
      const res: any = await param.value?.submit(await formApi.getValues());
      // console.warn('res', res);
      if (res && res.success) {
        message.success('操作成功');
        modalApi.close();
        // console.warn('props.afterSubmit执行了');
        props.afterSubmit?.();
      } else {
        message.error(res?.msg || '操作失败');
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

defineExpose({ modalApi, formApi });
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
