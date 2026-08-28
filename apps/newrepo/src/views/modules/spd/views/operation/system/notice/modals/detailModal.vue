<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveNotice } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
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
      serviceData.value = modalApi.getData<Record<string, any>>();
      title.value = serviceData.value.noticeId ? '修改通知' : '添加通知';
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
      fieldName: 'title',
      label: '标题',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入标题',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000386',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择通知类型',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      formItemClass: 'col-start-1',
      fieldName: 'noticeType',
      label: '通知类型',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=154',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择优先级',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'priority',
      label: '优先级',
    },
    {
      component: 'Quill',
      fieldName: 'content',
      label: '描述',
      formItemClass: 'col-start-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '请输入描述',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
async function onSubmit() {
  const formData = await baseFormApi.getValues();
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    saveNotice({
      ...formData,
      noticeId: serviceData.value.noticeId || undefined,
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
        data-testid="button_submit_detailModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
