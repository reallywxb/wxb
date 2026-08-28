<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Carousel as AntCarousel, Image } from 'ant-design-vue';

interface ImgItem {
  id?: string;
  path: string;
}
const prevImg = ref();

const currentImageUrl = ref('');
const visible = ref(true);
const currentId = ref<number | string | undefined>('');

const modalOuterData = ref<{
  callbackWhenClose?: () => void;
  imageList: ImgItem[];
}>({
  imageList: [],
});

const [ModalPreview, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
    const modalData = modalApi.getData<Record<string, any>>();
    modalData?.callbackWhenClose?.();
  },
  showConfirmButton: false,
  showCancelButton: false,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const data: any = modalApi.getData();

      modalOuterData.value = data;

      if (isEmpty(data.imageList)) {
        prevImg.value = null;
        currentImageUrl.value = '';
        currentId.value = undefined;
        return;
      }
      currentImageUrl.value = data.imageList[0]!.path;
      currentId.value = data.imageList[0]!.id;
    }
  },
});

const changeImage = (img: ImgItem) => {
  currentImageUrl.value = img.path;
  currentId.value = img.id;
};

const getHtmlContainer = () => {
  return () => prevImg.value;
};
</script>
<template>
  <ModalPreview class="h-[655px] w-[800px]" title="预览">
    <div class="flex h-full gap-3">
      <div class="fieldset-box w-full">
        <div class="flex h-full flex-col gap-2 px-2.5 py-3">
          <div
            class="border-1 flex h-20 w-full items-center justify-center border border-[#b1b1b1]"
          >
            <div
              v-if="modalOuterData.imageList.length === 0"
              class="flex h-full w-full items-center justify-center text-gray-400"
            >
              暂无图片
            </div>
            <AntCarousel
              :slides-to-show="Math.min(10, modalOuterData.imageList.length)"
              :slides-to-scroll="Math.min(10, modalOuterData.imageList.length)"
              arrows
              :infinite="false"
              class="w-[750px]"
              :dots="false"
            >
              <template #prevArrow>
                <div class="custom-slick-arrow" style="left: 5px; z-index: 1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#888888"
                      d="m603.3 327.5l-246 178a7.95 7.95 0 0 0 0 12.9l246 178c5.3 3.8 12.7 0 12.7-6.5V643c0-10.2-4.9-19.9-13.2-25.9L457.4 512l145.4-105.2c8.3-6 13.2-15.6 13.2-25.9V334c0-6.5-7.4-10.3-12.7-6.5"
                    />
                    <path
                      fill="#888888"
                      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372s372 166.6 372 372s-166.6 372-372 372"
                    />
                  </svg>
                </div>
              </template>
              <template #nextArrow>
                <div class="custom-slick-arrow" style="right: 10px">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      fill="#888888"
                      d="m666.7 505.5l-246-178A8 8 0 0 0 408 334v46.9c0 10.2 4.9 19.9 13.2 25.9L566.6 512L421.2 617.2c-8.3 6-13.2 15.6-13.2 25.9V690c0 6.5 7.4 10.3 12.7 6.5l246-178c4.4-3.2 4.4-9.8 0-13"
                    />
                    <path
                      fill="#888888"
                      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372s372 166.6 372 372s-166.6 372-372 372"
                    />
                  </svg>
                </div>
              </template>
              <div
                v-for="item in modalOuterData.imageList"
                :key="item.id"
                class="thumbnail-item box-border flex h-20 w-20 min-w-20 max-w-20 items-center justify-center"
              >
                <div
                  class="box-border flex h-20 w-full items-center justify-center"
                >
                  <div
                    class="box-border h-16 w-16 min-w-16 max-w-16 rounded-[5px] p-[5px]"
                    :class="{
                      'this-img': currentId === item.id,
                    }"
                    @click="changeImage(item)"
                  >
                    <img
                      :src="item.path"
                      alt="缩略图"
                      class="h-full w-full cursor-pointer object-contain"
                    />
                  </div>
                </div>
              </div>
            </AntCarousel>
          </div>
          <div class="flex min-h-0 flex-1 items-center justify-center">
            <div v-if="!currentImageUrl" class="gallery">
              <div class="tip-box">暂无图片可预览</div>
            </div>
            <div v-else class="preview-image" ref="prevImg">
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
  </ModalPreview>
</template>
<style lang="less" scoped>
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
::v-deep(.ant-carousel .thumbnail-item) {
  // width: 80px !important;
  max-width: 80px !important;
}
::v-deep(.ant-carousel .slick-active) {
  max-width: 80px !important;
  // width: 80px !important;
}
::v-deep(.ant-carousel .slick-list) {
  height: 80px;
}
::v-deep(.ant-carousel .slick-track) {
  height: 80px;
}
// ::v-deep(.slick-slide) {
//   text-align: center;
//   // height: 160px;
//   // line-height: 160px;
//   //  background: #364d79;
//   overflow: hidden;
// }

// ::v-deep(.slick-arrow.custom-slick-arrow) {
//   width: 25px;
//   height: 25px;
//   font-size: 25px;
//   color: #fff;
//   background-color: rgba(31, 45, 61, 0.11);
//   transition: ease all 0.3s;
//   opacity: 0.3;
//   z-index: 1;
// }
// ::v-deep(.slick-arrow.custom-slick-arrow:before) {
//   display: none;
// }
// ::v-deep(.slick-arrow.custom-slick-arrow:hover) {
//   color: #fff;
//   opacity: 0.5;
// }

// ::v-deep(.slick-slide h3) {
//   color: #fff;
// }
</style>
