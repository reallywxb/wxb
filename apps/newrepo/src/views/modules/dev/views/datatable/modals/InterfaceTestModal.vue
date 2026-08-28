<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Textarea } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestClient } from '#/api/request.ts';

defineOptions({
  name: 'InterfaceTestModal',
});

const url = ref('');
const actionType = ref('PROCESS');

const result = ref('');
const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      fieldName: 'name',
      label: '',
      component: 'Input',
    },
  ],
  wrapperClass:
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-3'",
  // submitButtonOptions: {
  //   content: '生成',
  // },
  actionWrapperClass: 'w-full flex-center',
  handleSubmit(values: Record<string, any>) {
    result.value = '';

    switch (actionType.value) {
      case 'DOWNLOAD': {
        requestClient
          .get(url.value, {
            params: values,
          })
          .then((data) => {
            result.value = JSON.stringify(data, '', 4);
          })
          .catch((error) => {
            console.error(error.message);
          });
        break;
      }
      case 'PROCESS': {
        requestClient
          .post(url.value, values)
          .then((data) => {
            result.value = JSON.stringify(data, '', 4);
          })
          .catch((error) => {
            console.error(error.message);
          });
        break;
      }
      case 'UPLOAD': {
        break;
      }
    }
  },
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[50%]',
  footer: false,
  onOpenChange(isOpen) {
    if (isOpen) {
      const { dataTableId, type, actionUrl, id } =
        modalApi.getData<Record<string, any>>();

      url.value = actionUrl;
      actionType.value = type;

      // genCodeByDataTable(dataTableId, {
      //   type: 'ui.action.option',
      //   action: id,
      // }).then((data) => {
      //   console.debug('data:', data);
      // });
    } else {
      result.value = '';
    }
  },
});

defineExpose({ modalApi, formApi });
</script>
<template>
  <Modal title="接口测试">
    <Form>
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </Form>
    <Textarea :value="result" rows="15" readonly />
  </Modal>
</template>
