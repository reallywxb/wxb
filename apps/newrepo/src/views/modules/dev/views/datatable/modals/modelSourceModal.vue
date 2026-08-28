<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { TabPane, Tabs, Textarea } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { copyToBoard } from '#/utils/flow/objutil';
import { genCodeByDataTable } from '#/views/modules/dev/views/datatable/api/datatable.ts';

defineOptions({
  name: 'SqlFormModal',
});

const props = defineProps<{
  formOption: VbenFormProps;
}>();

/* eslint-disable no-unused-vars */
enum Tab {
  Definition = 1,
  Plugin,
  Menu,
}

const activeKey = ref(Tab.Menu.toString());

const dataTableId = ref('');

const code = reactive({
  definition: '',
  plugin: '',
  menu: '',
});

function previewCode(dataTableId: string, values: Record<string, any> = {}) {
  /* 模型定义*/
  genCodeByDataTable(dataTableId, {
    ...values,
    type: 'server.datatable',
  }).then((data) => {
    code.definition = data;
  });

  /* 模型插件*/
  genCodeByDataTable(dataTableId, {
    ...values,
    type: 'server.plugin',
  }).then((data) => {
    code.plugin = data;
  });

  /* 菜单*/
  genCodeByDataTable(dataTableId, {
    ...values,
    type: 'server.menu',
  }).then((data) => {
    code.menu = data;
  });
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    // disabled: props.disabled,
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'w-full',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    content: '生成',
  },
  handleSubmit(values: Record<string, any>) {
    previewCode(dataTableId.value, values);
  },
  ...props.formOption,
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[50%]',
  cancelText: '关闭',
  confirmText: '复制代码',
  onOpened() {
    const { dataTableId: value } = modalApi.getData();

    dataTableId.value = value;
    previewCode(dataTableId.value);
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    let text: string;

    switch (activeKey.value) {
      case Tab.Definition.toString(): {
        text = code.definition;
        break;
      }
      case Tab.Plugin.toString(): {
        text = code.plugin;
        break;
      }
      case Tab.Menu.toString(): {
        text = code.menu;
      }
    }

    await copyToBoard(text!);
  },
});

defineExpose({ modalApi, formApi });
</script>
<template>
  <Modal title="模型源码">
    <Form>
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </Form>
    <Tabs v-model:active-key="activeKey">
      <TabPane :key="Tab.Definition.toString()" tab="模型定义">
        <Textarea :rows="10" :value="code.definition" readonly />
      </TabPane>
      <TabPane :key="Tab.Plugin.toString()" tab="模型插件">
        <Textarea :rows="10" :value="code.plugin" readonly />
      </TabPane>
      <TabPane :key="Tab.Menu.toString()" tab="菜单">
        <Textarea :rows="10" :value="code.menu" readonly />
      </TabPane>
    </Tabs>
  </Modal>
</template>
