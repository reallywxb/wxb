<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { changeActiveUser } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('停用或启用用户');
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          defaultValue: '',
          options: [
            { value: 'Y', label: '启用' },
            { value: 'N', label: '停用' },
          ],
          placeholder: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isActive',
      label: '启/停用',
    },
    {
      component: 'Input',
      fieldName: 'changeActiveReason',
      label: '启/停原因',

      componentProps: () => {
        return {
          placeholder: '请输入启/停原因',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    const params: any = {
      ...formData,
      AD_User_ID: serviceData.value.AD_User_ID || undefined,
    };

    changeActiveUser(params).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="h-[300px] w-[460px]" :title="title" title-tooltip="">
    <BaseForm />

    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_userActiveModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>
