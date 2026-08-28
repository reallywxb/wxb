<script setup lang="ts">
import type { UploadFile, UploadProps } from 'ant-design-vue';
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface';

import { ref, watch } from 'vue';

import { Plus } from '@vben/chc-icons';

import { message, Modal, Upload } from 'ant-design-vue';

import { uploadFileApi } from '#/views/modules/flow/api/file';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array,
    default: [] as Array<Object>,
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 10,
  },
  /**
   * 文件上传大小限制
   */
  maxSize: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(['update:modelValue']);

const previewImgUrl = ref('');
const dialogVisible = ref(false);

const fileList = ref([] as UploadFile[]);
watch(
  () => props.modelValue,
  (newVal: string[]) => {
    const filePaths = fileList.value.map((file) => file.response || file.url);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === newVal.length &&
      filePaths.every((x) => newVal.includes(x)) &&
      newVal.every((y) => filePaths.includes(y))
    ) {
      return;
    }

    // 判断url
    if (fileList.value.length === newVal.length) {
      let match = true;
      const urlArray1 = fileList.value.map((w) => w.response || w.url).sort();
      const urlArray2 = newVal.map((w) => w.url).sort();
      for (const [k, element] of urlArray1.entries()) {
        if (element !== urlArray2[k]) {
          match = false;
          break;
        }
      }
      if (match) {
        return;
      }
    }

    fileList.value = newVal.map((filePath) => {
      return { url: filePath.url, name: filePath.name } as UploadFile;
    });
  },
  { immediate: true },
);

/**
 * 自定义图片上传
 *
 * @param options
 */
async function handleUpload(options: UploadRequestOption): Promise<any> {
  // 上传API调用
  try {
    // data即为图片相对路径
    const data = await uploadFileApi(options.file as File);

    // 调用onSuccess方法将接口返回数据记录到 uploadFile 对象的response字段中
    options.onSuccess?.(data);

    emit(
      'update:modelValue',
      fileList.value.map((file) => {
        return {
          url: file.response,
          name: file.name,
        };
      }),
    );
  } catch {}
}

/**
 * 删除图片
 */
function handleRemove(file: UploadFile) {
  const filePath = file.response || file.url;

  if (filePath) {
    emit(
      'update:modelValue',
      fileList.value.map((file) => {
        return {
          url: file.response || file.url,
          name: file.name,
        };
      }),
    );
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadFile) {
  if (!(file.type as string).includes('image')) {
    message.error('请选择图片');
    return Upload.LIST_IGNORE;
  }
  if ((file.size as number) > props.maxSize * 1048 * 1048) {
    message.error(`上传图片不能大于${props.maxSize}M`);
    return Upload.LIST_IGNORE;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps['onPreview'] = (file: UploadFile) => {
  previewImgUrl.value = file.response || file.url;
  dialogVisible.value = true;
};
</script>
<template>
  <Upload
    v-model:file-list="fileList"
    list-type="picture-card"
    class="single-uploader"
    :before-upload="handleBeforeUpload"
    :custom-request="handleUpload"
    :on-remove="handleRemove"
    :on-preview="previewImg"
    :max-count="props.limit"
    :disabled="disabled"
  >
    <Plus class="single-uploader-icon" />
  </Upload>

  <Modal v-model:open="dialogVisible">
    <img class="w-full" :src="previewImgUrl" alt="Preview Image" />
  </Modal>
</template>

<style scoped lang="less">
:deep(.el-upload) {
  width: 80px;
  height: 80px;
}
:deep(.el-upload-list__item) {
  width: 80px;
  height: 80px;
}

.single-uploader .single {
  display: block;
  width: 80px;
  height: 80px;
}

.single-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  transition: 0.2s;
}

.single-uploader .el-upload:hover {
  border-color: #409eff;
}

.el-icon.single-uploader-icon {
  width: 80px;
  height: 80px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
</style>
