<script setup lang="ts">
import { computed, ref } from 'vue';

import { SvgCloseIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import PreviewImage from '#/views/modules/spd/views/operation/qualificationCertificates/reviewRecord/previewImage.vue';

const state = ref();

// 新增：用于存储解析后的图片列表
const imageList = ref<{ fileId: string; path: string }[]>([]);
// 新增：用于存储当前正在预览的图片 URL
const currentImage = ref('');
// 新增：当前预览类型（image 或 pdf）
const currentType = ref<'image' | 'pdf'>('image');
// 判断文件是否为 PDF
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

const certConfig = [
  {
    name: '证照类型',
    prop: 'certTypeName',
  },
  {
    name: '证照号码',
    prop: 'certNo',
  },
  {
    name: '有效期',
    // prop: ['certDate', 'certValidTo', 'validityType'],
    prop: 'validityPeriod', // 使用一个特殊的 prop 值来标识这个字段需要特殊处理
  },
  {
    name: '备注',
    prop: 'description',
  },
];

const authorizeConfig = [
  { name: '授权企业', prop: 'authorizeCompanyName' },
  { name: '被授权企业', prop: 'toAuthorizeCompanyName' },
  { name: '有效期', prop: 'validityPeriod' },
  { name: '备注', prop: 'description' },
];

const contractConfig = [
  { name: '合同名', prop: 'contractNo', width: '60px' },
  { name: '有效期', prop: 'validityPeriod', width: '60px' },
  { name: '备注', prop: 'description', width: '60px' },
];

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  showConfirmButton: false,
  showCancelButton: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      state.value = modalApi.getData();
      console.warn('打开了预览', state.value);
      if (state.value?.data?.filePaths) {
        try {
          // 解析 filePaths 字符串为图片列表
          imageList.value = JSON.generalParse(
            state.value?.data?.filePaths || '[]',
          );
          // console.warn('图片列表', imageList.value);
          // 初始化当前预览图片为列表的第一个图片
          if (imageList.value.length > 0) {
            currentImage.value = imageList.value[0]!.path;
            currentType.value = isPdf(imageList.value[0]!.path) ? 'pdf' : 'image';
          }
        } catch (error) {
          console.error('解析 filePaths 失败:', error);
        }
      } else {
        imageList.value = [];
        currentImage.value = '';
      }
    } else {
      state.value = null;
      imageList.value = [];
      currentImage.value = '';
      currentType.value = 'image';
    }
  },
});

// 动态生成右侧基本信息
const displayInfo = computed(() => {
  if (!state.value?.data) {
    return [];
  }
  const data = state.value.data;
  const processedData = data.processedData;
  // 根据btnType选择配置
  let activeConfig = certConfig;
  switch (processedData?.btnType) {
    case 'authorize':
    case 'authorizeLines': {
      activeConfig = authorizeConfig;
      break;
    }
    case 'contract': {
      activeConfig = contractConfig;
      break;
    }
    case 'productCert': {
      activeConfig = getProductCertConfig(processedData.index || 0);
      break;
    }
    default: {
      activeConfig = certConfig;
    }
  }
  const result: any = [];

  activeConfig.forEach((item) => {
    const value =
      item.prop === 'validityPeriod' ? formatValidity(data) : data[item.prop];

    // 只有当值不为null 或者undefined时才添加到结果中
    if (value !== null && value !== undefined) {
      result.push({
        name: item.name,
        value,
      });
    }
  });
  return result;
});

// 产品证照配置 - 根据索引决定是否显示原证件号
const getProductCertConfig = (index: number) => {
  const config = [...certConfig];
  if (index === 0) {
    config.splice(3, 0, { name: '原证件号', prop: 'oldCertNo' });
  }
  return config;
};

// 辅助函数：格式化有效期
const formatValidity = (item: any) => {
  const startDate = item.certDate || item.beginDate || '';
  const endDate = item.certValidTo || item.endDate || '';
  if (!startDate && !endDate) {
    return null;
  }
  const value = `${startDate}~${endDate}`;
  if (item.validityType === 'L') {
    return `${value} 长期`;
  }
  if (item.validityType === 'R') {
    return value;
  }
  return null;
};

// watch(() => imageList.value, (newImgList) => {
//   if (newImgList && newImgList.length > 0) {
//     // 初始化当前预览图片为列表的第一个图片
//     currentImage.value = newImgList[0].path;
//   }
// })

const changeImage = (image: { fileId: string; path: string }) => {
  console.warn('切换图片', image);
  currentImage.value = image.path;
  currentType.value = isPdf(image.path) ? 'pdf' : 'image';
};
</script>

<template>
  <ModalFirst title="证照图片查看" class="h-[650px] w-[1300px]">
    <div class="flex h-full gap-3">
      <div class="fieldset-box w-8/12" title="证照图片">
        <div class="flex h-full flex-col gap-2 px-2.5 py-3">
          <div class="flex h-20 w-full border border-[#b1b1b1] py-2">
            <div
              v-if="!imageList || imageList.length === 0"
              class="flex h-full w-full items-center justify-center text-gray-400"
            >
              没有证照图片！
            </div>
            <div
              v-for="(image, index) in imageList"
              :key="image.fileId"
              class="file-list-item mx-2 h-16 w-16"
              @click="changeImage(image)"
              :data-testid="`button_licensePreview_${index}_licenseViewPictureModal`"
            >
              <div
                v-if="isPdf(image.path)"
                class="flex h-full w-full cursor-pointer items-center justify-center bg-red-50 text-xs text-red-500"
              >
                PDF
              </div>
              <img
                v-else
                :src="image.path"
                alt="证照缩略图"
                class="h-full w-full cursor-pointer object-contain"
                :class="{
                  'border-2 border-[#007bff]': currentImage === image.path,
                }"
              />
            </div>
          </div>
          <div class="flex min-h-0 flex-1 items-center justify-center">
            <div v-if="!currentImage" class="text-gray-500">暂无图片可预览</div>
            <PreviewImage :url="currentImage" :type="currentType" />
          </div>
        </div>
      </div>
      <div class="fieldset-box w-4/12" title="证照信息">
        <div class="flex h-full flex-col gap-2 px-2.5 py-3">
          <div
            v-for="(item, index) in displayInfo"
            :key="`${index}a`"
            class="flex w-full px-2.5 py-2.5"
          >
            <div class="proLabel flex-shrink-0">{{ item.name }}</div>
            <div class="text">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #prepend-footer>
      <Button
        @click="modalApi.close()"
        data-testid="button_cancel_licenseViewPictureModal"
      >
        取消
        <template #icon>
          <SvgCloseIcon class="mb-1" />
        </template>
      </Button>
    </template>
  </ModalFirst>
</template>

<style scoped lang="scss">
.fieldset-box {
  position: relative;
  border: 1px solid #b1b1b1;
}

.fieldset-box::before {
  position: absolute;
  top: -10px;
  left: 75px;
  padding: 0 10px;
  color: #9a9a9a;
  content: attr(title);
  background-color: #fff;
  transform: translate(-50%, -50%);
  transform: translateX(-50%);
}

.proLabel {
  width: 80px;
  color: #606266;
}

.text {
  width: calc(100% - 80px);
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  color: #303033;
  white-space: nowrap;
}

.file-list-item {
  padding: 5px;
  box-shadow: 1px 2px 5px 1px#5b7bbb;
}
</style>
