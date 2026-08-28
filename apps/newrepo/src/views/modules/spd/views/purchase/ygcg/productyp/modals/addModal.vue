<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('获取数据');

const FormOptions: VbenFormProps = {
  fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
  commonConfig: {
    // 所有表单项
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
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
      component: 'DateGroup',
      fieldName: 'dateRange',
      formItemClass: 'col-span-1',
      labelClass: 'leading-1 mb-[0px]',
      label: '日期',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
    },
  ],
};

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...FormOptions,
});
const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('请勿重复提交！');
      return;
    }
    const { valid } = await baseFormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await baseFormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    const dateFrom = formValues.dateFrom || null; // 开始日期
    const dateTo = formValues.dateTo || null; // 结束日期

    if (dateFrom === null || dateFrom === '') {
      message.warning('开始日期不能为空');
      return;
    }
    if (dateTo === null || dateTo === '') {
      message.warning('结束日期不能为空');
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      message.warning('开始日期不能大于结束日期');
      return;
    }
    const params = {
      taxinvoiceId: 0,
      orgId: modalData.value?.orgId,
      dateFrom,
      dateTo,
    };
    isSubmiting.value = true;
    try {
      await requestFormClient.post('/ygcgProductAction/getyp.do', params);
      message.success('处理成功');
      modalApi.close();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '确认',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalTitle.value || modalData.value.modalTitle;
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
