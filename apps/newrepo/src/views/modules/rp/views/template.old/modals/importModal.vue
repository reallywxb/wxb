<script lang="ts" setup>
import { ref } from 'vue';

import { AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';

import { uploadContent } from '../api';

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    // modalApi.close();
  },
  // onOpenChange(isOpen: boolean) {
  //   if (isOpen) {
  //   }
  // },
});

const fileList = ref([]);

const handleChange = async () => {
  uploadContent({}).then((res) => {
    if (res.success) {
      message.info(res.data?.msg);
    } else {
      message.error(`导入失败:${res.msg}`);
    }
  });
};
const beforeUpload = () => {
  return false;
};
</script>
<template>
  <Modal class="w-[500px]" title="上传模板">
    <div class="pl-[10px] pr-[10px]">
      <UploadDragger
        v-model:file-list="fileList"
        name="file"
        accept=".xlsx,.xls"
        :multiple="false"
        :before-upload="beforeUpload"
        @change="handleChange"
        :show-upload-list="false"
        class="mt-[16px]"
        data-testid="button_upload_importModal"
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
