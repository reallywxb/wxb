<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveSetting } from '../api';

// import { saveSettingDo } from '../api';

const modalData = ref<Record<string, any>>({});
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
    baseFormApi.resetForm();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      baseFormApi.setValues({
        ...modalData.value,
      });
    }
  },
});

// 基础表单项
const baseSchema = [
  {
    component: 'Switch',
    fieldName: 'IsFilter_Black_V',
    label: '黑名单校验',
    formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
    labelClass: 'leading-1 mb-[0px]',
    componentProps: {
      checkedChildren: '开启',
      unCheckedChildren: '关闭',
      style: {
        width: '40px',
      },
    },
  },
  {
    component: 'Switch',
    fieldName: 'IsFilter_Doc_V',
    label: '供应商证照效期校验',
    formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
    labelClass: 'leading-1 mb-[0px]',
    componentProps: {
      checkedChildren: '开启',
      unCheckedChildren: '关闭',
      style: {
        width: '40px',
      },
    },
  },
  {
    component: 'Switch',
    fieldName: 'IsWarning_Doc_V',
    label: '供应商证照预警配置',
    formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
    labelClass: 'leading-1 mb-[0px]',
    componentProps: {
      checkedChildren: '开启',
      unCheckedChildren: '关闭',
      style: {
        width: '40px',
      },
    },
  },
  {
    component: 'Select',
    fieldName: 'Warning_Level',
    formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
    labelClass: 'w-[80px]',
    label: '预警级别',
    componentProps: {
      options: [
        { label: '一级', value: '1' },
        { label: '二级', value: '2' },
        { label: '三级', value: '3' },
      ],
      placeholder: '请选择预警级别',
    },
    dependencies: {
      triggerFields: ['IsWarning_Doc_V'],
      if(values: Record<string, any>) {
        return values.IsWarning_Doc_V === true;
      },
    },
    rules: z.string().nonempty('请选择预警级别'),
  },
  {
    visible: false,
    component: 'InputNumber',
    fieldName: 'Warning_Days',
    label: '预警天数',
    labelClass: 'w-[80px]',
    formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
    componentProps: {
      placeholder: '请输入预警天数',
      min: 1,
      max: 365,
      precision: 0,
    },
    dependencies: {
      triggerFields: ['IsWarning_Doc_V'],
      if(values: Record<string, any>) {
        return values.IsWarning_Doc_V === true;
      },
    },
    rules: z.number().min(1, '请输入预警天数').max(365, '请输入预警天数'),
  },
];

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[150px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  submitOnChange: false,
  submitOnEnter: false,
  schema: baseSchema,
  wrapperClass: 'grid-cols-12',
});

// 提交表单
async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    isSubmiting.value = true;
    const formValues = await baseFormApi.getValues();
    const params: Record<string, any> = {
      ...formValues,
      MC_Organ_ID: Number(modalData.value?.MC_Organ_ID),
      IsActive: true,
      Warning_Days: formValues.IsWarning_Doc_V
        ? String(formValues.Warning_Days)
        : null,
      Warning_Level: formValues.IsWarning_Doc_V
        ? formValues.Warning_Level || null
        : null,
      MC_Setting_ID: modalData.value?.MC_Setting_ID,
    };
    console.warn('提交参数:', params);
    saveSetting(params)
      .then((res) => {
        if (res && res.success) {
          message.success('保存成功');
          modalApi.close();
          baseFormApi.resetForm();
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
  <Modal class="w-[500px]" title="医共体配置" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        :loading="isSubmiting"
        data-testid="button_onSubmit_settingModal"
      >
        确定
      </Button>
    </template>
  </Modal>
</template>
<style scoped lang="scss"></style>
