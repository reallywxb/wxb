<script setup lang="ts">
import type { UploadFile } from 'ant-design-vue/es/upload';
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface';

import { Plus } from '@vben/chc-icons';

import { Form, message, Upload } from 'ant-design-vue';

import { uploadFileApi } from '#/views/modules/flow/api/file';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const formItemContext = Form.useInjectFormItemContext();

/**
 * 自定义图片上传
 *
 * @param options
 */
async function uploadFile(options: UploadRequestOption): Promise<any> {
  try {
    const data = await uploadFileApi(options.file as File);
    emit('update:modelValue', data);
    emit('change', data);

    // 触发change事件
    formItemContext.onFieldChange();
  } catch {
    message.error('图片上传失败');
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadFile) {
  if (!/image\/\w+/.test(file.type as string)) {
    message.warning('请上传图片');

    return Upload.LIST_IGNORE;
  }

  if ((file.size as number) > 2 * 1048 * 1048) {
    message.warning('上传图片不能大于2M');

    return Upload.LIST_IGNORE;
  }
  return true;
}
</script>

<template>
  <!-- 上传组件 -->
  <Upload
    class="single-uploader"
    :show-upload-list="false"
    list-type="picture-card"
    :before-upload="handleBeforeUpload"
    :custom-request="uploadFile"
  >
    <img v-if="modelValue" :src="modelValue" class="single" />
    <Plus v-else class="single-uploader-icon" />
  </Upload>
</template>

<style scoped lang="scss">
.single-uploader {
  :deep(span.ant-upload) {
    padding: 10px;
  }

  .single {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .single-uploader-icon {
    width: 28px;
    height: 28px;
    color: #8c939d;
  }

  &:hover {
    .single-uploader-icon {
      color: #409eff;
    }
  }
}
</style>
