<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import shipmentPackage from '#/assets/excels/shipmentPackage.base64?raw';
import excelUrl from '#/assets/excels/warehouse.xls?url';

import { importWarehouseData } from '../api';

// 定义 emit 事件
const emit = defineEmits<{
  importSuccess: [data: any[]]; // 导入成功时传递数据
}>();
// application/vnd.ms-excel;base64,
const base64Data = atob(shipmentPackage);
const byteArray = new Uint8Array(base64Data.length);
// console.log(byteArray);
for (let i = 0; i < base64Data.length; i++) {
  byteArray[i] = base64Data.codePointAt(i)!;
}
const blob = new Blob([byteArray], {
  type: 'application/vnd.ms-excel',
});
const url = URL.createObjectURL(blob);
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    console.warn('onCancel', url);
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
// const extParams = ref({ bpartnerId_text: '', departmentId_text: '' });
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
  // fieldMappingTime: [['rangePicker', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'vertical',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
const fileList = ref([]);
const handleChange = (info: UploadChangeParam<any>) => {
  baseFormApi.getValues().then((res) => {
    console.warn('info', info, res);
    // // 关闭模态框
    // modalApi.close();
    // 弹窗加锁，显示loading
    modalApi.lock();
    importWarehouseData({ file: info.file })
      .then((res) => {
        modalApi.unlock();
        if (res.success) {
          // message.info(res.data?.msg);
          // 导入成功后，将后端返回的数据传递给父组件
          if (res.data && res.data?.msg) {
            message.warn(res.data?.msg);
            emit('importSuccess', res.data?.msg);
            return;
          } else {
            message.success(res?.msg || '导入成功');
            emit('importSuccess', res.msg);
          }
          // 关闭模态框
          modalApi.close();
        } else {
          message.error(`导入失败:${res.msg}`);
        }
      })
      .catch(() => {
        modalApi.unlock();
      });
  });
};
const beforeUpload = () => {
  return false;
};
</script>
<template>
  <Modal
    class="w-[500px]"
    title="货位仓库"
    title-tooltip="上传excel文件导入数据"
  >
    <BaseForm />
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="excelUrl"
        download="仓库模板"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button_download_importWarehouseModal"
      >
        <AntdDownloadOutlined class="mr-[6px] text-[14px]" />仓库模板下载
      </a>
      <UploadDragger
        v-model:file-list="fileList"
        name="file"
        accept=".xlsx,.xls"
        :multiple="false"
        :before-upload="beforeUpload"
        @change="handleChange"
        :show-upload-list="false"
        class="mt-[16px]"
        data-testid="button_UploadDragger_importWarehouseModal"
      >
        <p class="ant-upload-drag-icon flex justify-center">
          <AntdUploadloadOutlined class="text-[36px]" />
        </p>
        <p class="ant-upload-text">请将文件拖拽到此处导入</p>
        <p class="ant-upload-hint">仅支持文件后缀为.xlsx,.xls的Excel文件</p>
      </UploadDragger>
    </div>
  </Modal>
</template>
