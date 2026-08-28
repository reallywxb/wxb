<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveCustomWorkflow } from '../api';

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'EDIT';
const modalType = ref<ModalType>('ADD');

const [CuForm, cuFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
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
  wrapperClass: 'grid-cols-1',
  schema: [
    // 无作用
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        maxlength: 60,
      },
      fieldName: 'workflowExtendId',
      formItemClass: 'pl-[10px] pr-[10px] hidden',
      labelClass: 'leading-1 mb-[0px] pl-[4px] w-[90px]',
      label: '',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        maxlength: 60,
      },
      fieldName: 'workflowName',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] w-[90px]',
      label: '名称',
      // disabled: true,
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      fieldName: 'warehousePolicyId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] w-[90px]',
      label: '作业策略',
      rules: 'required',
      componentProps: () => {
        return {
          dictUrl: '/warehouseAction/warehousePolicyList.do',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          disabled: modalType.value === 'EDIT',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
  ],
});

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '保存',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      modalType.value = modalData.value.modalType || modalType.value;
      if (!modalData.value?.row?.Value) {
        message.warning('未获取到工作流编码！');
        return;
      }
      if (!modalData.value?.row?.workflowName) {
        message.warning('未获取到工作流名称！');
        return;
      }
      cuFormApi.setFieldValue(
        'workflowName',
        modalData.value?.row?.workflowName,
      );
      if (modalType.value === 'EDIT') {
        setTimeout(() => {
          cuFormApi.setValues({
            warehousePolicyId: modalData.value?.row?.warehousePolicyId,
          });
        }, 100);
      }
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await cuFormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await cuFormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    const params: Record<string, any> = {
      WfValue: modalData.value?.row?.Value,
      type: 'custom',
      workflowExtendId: modalData.value?.row?.workflowExtendId,
      workflowName: formValues.workflowName,
      warehousePolicyId: formValues.warehousePolicyId,
    };
    try {
      await saveCustomWorkflow(params);
      message.success('成功');
      modalApi.close();
      cuFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.warn('err', error);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[400px] w-[500px]">
    <div class="promptMessage mb-2">
      <span>1.名称不可重复</span>
      <span class="ml-2">2.作业策略一经保存,无法修改</span>
    </div>
    <CuForm />
  </ModalFirst>
</template>

<style scoped lang="less">
.promptMessage {
  display: flex;
  justify-content: center;
  color: red;
}
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
