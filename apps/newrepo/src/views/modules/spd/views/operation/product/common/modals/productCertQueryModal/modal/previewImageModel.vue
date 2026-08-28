<script setup lang="ts">
import type { FilePathsItem } from '../type';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Image } from 'ant-design-vue';

interface FilePath {
  fileId: string;
  path: string;
}

const prevImg = ref();
const imageList = ref<FilePath[]>([]);
const currentImageUrl = ref('');
const visible = ref(true);

const [ModalPriview, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  showConfirmButton: false,
  showCancelButton: false,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data = modalApi.getData();
      imageList.value = data.imageList;
      console.warn('imageList', imageList.value);
      // await nextTick();
      // 如果imageList有值，就取出第一项进行展示
      if (imageList.value.length > 0) {
        currentImageUrl.value = imageList.value[0]!.path;
        console.warn('currentImageUrl', currentImageUrl.value);
      }
    }
  },
});

const changeImage = (img: FilePathsItem) => {
  currentImageUrl.value = img.path;
};

const getHtmlContainer = () => {
  return () => prevImg.value;
};
</script>
<template>
  <ModalPriview class="h-[655px] w-[800px]" title="图片预览">
    <div class="flex h-full gap-3">
      <div class="fieldset-box w-full" title="证照图片">
        <div class="flex h-full flex-col gap-2 px-2.5 py-3">
          <div
            class="border-1 flex h-20 w-full flex-wrap gap-1 border border-[#b1b1b1] py-2"
          >
            <div
              v-if="!imageList || imageList.length === 0"
              class="flex h-full w-full items-center justify-center text-gray-400"
            >
              暂无图片
            </div>
            <div
              v-for="image in imageList"
              :key="image.fileId"
              class="file-list-item mx-2 h-16 w-16"
              :class="{
                'this-img': currentImageUrl === image.path,
              }"
              @click="changeImage(image)"
            >
              <img
                :src="image.path"
                alt="证照缩略图"
                class="h-full w-full cursor-pointer object-contain"
              />
            </div>
          </div>
          <div class="flex min-h-0 flex-1 items-center justify-center">
            <div v-if="!currentImageUrl" class="gallery">
              <div class="tip-box">暂无图片可预览</div>
            </div>
            <div class="preview-image" ref="prevImg">
              <!-- style="display: none" -->
              <Image
                class="invisible-source-image"
                :src="currentImageUrl"
                :preview="{
                  getContainer: getHtmlContainer(),
                  src: currentImageUrl,
                  visible,
                  maskClassName: 'ant-image-preview-mask',
                }"
                fallback="data:image/png;base64,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"
                :preview-mask="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalPriview>
</template>
<style scoped>
.gallery {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  color: #fff;
  text-align: center;
  background: rgb(0 0 0 / 30%);
  border: 0;

  .tip-box {
    margin-top: 25%;
  }
}

.file-list-item {
  padding: 5px;
  border-radius: 5px;
}

.this-img {
  box-shadow: 1px 2px 5px 1px #5b7bbb;
}

.preview-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.invisible-source-image {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  opacity: 0;
}

.preview-image ::v-deep(.ant-image) {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.preview-image ::v-deep(.ant-image-preview-wrap) {
  position: absolute;
}

.preview-image ::v-deep(.ant-image-error) {
  width: 100% !important;
  height: 100% !important;
  opacity: 1 !important;
}

.preview-image ::v-deep(.ant-image-error .ant-image-img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.preview-image
  ::v-deep(.ant-image-preview-body .ant-image-preview-operations-wrapper) {
  position: absolute;
}

.preview-image
  ::v-deep(.ant-image-preview-operations-operation:has(.anticon-close)) {
  display: none;
}

.preview-image ::v-deep(.ant-image-preview-mask) {
  position: absolute;
}
</style>
