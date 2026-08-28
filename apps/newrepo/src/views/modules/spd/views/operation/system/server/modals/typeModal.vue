<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      title.value = serviceData.value.AD_Server_ID ? '修改' : '新增';
      setTimeout(() => {
        baseFormApi.setValues(serviceData.value);
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'Name',
      label: '名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Value',
      label: '编码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入编码',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Protocol',
      label: '协议',
      componentProps: () => {
        return {
          placeholder: '请输入协议',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'HostAddress',
      label: '主机地址',
      componentProps: () => {
        return {
          placeholder: '请输入主机地址',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'HostPort',
      label: '主机端口',
      componentProps: () => {
        return {
          placeholder: '请输入主机端口',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'ServerPath',
      label: 'Server路径',
      componentProps: () => {
        return {
          placeholder: '请输入Server路径',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'ServerUser',
      label: '服务器用户',
      componentProps: () => {
        return {
          placeholder: '请输入服务器用户',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Password',
      label: '密码',
      componentProps: () => {
        return {
          placeholder: '请输入密码',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'PublicKey',
      label: '公钥',
      componentProps: () => {
        return {
          placeholder: '请输入公钥',
        };
      },
    },

    {
      component: 'Switch',
      fieldName: 'IsActive',
      label: '是否有效',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入扩展参数',
          type: 'textarea',
        };
      },
      formItemClass: 'col-span-2',
      fieldName: 'Param',
      label: '扩展参数',
    },
    {
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入描述',
          type: 'textarea',
        };
      },
      formItemClass: 'col-span-2',
      fieldName: 'Description',
      label: '描述',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
async function onSubmit() {
  const formData = await baseFormApi.getValues();
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    saveDo({
      ...formData,
      AD_Server_ID: serviceData.value.AD_Server_ID || undefined,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '保存成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="w-[700px]" :title="title" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_save_typeModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
