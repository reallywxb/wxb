<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { Textarea } from 'ant-design-vue';

import MultiUpload from '../../../Upload/MultiUpload.vue';
import MultiUploadFile from '../../../Upload/MultiUploadFile.vue';

defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <div style="height: 300px">
    <Textarea
      v-model:value="content.approveDesc"
      :maxlength="100"
      :auto-size="{ minRows: 2, maxRows: 6 }"
      placeholder="审核意见"
      show-count
    />

    <div style="margin-top: 10px; text-align: left">
      <div style="margin-bottom: 10px; font-size: 12px">添加图片</div>
      <MultiUpload
        v-model="content.approveImageList"
        :limit="10"
        :max-size="10"
      />
    </div>

    <div style="margin-top: 10px; text-align: left">
      <div style="margin-bottom: 10px; font-size: 12px">添加文件</div>
      <MultiUploadFile v-model="content.approveFileList" />
    </div>
  </div>
</template>

<style scoped lang="less"></style>
