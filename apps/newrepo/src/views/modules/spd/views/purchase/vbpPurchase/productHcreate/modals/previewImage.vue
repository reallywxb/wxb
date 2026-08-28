<script setup lang="ts">
import { ref } from 'vue';

import { Image } from 'ant-design-vue';

// const props = withDefaults(
//   defineProps<{
//     url: string;
//   }>(),
//   {
//     url: '',
//   },
// );
const props = defineProps<{
  url: string;
}>();
const prevImg = ref();
const visible = ref(true);
const getHtmlContainer = () => {
  return () => prevImg.value;
};
</script>
<template>
  <div class="preview-image" ref="prevImg">
    <Image
      :src="url"
      style="display: none"
      :preview="{
        getContainer: getHtmlContainer(),
        src: props.url,
        visible,
        maskClassName: 'ant-image-preview-mask',
      }"
      :preview-mask="false"
    />
  </div>
</template>
<style scoped>
.preview-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
