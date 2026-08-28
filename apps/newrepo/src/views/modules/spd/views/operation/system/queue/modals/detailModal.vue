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
      fieldName: 'serverID',
      label: '服务器编号',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=800105',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择队列类型',
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
      fieldName: 'queueType',
      label: '队列类型',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=800106',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择队列状态',
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
      fieldName: 'queueStatus',
      label: '队列状态',
    },
    {
      component: 'DatePicker',
      fieldName: 'msgTime',
      label: '消息时间',
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
      fieldName: 'msgGroup',
      label: '消息分组',
      componentProps: {
        placeholder: '请输入消息分组',
      },
    },
    {
      component: 'Input',
      fieldName: 'msgType',
      label: '消息类型',
      componentProps: {
        placeholder: '请输入消息类型',
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          defaultValue: '',
          // dictUrl: '/orderPlanAction/commit.do',
          options: [
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
        };
      },
      fieldName: 'isActive',
      label: '有效',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          defaultValue: '',
          // dictUrl: '/orderPlanAction/commit.do',
          options: [
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
        };
      },
      fieldName: 'runNow',
      label: '立即运行',
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
        placeholder: '请输入错误消息',
        style: { minHeight: '100px' },
      },
      fieldName: 'errorMsg',
      formItemClass: 'col-span-3',
      label: '错误消息',
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
      queueId: serviceData.value.queueId || undefined,
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
        @click="onSubmit"
        data-testid="button_submit_detailModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
