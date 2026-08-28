<script setup lang="ts">
import type { UploadFile, UploadProps } from 'ant-design-vue/es/upload';
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface';

import { ref, watch } from 'vue';

import { Button, message, Upload } from 'ant-design-vue';

import { uploadFileApi } from '#/views/modules/flow/api/file';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 后缀
   */
  suffixArray: {
    type: Array,
    default: () => [],
  },
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array<Object>,
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

const fileList = ref([] as UploadFile[]);

watch(
  () => props.modelValue,
  (newVal: string[]) => {
    const filePaths = fileList.value.map((file) => file.response || file.url);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === newVal.length &&
      filePaths.every((x) => newVal.includes(x as string)) &&
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
  try {
    // data即为文件相对路径
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
    // deleteFileApi(filePath).then(() => {
    // 删除成功回调
    emit(
      'update:modelValue',
      fileList.value.map((file) => {
        return {
          url: file.response || file.url,
          name: file.name,
        };
      }),
    );
    // });
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadFile) {
  const name = file.name;
  const suffix = name.slice(Math.max(0, name.lastIndexOf('.') + 1));
  if (!props.suffixArray.indexOf(suffix) && props.suffixArray.length > 0) {
    message.warning(`表单不支持文件格式：${suffix}`);
    return Upload.LIST_IGNORE;
  }

  if ((file.size as number) > props.maxSize * 1048 * 1048) {
    message.warning(`上传文件不能大于${props.maxSize}M`);
    return Upload.LIST_IGNORE;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps['onPreview'] = (file: UploadFile) => {
  window.open(file.response || file.url);
};
</script>

<template>
  <Upload
    v-model:file-list="fileList"
    :before-upload="handleBeforeUpload"
    :custom-request="handleUpload"
    :on-remove="handleRemove"
    :on-preview="previewImg"
    :max-count="props.limit"
    :disabled="disabled"
  >
    <Button :disabled="disabled" :type="disabled ? 'default' : 'primary'">
      选择文件
    </Button>
    <div class="tip" v-if="suffixArray?.length > 0">
      支持文件格式：{{ suffixArray.join(',') }}
    </div>
  </Upload>
</template>

<style lang="scss" scoped>
.tip {
  margin-top: 7px;
  font-size: 12px;
  color: #606266;
}
</style>
