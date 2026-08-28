<script setup lang="ts">
import { computed, h, ref } from 'vue';

import { SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import PreviewImage from '#/views/modules/spd/views/operation/qualificationCertificates/reviewRecord/previewImage.vue';

import { passLicenseViewPicture } from '../api';

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

// 为不同类型的证照定义配置
const certConfig = [
  { name: '证照类型', prop: 'certTypeName' },
  { name: '证照号码', prop: 'certNo' },
  { name: '有效期', prop: 'validityPeriod' }, // 使用特殊 prop 标识
  { name: '备注', prop: 'description' },
];

const authorizeConfig = [
  { name: '授权企业', prop: 'authorizeCompanyName' },
  { name: '被授权企业', prop: 'toAuthorizeCompanyName' },
  { name: '有效期', prop: 'validityPeriod' },
  { name: '备注', prop: 'description' },
];

// 动态生成证照信息显示
const displayInfo = computed(() => {
  if (!state.value?.data) {
    return [];
  }

  const data = state.value.data;
  const apiType = state.value.apiType; // 获取父组件传来的apiType
  let activeConfig: any[] = [];
  // 根据 apiType 选择合适的配置
  switch (apiType) {
    case 'Authorize': {
      activeConfig = authorizeConfig;
      break;
    }
    case 'ProductM': {
      // 产品主数据
      // 只为 ProductM（索引为0的那个）显示“原证件号”
      activeConfig = [...certConfig];
      activeConfig.push({ name: '原证件号', prop: 'oldCertNo' });
      break;
    }
    default: {
      // 所有其他情况 (包括 'Company', 'ProductO' 等)
      // 都使用基础配置
      activeConfig = certConfig;
      break;
    }
  }
  const result: any = [];
  activeConfig.forEach((item) => {
    // 特殊处理有效期
    const value =
      item.prop === 'validityPeriod' ? formatValidity(data) : data[item.prop];

    // 只有当值存在时才添加到结果中
    if (value !== null && value !== undefined && value !== '') {
      result.push({
        name: item.name,
        value,
      });
    }
  });

  return result;
});

// 获取证照ID的辅助函数
const getApplyCertId = () => {
  const data = state.value?.data;
  const type = state.value?.apiType;
  if (!data || !type) return null;

  switch (type) {
    case 'Authorize': {
      return data.authorizeApplyId;
    }
    case 'Company': {
      return data.companyApplyCertId;
    }
    case 'ProductM': {
      return data.productApplyId;
    }
    case 'ProductO': {
      return data.productApplyCertId;
    }
    default: {
      return null;
    }
  }
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

const changeImage = (image: { fileId: string; path: string }) => {
  console.warn('切换图片', image);
  currentImage.value = image.path;
  currentType.value = isPdf(image.path) ? 'pdf' : 'image';
};

// 通过
const handlePass = () => {
  Modal.confirm({
    title: '提示',
    content: '确认通过？',
    onOk: async () => {
      try {
        const data = state.value?.data;
        const apiType = state.value?.apiType; // 从 state 获取类型
        const applyCertId = getApplyCertId();
        // 获取当前申请的状态，判断是否为预审状态
        const isWA = state.value.row?.checkStatus === 'WA';

        const params = {
          checkRemark: '',
          type: apiType, //  使用从 state 获取的类型
          status: isWA ? 'WC' : 'PS', // 根据预审状态决定目标状态
          ids: JSON.stringify([
            {
              applySyncId: state.value.applyId, // 外层申请ID
              applyCertId, // 使用辅助函数获取证照ID
            },
          ]),
        };

        console.warn('企业证照通过操作参数:', params);
        const result = await passLicenseViewPicture(params);

        if (result && result.success) {
          message.success('操作成功！');

          // 更新状态回调
          if (data.updateStatusCallback) {
            data.updateStatusCallback({
              status: isWA ? 'WC' : 'PS',
              statusText: isWA ? '未核对' : '已核对',
              statusColor: '#009688',
            });
          }

          modalApi.close();
        } else {
          message.error(result?.msg || '操作失败！');
        }
      } catch (error) {
        console.error('确认失败:', error);
        message.error('确认失败');
      }
    },
  });
};

// 拒绝
const handleReject = () => {
  let rejectReason = '';

  Modal.confirm({
    title: '请输入驳回原因',
    content: h('textarea', {
      placeholder: '',
      rows: 4,
      style: {
        width: '100%',
        marginTop: '10px',
        padding: '6px 10px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        outline: 'none',
        resize: 'vertical',
      },
      onInput: (e: Event) => {
        rejectReason = (e.target as HTMLTextAreaElement).value;
      },
    }),
    width: '400px',
    centered: true,
    async onOk() {
      if (!rejectReason || rejectReason.trim() === '') {
        message.warning('驳回原因不能为空！');
        throw new Error('驳回原因不能为空');
      }

      try {
        const data = state.value?.data;
        const apiType = state.value?.apiType; // 从 state 获取类型
        const applyCertId = getApplyCertId();

        const params = {
          checkRemark: rejectReason.trim(),
          type: apiType, //  使用从 state 获取的类型
          status: 'NO', // 拒绝状态固定为NO
          ids: JSON.stringify([
            {
              applySyncId: state.value.applyId,
              applyCertId, // 使用辅助函数获取证照ID
            },
          ]),
        };

        console.warn('企业证照拒绝操作参数:', params);
        const result = await passLicenseViewPicture(params);

        if (result && result.success) {
          message.success('操作成功！');

          // 更新状态回调
          if (data.updateStatusCallback) {
            data.updateStatusCallback({
              status: 'NO',
              statusText: '未通过',
              statusColor: '#fc0925',
              checkRemark: rejectReason.trim(),
            });
          }

          modalApi.close();
        } else {
          message.error(result?.msg || '操作失败！');
        }
      } catch (error) {
        console.error('驳回操作失败:', error);
        message.error('操作失败');
      }
    },
    onCancel() {},
  });
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
              没有授权书图片！
            </div>
            <div
              v-for="image in imageList"
              :key="image.fileId"
              class="file-list-item mx-2 h-16 w-16"
              @click="changeImage(image)"
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
      <Button type="primary" @click="handlePass">
        通过
        <template #icon>
          <SvgSaveIcon class="mb-1" />
        </template>
      </Button>
      <Button type="primary" danger @click="handleReject">
        拒绝
        <template #icon>
          <SvgCloseIcon class="mb-1" />
        </template>
      </Button>
      <Button @click="modalApi.close()">
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
