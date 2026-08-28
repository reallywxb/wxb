<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const props = defineProps<{
  afterSubmit: () => void;
  cols?: { dict?: boolean; id: string }[];
  editFormOptions?: VbenFormProps;
  formOptions?: VbenFormProps;
  viewFormOptions?: VbenFormProps;
}>();
const data = ref();
const [AddForm, addFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'serNo',
      label: '厂家码',
      rules: 'required',
      componentProps: {
        placeholder: '请输入厂家码',
      },
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

async function submitForm(values: any) {
  try {
    requestFormClient
      .post('/packageAction/updatePackage.do', {
        ...values,
        packageId: data.value.formData.packageId,
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
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      const midFormData = { serNo: data.value.formData.serNo };
      addFormApi.setValues(midFormData);
    }
  },
});
onMounted(() => {
  // const proxy = getCurrentInstance().proxy;
});
</script>
<template>
  <Modal title="厂家码">
    <AddForm />
  </Modal>
</template>
