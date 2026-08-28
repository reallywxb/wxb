<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'EDIT';
const modalType = ref<ModalType>('ADD');
const isSubmiting = ref(false);
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  showCancelButton: true,
  cancelText: '关闭',
  closeOnClickModal: false,
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
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('modalData.value:', modalData.value);
      modalType.value = modalData.value.modalType;
      const commonTitle = '医共体信息';
      modalTitle.value =
        modalType.value === 'ADD' ? `新增${commonTitle}` : `编辑${commonTitle}`;
      if (modalType.value === 'EDIT') {
        setTimeout(() => {
          baseFormApi.setValues({
            ...modalData.value.row,
          });
        }, 100);
      }
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
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行，值为horizontal
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'mcCode',
      label: '医共体编码',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px]',
      rules: 'required',
      disabled: true,
      componentProps: () => {
        return {
          placeholder: '',
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return modalType.value === 'EDIT';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'mcName',
      label: '医共体名称',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px]',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入医院名称',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

// 提交表单
async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;
    const formValues = await baseFormApi.getValues();
    const params: Record<string, any> = {
      ...formValues,
    };
    if (modalType.value === 'EDIT') {
      params.id = modalData.value?.row?.id; // 主键ID
    }
    console.warn('提交参数:', params);
    saveDo(params)
      .then((res) => {
        if (res && res.success) {
          message.success('成功');
          modalApi.close();
          baseFormApi.resetForm();
          modalData.value?.callback();
        }
      })
      .catch((error) => {
        console.error('提交失败:', error);
      })
      .finally(() => {
        isSubmiting.value = false;
      });
  }
}
</script>
<template>
  <Modal class="w-[500px]" :title="modalTitle" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_onSubmit_addAndEditModal"
      >
        确定
      </Button>
    </template>
  </Modal>
</template>
<style scoped lang="scss"></style>
