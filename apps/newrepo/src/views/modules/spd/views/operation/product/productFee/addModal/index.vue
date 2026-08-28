<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveFee } from '../api';

interface ModalProps {
  afterSubmit: () => void;
}
const props = defineProps<ModalProps>();

const data = ref();
const title = ref('');
// 是否展示表单
const showForm = ref(false);
const showFormLast = ref(false);
const actualQuantity = ref();
const storageQty = ref();
const feeId = ref<null | number | string>(null);

const editFormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[160px]',
  },
  layout: 'vertical',
  handleValuesChange: (e) => {
    actualQuantity.value = e.actualQuantity || 0;
    storageQty.value = e.storageQty || 0;
    editFormApi.setValues({
      varianceQuantity: actualQuantity.value - storageQty.value,
    });
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入计费项目名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '计费项目名称',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入计费项目编码',
      },
      fieldName: 'feeCode',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '计费项目编码',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入搜索码',
      },
      fieldName: 'value',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '搜索码',
      disabled: false,
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'isActive',
      formItemClass: 'col-span-4 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '描述',
      disabled: false,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-12',
};

const [EditForm, editFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    // labelClass: 'w-[190px]',
  },
  layout: 'horizontal',
  ...editFormOptions,
});

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await editFormApi.validate();
    if (!valid) {
      message.error('请填写完整');
      return;
    }
    try {
      const values = await editFormApi.getValues();
      values.isActive = values.isActive ? 'Y' : 'N';
      const params = {
        ...values,
        feeId: feeId.value,
      };
      const response = await saveFee(params);
      if (response.success) {
        modalApi.close();
        message.success(`${title.value}成功`);
        props.afterSubmit();
      } else {
        message.error(response.msg || `${title.value}失败`);
      }
    } catch (error) {
      console.warn('err', error);
    }
  },
  showConfirmButton: showForm,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      editFormApi.resetForm();
      const formData = {
        ...data.value.formData,
        actualQuantity: data.value.formData.actualQuantity,
        storageQty: data.value.formData.storageQty,
      };
      formData.isActive = formData.isActive === 'Y';
      if (data.value.openType === 'add') {
        editFormApi.setValues(formData);
        title.value = '新增';
        feeId.value = null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      } else {
        editFormApi.setValues(formData);
        title.value = '编辑';
        feeId.value = data.value.formData?.feeId || null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      }
    } else {
      title.value = '';
      showForm.value = false;
      showFormLast.value = false;
      feeId.value = null;
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst confirm-text="确定" :title="title">
    <EditForm />
  </ModalFirst>
</template>

<style scoped lang="scss"></style>
