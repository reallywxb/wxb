<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { modifyInovoiceNo } from '../api';

defineOptions({
  name: 'ModifyInvoiceModal',
});

interface Param {
  rows: any[];
  callback: () => void;
}

const modalData = ref<Param>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',

  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'newTaxInvoiceNo',
      label: '新发票号',
      rules: 'required',
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();

    if (valid) {
      try {
        const formValues = await formApi?.getValues();
        const selectedRows = modalData.value?.rows || [];
        const res = await modifyInovoiceNo({
          newTaxInvoiceNo: formValues?.newTaxInvoiceNo,
          lineData: JSON.stringify(
            selectedRows.map((item: any) => {
              return {
                invoiceId: item?.invoiceId,
              };
            }),
          ),
        });
        if (res?.success) {
          message.success('修改成功');
          modalApi.close();
          modalData.value?.callback();
        } else {
          message.error(res?.msg || '修改失败');
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = modalApi.getData() as Param;
    }
  },
});
</script>
<template>
  <Modal title="修改发票号">
    <Form> </Form>
  </Modal>
</template>
