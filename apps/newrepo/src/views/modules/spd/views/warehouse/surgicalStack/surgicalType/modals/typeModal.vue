<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';

const emit = defineEmits(['close']);
const typeData = ref<any>({});
// application/vnd.ms-excel;base64,
const title = ref('');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
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
      typeData.value = modalApi.getData<Record<string, any>>();

      title.value = typeData.value.surgicalTypeId ? '修改术式' : '添加术式';
      if (typeData.value.surgicalTypeId) {
        setTimeout(() => {
          baseFormApi.setValues(typeData.value);
        }, 100);
      }
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

  // 提交函数
  // handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: '编码',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入编码',
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isStockup',
      label: '是否预备货',
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
      component: 'Switch',
      fieldName: 'isActive',
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
          placeholder: '请输入描述',
          type: 'textarea',
        };
      },
      formItemClass: 'col-span-2',
      fieldName: 'description',
      label: '描述',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    if (!res.name) {
      message.warn('请输入名称');
      return;
    }
    if (!res.value) {
      message.warn('请输入编码');
      return;
    }
    // ChcGridApi.query({ ...res });
    saveDo({
      ...res,
      id: typeData.value.surgicalTypeId || undefined,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  });
  // message.success({
  //   content: `form values: ${JSON.stringify(values)}`,
  // });
}
</script>
<template>
  <Modal class="w-[700px]" :title="title" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_typeModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>
