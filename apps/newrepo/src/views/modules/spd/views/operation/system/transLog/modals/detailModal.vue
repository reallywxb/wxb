<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('编辑');
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
      setTimeout(() => {
        baseFormApi.setValues({
          ...serviceData.value,
          msgContent:
            serviceData.value.msgContent instanceof Object
              ? JSON.stringify(serviceData.value.msgContent, null, 2)
              : serviceData.value.msgContent,
        });
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=800107',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择服务器编号',
          paginate: false,
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
      fieldName: 'serverID',
      label: '服务器编号',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000353',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择消息类型',
          paginate: false,
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
      fieldName: 'transType',
      label: '消息类型',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000489',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择处理状态',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          showChooseAll: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'transResult',
      label: '处理状态',
    },
    {
      component: 'DatePicker',
      fieldName: 'transTime',
      label: '消息时间',
      rules: 'required',
      componentProps: () => {
        return {
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'transMethod',
      label: '调用方法',
      rules: 'required',
      componentProps: {
        placeholder: '请输入调用方法',
      },
    },

    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=319',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          showChooseAll: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'isActive',
      label: '有效',
    },

    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入消息内容',

        style: { minHeight: '200px' },
      },
      fieldName: 'msgContent',
      formItemClass: 'col-span-3',
      label: '消息内容',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入调用结果',
        style: { minHeight: '100px' },
      },
      fieldName: 'msgResult',
      formItemClass: 'col-span-3',
      label: '调用结果',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-3',
});
async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();
    saveDo({
      ...formData,
      transLogId: serviceData.value.transLogId || undefined,
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
  <Modal class="h-[700px] w-[1000px]" :title="title" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        class="mr-[0.5rem]"
        @click="onSubmit"
        data-testid="button_submit_detailModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
