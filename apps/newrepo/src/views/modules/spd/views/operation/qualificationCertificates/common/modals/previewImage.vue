<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Image } from 'ant-design-vue';

const prevImg = ref();
const imageList = ref<any[]>([]);
const currentImageUrl = ref('');
const visible = ref(true);
const currentId = ref('');
const currentType = ref<'image' | 'pdf'>('image');

interface filePathItem {
  path: string;
  fileId: string;
  [key: string]: any;
}

const isPdf = (path: string): boolean => {
  if (!path) return false;
  try {
    const match = path.match(/filePath=([^&]+)/);
    if (match) {
      const filePath = decodeURIComponent(match[1]!);
      return filePath.toLowerCase().endsWith('.pdf');
    }
    return path.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
};

const showPdf = computed(() => !!currentImageUrl.value && currentType.value === 'pdf');
const showImage = computed(() => !!currentImageUrl.value && currentType.value === 'image');

const [PreviewModal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  showConfirmButton: false,
  showCancelButton: false,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data = modalApi.getData();
      // 这里会调用接口，获取全路径图片接口
      imageList.value = data.imageList;
      console.warn('imageList', imageList.value);
      // const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
      // console.warn('apiURL', apiURL);
      // console.warn('window==>', window.location);
      // await nextTick();
      // 如果imageList有值，就取出第一项进行展示
      if (Array.isArray(imageList.value) && imageList.value.length > 0) {
        currentImageUrl.value = imageList.value[0]!.path;
        currentId.value = imageList.value[0]!.fileId;
        currentType.value = isPdf(imageList.value[0]!.path) ? 'pdf' : 'image';
        console.warn('currentImageUrl', currentImageUrl.value);
      }
    } else {
      currentType.value = 'image';
    }
  },
});

const changeImage = (img: filePathItem) => {
  currentImageUrl.value = img.path;
  currentId.value = img.fileId;
  currentType.value = isPdf(img.path) ? 'pdf' : 'image';
};

const getHtmlContainer = () => {
  return () => prevImg.value;
};
</script>
<template>
  <PreviewModal class="h-[655px] w-[800px]" title="图片预览">
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
              v-for="(image, imageIndex) in imageList"
              :key="image.fileId"
              class="file-list-item mx-2 h-16 w-16"
              :class="{
                'this-img': currentId === image.fileId,
              }"
              @click="changeImage(image)"
              :data-testid="`button_viewPicture_${imageIndex}_previewImage`"
            >
              <div
                v-if="isPdf(image.path)"
                class="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gray-100 text-xs text-gray-500"
              >
                <span class="text-lg font-bold">PDF</span>
              </div>
              <img
                v-else
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
            <iframe
              v-show="showPdf"
              :src="currentImageUrl"
              class="preview-pdf"
              frameborder="0"
            />
            <div v-show="showImage" class="preview-image" ref="prevImg">
              <Image
                class="invisible-source-image"
                :src="currentImageUrl"
                :preview="{
                  getContainer: getHtmlContainer(),
                  src: currentImageUrl,
                  visible: showImage && visible,
                  maskClassName: 'ant-image-preview-mask',
                }"
                :preview-mask="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </PreviewModal>
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

.preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
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
