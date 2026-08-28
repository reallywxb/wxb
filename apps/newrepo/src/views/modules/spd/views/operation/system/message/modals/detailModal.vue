<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { importMessage, saveMessage } from '../api';

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
      component: 'Input',
      fieldName: 'msgType',
      label: '消息类型',
      componentProps: {
        placeholder: '请输入消息类型',
      },
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000354',
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
      fieldName: 'processStatus',
      label: '处理状态',
    },

    {
      component: 'Input',
      fieldName: 'recordNo',
      label: '记录号',
      componentProps: {
        placeholder: '请输入记录号',
      },
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
        placeholder: '请输入处理消息',
        style: { minHeight: '100px' },
      },
      fieldName: 'processMsg',
      formItemClass: 'col-span-3',
      label: '处理消息',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-3',
});
async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();
    saveMessage({
      ...formData,
      messageId: serviceData.value.messageId || undefined,
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

async function handleImport() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();
    importMessage({
      ...formData,
      messageId: serviceData.value.messageId || undefined,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: `共处理${res.data.totalCnt}消息，其中${
            res.data.errorCnt
          }个消息处理失败`,
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
        data-testid="button_save_detailModal"
      >
        保存
      </Button>
      <Button
        type="primary"
        @click="handleImport"
        data-testid="button_import detailModal"
      >
        导入
      </Button>
    </template>
  </Modal>
</template>
