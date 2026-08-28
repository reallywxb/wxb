<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('转换比');

const [BaseForm, baseFormApi] = useVbenForm({
  compact: true,
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 140,
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
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'RadioGroup',
      fieldName: 'rateType',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] w-[70px]',
      defaultValue: 'wzh',
      componentProps: () => {
        return {
          options: [
            {
              label: '无转换',
              value: 'wzh',
            },
            {
              label: '平台大单位',
              value: 'ptd',
            },
            {
              label: '医院大单位',
              value: 'yyd',
            },
          ],
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'rate',
      label: '转换率',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] pl-[70px]',
      dependencies: {
        triggerFields: ['rateType'],
        show: (values) => values.rateType !== 'wzh',
      },
      componentProps: () => {
        return {
          placeholder: '请输入转换率',
        };
      },
    },
  ],
});

const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '提交',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;

    const formValues = await baseFormApi.getValues();

    // 校验转换率：选择平台大单位或医院大单位时，转换率必须大于0
    if (
      formValues.rateType !== 'wzh' &&
      (!formValues.rate || Number(formValues.rate) <= 0)
    ) {
      message.warning('转换率必须大于0');
      isSubmiting.value = false;
      return false;
    }

    const params: Record<string, any> = {
      productId: modalData.value.productId,
      ypProductId: modalData.value.ypProductId,
      orgId: modalData.value?.orgId, // 医院ID
      rateType: formValues.rateType,
      rate: formValues.rate,
    };

    console.warn('onConfirm params', params);

    try {
      await requestFormClient.post('/ygcgProductAction/macthyp.do', params);
      message.success('处理成功');
      modalApi.close();
      baseFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[350px] w-[560px]">
    <div class="mb-[10px] box-border w-[450px] text-left text-[red]">
      规格"5支/盒"的药 <br />
      医院"支" 平台"盒" 选择平台大单位 转换率填5 <br />
      医院"盒" 平台"支" 选择医院大单位 转换率填5
    </div>
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
