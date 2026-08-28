<script setup lang="ts">
import { computed, ref } from 'vue';

import { Image } from 'ant-design-vue';

const props = withDefaults(
  defineProps<{
    type?: 'image' | 'pdf';
    url: string;
  }>(),
  {
    type: 'image',
  },
);
const prevImg = ref();
const visible = ref(true);
const getHtmlContainer = () => {
  return () => prevImg.value;
};

// 计算是否显示 PDF iframe
const showPdf = computed(() => props.type === 'pdf');
// 计算是否显示图片预览
const showImage = computed(() => props.type !== 'pdf');
</script>
<template>
  <div class="preview-image" ref="prevImg">
    <!-- PDF 预览 -->
    <iframe
      v-show="showPdf"
      :src="props.url"
      class="preview-pdf"
      frameborder="0"
    />
    <!-- 图片预览 -->
    <div v-show="showImage">
      <Image
        :src="url"
        style="display: none"
        :preview="{
          getContainer: getHtmlContainer(),
          src: props.url,
          visible: showImage && visible,
          maskClassName: 'ant-image-preview-mask',
        }"
        :preview-mask="false"
      />
    </div>
  </div>
</template>
<style scoped>
.preview-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-image ::v-deep(.ant-image-preview-wrap) {
  position: absolute;
}

.preview-image
  ::v-deep(.ant-image-preview-body .ant-image-preview-operations-wrapper) {
  position: absolute;
}

.preview-image
  ::v-deep(.ant-image-preview-body .ant-image-preview-img-wrapper) {
  align-items: normal;
}

.preview-image
  ::v-deep(.ant-image-preview-operations-operation:has(.anticon-close)) {
  display: none;
}

.preview-image ::v-deep(.ant-image-preview-mask) {
  position: absolute;
}
</style>
