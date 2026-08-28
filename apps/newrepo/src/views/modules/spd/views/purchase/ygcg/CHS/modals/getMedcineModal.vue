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
const modalTitle = ref('生成医保局3502');

const [BaseForm, baseFormApi] = useVbenForm({
  compact: true,
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
  wrapperClass: 'grid-cols-2',
  fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
  schema: [
    {
      component: 'DateGroup',
      fieldName: 'dateRange',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px]  w-[0px]',
      componentProps: () => {
        return {};
      },
    },
  ],
});

const isSubmiting = ref(false);

const [ModalFirst, modalApi] = useVbenModal({
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

    const formValues = await baseFormApi.getValues();
    const { dateFrom, dateTo } = formValues;
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
    const params: Record<string, any> = {
      // taxinvoiceId: 0,
      dateFrom,
      dateTo,
      orgId: modalData.value?.orgId, // 医院ID
    };

    console.warn('onConfirm params', params);
    isSubmiting.value = true;
    modalApi.setState({ confirmLoading: true });
    try {
      await requestFormClient.post('/ygcgProductAction/create.do', params);
      message.success('成功');
      modalApi.setState({ confirmLoading: false });
      modalApi.close();
      baseFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
      modalApi.setState({ confirmLoading: false });
    } finally {
      isSubmiting.value = false;
      modalApi.setState({ confirmLoading: false });
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[350px] w-[500px]">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
