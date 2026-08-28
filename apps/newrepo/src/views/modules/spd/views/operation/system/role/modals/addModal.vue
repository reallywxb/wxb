<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveRole } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('新增角色');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      title.value = serviceData.value.id ? '修改角色' : '新增角色';
      setTimeout(() => {
        baseFormApi.setValues({
          ...serviceData.value,
          defaultDepartmentId: serviceData.value.DefaultDepartmentId,
        });
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[120px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '角色名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入角色名称',
        };
      },
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: false, // bug1065 去除修改角色描述的“x”号
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      formItemClass: 'col-start-1',
      label: '描述',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    const params: any = {
      ...formData,
      AD_Role_ID: serviceData.value.id || undefined,
    };

    saveRole(params).then((res) => {
      if (res && res.success) {
        message.success({
          content: '保存成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="h-[400px] w-[800px]" :title="title" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_addModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>
