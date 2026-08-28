<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { TemperatureAsnLine } from './api';

const props = defineProps<{
  addFormOptions?: VbenFormProps;
  afterSubmit: () => void;
  cols?: { dict?: boolean; id: string }[];
  editFormOptions?: VbenFormProps;
  formOptions?: VbenFormProps;
  viewFormOptions?: VbenFormProps;
}>();

const data = ref();
const [EditForm, editFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...(props.editFormOptions || props.formOptions),
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

const [ViewForm, viewFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...(props.viewFormOptions || props.formOptions),
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});
const [AddForm, addFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...(props.addFormOptions || props.formOptions),
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

async function submitForm(values: any) {
  try {
    console.warn('data.value', data.value, values);

    await TemperatureAsnLine({
      ...values,
      // asnId: data.value.formData.asnId,
      asnLineId: data.value.formData.asnLineId,
    })
      .then((res) => {
        if (res.success) {
          message.success('成功');
          modalApi.close();
          props.afterSubmit();
        } else {
          message.error(res.msg || '失败');
        }
      })
      .catch((error) => {
        console.error('失败', error);
      });
  } catch {}
}
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    switch (data.value.openType) {
      case 'add': {
        const { valid } = await addFormApi.validate();
        if (valid) {
          addFormApi.getValues().then((values) => {
            const midValue = { ...values };
            Object.keys(midValue).forEach((key) => {
              if (midValue[key] === undefined) {
                midValue[key] = '';
              }
            });
            addFormApi.submitForm().then(() => {
              submitForm(midValue);
            });
          });
        }

        break;
      }
      case 'close': {
        const { valid } = await addFormApi.validate();
        if (valid) {
          addFormApi.getValues().then((values) => {
            const midValue = { ...values };
            Object.keys(midValue).forEach((key) => {
              if (midValue[key] === undefined) {
                midValue[key] = '';
              }
            });
            addFormApi.submitForm().then(() => {
              submitForm(midValue);
            });
          });
        }

        break;
      }
      case 'edit': {
        const { valid } = await editFormApi.validate();
        if (valid) {
          editFormApi.getValues().then((values) => {
            editFormApi.submitForm().then(() => {
              submitForm(values);
            });
          });
        }

        break;
      }
      default: {
        modalApi.close();
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      // console.log(111111111111111, data.value);
      if (data.value.openType === 'edit') {
        const midFormData = { ...data.value.formData };
        editFormApi.setValues(midFormData);
      } else if (data.value.openType === 'view') {
        const midFormData = { ...data.value.formData };
        viewFormApi.setValues(midFormData);
      }
    }
  },
});
onMounted(() => {
  // const proxy = getCurrentInstance().proxy;
});
</script>
<template>
  <Modal
    :title="
      data?.openType === 'edit'
        ? '编辑'
        : data?.openType === 'add'
          ? '新增'
          : data?.openType === 'close'
            ? '验收温度'
            : data?.openType === 'view'
              ? '查看'
              : ''
    "
  >
    <EditForm v-if="data.openType === 'edit'">
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </EditForm>
    <AddForm v-else-if="data.openType === 'add' || data.openType === 'close'">
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </AddForm>
    <ViewForm v-else-if="data.openType === 'view'">
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </ViewForm>
  </Modal>
</template>
