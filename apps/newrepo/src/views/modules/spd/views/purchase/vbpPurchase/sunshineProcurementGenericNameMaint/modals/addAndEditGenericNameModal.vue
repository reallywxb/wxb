<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveGenericNameAction, updateGenericNameAction } from '../api';

defineOptions({
  name: 'AddAndEditGenericNameModal',
});

interface Param {
  title: string;
  parent: any | undefined;
  callback: () => void;
  type: 'add' | 'edit';
}

const state = ref<Param>();

const [Form, formApi] = useVbenForm({
  compact: true,
  commonConfig: {
    colon: false,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  submitOnChange: false,
  submitOnEnter: false,
  // wrapperClass: 'grid-cols-2',
  schema: [
    {
      label: '通用名',
      component: 'Input',
      fieldName: 'productName',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        allowClear: true,
      },
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      try {
        const formValues = await formApi.getValues();
        const params: any = {
          ...formValues,
        };
        if (state.value?.type === 'edit') {
          params.ygcgProductId = state.value.parent?.productNameId;
        }
        // const fn =
        //   state.value?.type === 'edit'
        //     ? updateGenericNameAction
        //     : saveGenericNameAction;
        const res = await saveGenericNameAction(params);
        if (!res?.success) {
          throw Error(res?.msg || '失败');
        }
        message.success('成功');
        state.value?.callback?.();
        modalApi.close();
      } catch (error) {
        console.error(error);
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      state.value = modalApi.getData() as Param;
      if (state.value?.type === 'edit') {
        setTimeout(async () => {
          await formApi.setValues({
            ...state.value?.parent,
          });
        }, 300);
      }
    }
  },
});
</script>

<template>
  <Modal class="h-[250px] w-[400px]" :title="state?.title">
    <Form />
  </Modal>
</template>
