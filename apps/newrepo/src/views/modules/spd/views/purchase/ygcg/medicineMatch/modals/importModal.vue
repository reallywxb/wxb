<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import templateUrl from '#/assets/excels/ysmb.xls?url';

const modalData = ref<Record<string, any>>({});
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
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
    }
  },
});

const fileList = ref([]);
const handleChange = (info: UploadChangeParam<any>) => {
  requestFormClient
    .upload('/ygcgProductAction/importProductMatch.do', {
      file: info.file,
      orgId: modalData.value.orgId, // 医院ID
    })
    .then((res) => {
      if (res.success) {
        message.info(res.data?.msg || res?.msg);
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
  <Modal
    class="w-[500px]"
    title="药品匹配导入"
    title-tooltip="上传excel文件导入数据"
  >
    <BaseForm />
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="templateUrl"
        download="药品匹配模板.xls"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button_download_importModal"
      >
        <AntdDownloadOutlined class="mr-[6px] text-[14px]" />药品匹配模板下载
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
        data-testid="button_upload_dragger_importModal"
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
