<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import templateUrl from '#/assets/excels/inventoryPlanLine.xls?url';
// 定义 emit 事件
const emit = defineEmits<{
  importSuccess: [data: any[]]; // 导入成功时传递数据
}>();

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
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('modalData', modalData);
    }
  },
});
const fileList = ref([]);
const handleChange = (info: UploadChangeParam<any>) => {
  modalApi?.lock();
  requestFormClient
    .upload('/inventoryPlanAction/importInventoryPlan.do', {
      file: info.file,
      inventoryPlanId: modalData.value.inventoryPlanId,
    })
    .then((res) => {
      if (res.success === true) {
        message.success(`导入成功!` + `<br/>${res.data.msg}`);
        emit('importSuccess', res);
        modalApi.close();
      } else {
        message.error(`导入失败：${res.msg}`);
        throw new Error(res);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      modalApi?.unlock();
    });
};
const beforeUpload = () => {
  return false;
};
</script>
<template>
  <Modal class="w-[500px]" title="导入" title-tooltip="上传excel文件导入数据">
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="templateUrl"
        download="盘点结果录入模板"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="a_downloadTemplate_importModal"
      >
        <AntdDownloadOutlined class="mr-[6px] text-[14px]" />盘点结果录入模版下载
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
        data-testid="button_importModal"
      >
        <p class="ant-upload-drag-icon flex justify-center">
          <AntdUploadloadOutlined class="text-[36px]" />
        </p>
        <p class="ant-upload-text">请将文件拖拽到此处导入</p>
        <p class="ant-upload-hint">仅支持文件后缀为.xls的Excel文件</p>
      </UploadDragger>
    </div>
  </Modal>
</template>
