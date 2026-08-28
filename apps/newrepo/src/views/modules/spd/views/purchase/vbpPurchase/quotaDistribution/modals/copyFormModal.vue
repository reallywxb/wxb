<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { copyBatchVBPAction } from '../api';

const emit = defineEmits(['close']);
const modalData = ref<any>({});
const title = ref('');

const [Modal, modalApi] = useVbenModal({
  confirmText: '复制',
  cancelText: '取消',
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {},
  async onConfirm() {
    const validateResult = await baseFormApi.validate();
    if (validateResult.valid) {
      const formData = await baseFormApi.getValues();
      copyBatchVBPAction({
        ...formData,
        batchId: modalData.value.vbpBatchId,
      }).then((res) => {
        if (res && res.success) {
          message.success({ content: '复制成功' });
          modalData.value.callback?.();
          modalApi.close();
          emit('close');
        }
      });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      title.value = modalData.value.title;
    }
  },
  onOpened() {},
});

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: { class: 'w-full' },
  },
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/batchVBPAction/list.do?productType=H',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        autoChooseFirstOption: true,
        showSearch: true,
        placeholder: '请选择批次目录',
        paginate: false,
        filterByFrontEnd: true,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      }),
      rules: 'required',
      fieldName: 'fromBatchId',
      label: '选择来源批次',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal class="h-[400px] w-[360px]" :title="title">
    <BaseForm />
  </Modal>
</template>
