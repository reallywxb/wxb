<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'CommonImportModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  formSchemas?: Array<any>;
  httpRequest: (params: any) => Promise<any>;
  keyword?: string;
  templateUrl?: string;
}>();

const fileList = ref([]);

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  commonConfig: {
    controlClass: 'w-full',
    colon: true,
  },
  schema: props.formSchemas ?? [],
  showDefaultActions: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  closeOnClickModal: false,
  footer: false,
  onClosed() {
    modalApi.setState({
      loading: false,
    });
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {},
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // param.value = modalApi.getData() as Param;
    }
  },
});

async function handleChange(info: UploadChangeParam<any>) {
  if (props.formSchemas?.length) {
    const { valid } = await formApi.validate();

    if (!valid) {
      message.error('请正确配置表单');
      return;
    }
  }

  modalApi.setState({
    loading: true,
  });

  try {
    const { success, msg } = await props.httpRequest({
      file: info.file,
      ...(props.formSchemas?.length ? await formApi.getValues() : null),
    });

    if (success) {
      message.success('导入成功');

      modalApi.close();

      props.afterSubmit?.();
    } else {
      modalApi.setState({
        loading: false,
      });

      message.error(msg);
    }
  } catch {
    message.error('导入失败');
  }
}

defineExpose(modalApi);
</script>
<template>
  <Modal :title="`${keyword}导入`" title-tooltip="上传excel文件导入数据">
    <div class="pl-[10px] pr-[10px]">
      <Form v-if="props.formSchemas?.length" />
      <template v-if="templateUrl">
        <a
          :href="templateUrl"
          download
          class="inline-flex text-[14px] hover:text-[#707070]"
        >
          <AntdDownloadOutlined class="mr-[6px] text-[14px]" />
          <span>{{ `${keyword}导入模版下载` }}</span>
        </a>
      </template>
      <UploadDragger
        v-model:file-list="fileList"
        name="file"
        accept=".xlsx,.xls"
        :multiple="false"
        :before-upload="() => false"
        @change="handleChange"
        :show-upload-list="false"
        class="mt-[16px]"
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

<style lang="scss" scoped>
.reminder {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 14px;
  font-size: 12px;

  &:hover {
    color: #278df2;
  }
}
</style>
