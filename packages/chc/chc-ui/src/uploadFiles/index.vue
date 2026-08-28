<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { createIconifyIcon } from '@vben-core/icons';

import { message, Modal, Tooltip, Upload } from 'ant-design-vue';

import pdfSrc from '../assets/imgs/pdf.jpg';
import zipSrc from '../assets/imgs/zip.png';
import { useAsyncModal } from '../asyncModal/index';
import {
  downloadFileByBlob,
  fileToUrl,
  getPreviewList,
  getRomoteZipFile,
  loadZipFile,
} from '../utils/uploadFile';
import ChooseUploadType from './chooseUploadType.vue';
import PreviewImage from './previewImage.vue';
import PreviewPdf from './previewPdf.vue';
import TakePhoto from './takePhoto.vue';

type Zip = {
  files: {
    [key: string]: {
      [key: string]: any;
    };
  };
};
type backEndFile = {
  [key: string]: any;
  fileId: string;
  httpFilePaths: string;
};
type showFile = {
  file?: File;
  fileId?: string;
  httpFilePaths?: string;
  isActive?: boolean;
  isDel?: boolean;
  isImg?: boolean;
  isPdf?: boolean;
  isZip?: boolean;
  name?: string;
  path?: string;
};
type Props = {
  /**
   * 文件类型数组,只需要传小写文件后缀
   * @default ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'zip']
   */
  accept?: string[];
  /**
   * 最大上传文件数量
   * @default 20
   */
  limitFileCount?: number;
  /**
   * 最大上传文件大小，单位M
   * @default 20
   */
  limitFileSize?: number;
  /**
   * edit:编辑模式，view:查看模式
   * @default edit
   */
  mode?: 'edit' | 'view';
  /**
   * 双向绑定的文件列表
   */
  modelValue?: Array<backEndFile | File>;
  /**
   * 是否展示预览区
   * @default true
   */
  showPreview?: boolean;
  /**
   * 是否可以拍照上传
   * @default false
   */
  whetherCanTakePhoto?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  showPreview: true,
  mode: 'edit',
  accept: () => ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'zip'],
  limitFileSize: 20,
  limitFileCount: 20,
  whetherCanTakePhoto: false,
});
const emit = defineEmits(['update:modelValue', 'changeFiles']);
const wholeAcceptsWithoutDot = computed(() => {
  const midArr = [];
  props.accept.forEach((item) => {
    midArr.push(`${item}`);
    const upper = item.toUpperCase();
    !midArr.includes(`${upper}`) && midArr.push(`${upper}`);
  });
  return midArr;
});
const wholeAccepts = computed(() => {
  const midArr = [];
  props.accept.forEach((item) => {
    midArr.push(`.${item}`);
    const upper = item.toUpperCase();
    !midArr.includes(`.${upper}`) && midArr.push(`.${upper}`);
  });
  return midArr;
});
const previewLoading = ref(true);
const originFileList = ref<Array<backEndFile | File>>([...props.modelValue]); // 全量的文件列表，不包含彻底删除的文件
const LeftOutlined = createIconifyIcon('ant-design:left-outlined');
const RightOutlined = createIconifyIcon('ant-design:right-outlined');
const LoadingOutlined = createIconifyIcon('ant-design:loading-outlined');
const PlusOutlined = createIconifyIcon('ant-design:plus-outlined');
const DeleteOutlined = createIconifyIcon('ant-design:delete-outlined');
const DownloadOutlined = createIconifyIcon('ant-design:download-outlined');
const RollbackOutlined = createIconifyIcon('ant-design:rollback-outlined');
const nowScrollDistance = ref(0);
const itemsWidth = ref(0);
const showFilesList = ref<showFile[]>([]);
const nowChoosedItem = ref();
showFilesList.value = props.modelValue
  ? props.modelValue
      .filter((item: backEndFile) => !!item.fileId)
      .map((item: backEndFile, index) => {
        const newObj = {
          ...item,
          isActive: index === 0,
          isDel: false,
          isImg:
            item.httpFilePaths.endsWith('.jpg') ||
            item.httpFilePaths.endsWith('.jpeg') ||
            item.httpFilePaths.endsWith('.gif') ||
            item.httpFilePaths.endsWith('.png') ||
            item.httpFilePaths.endsWith('.bmp'),
          isPdf: item.httpFilePaths.split('?')[0].endsWith('.pdf'),
          isZip: item.httpFilePaths.split('?')[0].endsWith('.zip'),
          name: item.name || item.httpFilePaths.split('?')[0].split('/').pop(),
          path: item.httpFilePaths,
        };
        return newObj;
      })
  : [];

const uploadFileList = ref([]);
const uploadLoading = ref(false);
const previewCache = ref<{ [key: string]: any[] }>({}); // 所有zip文件预览时判断缓存内是否有该文件，有则不进行解压
/**
 * 预览区列表
 */
const nowPreviewFiles = ref<any>();
const beforeUpload = async (file: File) => {
  // console.log('beforeUpload--file', file);
  const testmsg = file.name.slice(Math.max(0, file.name.lastIndexOf('.') + 1));
  const extension = wholeAcceptsWithoutDot.value.includes(testmsg);
  if (!extension) {
    message.error(`文件格式只支持(${props.accept.join(',')})`);
    return false;
  }
  // 判断文件大小
  const sizeLimit = props.limitFileSize * 1024 * 1024;
  const isSuitable = file.size <= sizeLimit;
  if (!isSuitable) {
    message.error(`文件大小不能超过${props.limitFileSize}M`);
    return false;
  }
  // 文件名校验 nameFormat name
  const isNameOk = !file.name.includes(' ');
  if (!isNameOk) {
    message.error('文件名不能有空格');
    return false;
  }
  // 重复文件校验
  let same = false;
  showFilesList.value.forEach((item) => {
    if (item.name === file.name) {
      same = true;
      return false;
    }
  });
  if (same) {
    message.error('不能上传重复文件！');
    return false;
  }

  if (testmsg === 'zip' || testmsg === 'ZIP') {
    // 如果上传的是zip 需要解压查看其内部是否有图片或pdf文件，如果没有，需要取消掉该文件上传
    const zip: Zip = await loadZipFile(file);
    let hasImgOrPdf = false;
    for (const key in zip.files) {
      const fileEntry = zip.files[key];
      if (!fileEntry.dir) {
        const innerTestmsg = fileEntry.name
          .slice(Math.max(0, fileEntry.name.lastIndexOf('.') + 1))
          .toLowerCase();
        if (
          innerTestmsg === 'jpg' ||
          innerTestmsg === 'png' ||
          innerTestmsg === 'jpeg' ||
          innerTestmsg === 'gif' ||
          innerTestmsg === 'pdf'
        ) {
          hasImgOrPdf = true;
        }
      }
    }
    if (hasImgOrPdf) {
      return true;
    } else {
      message.error('zip文件内没有图片或pdf文件，请重新选择');
      return false;
    }
  } else {
    return true;
  }
};

const customRequest = async (param: any) => {
  const url = fileToUrl(param.file);
  // console.log('customRequest--param', param, url);
  previewLoading.value = true;
  showFilesList.value = [
    ...showFilesList.value,
    {
      file: param.file,
      fileId: param.file.uid,
      isPdf: param.file.type.includes('pdf') || param.file.type.includes('PDF'),
      isZip: param.file.type.includes('zip'),
      name: param.file.name,
      path: url,
    },
  ];
  // 更新originFileList 和 父组件的fileList
  originFileList.value = [...originFileList.value, param.file];
  // 此处加上setTimeout是为了在父组件的fileList更新完成之后再更新父组件的fileList
  setTimeout(() => {
    updateFinalUploadFiles([...props.modelValue, param.file]);
  }, 0);

  // 如果上传的是zip文件，直接使用zip的文件流解析内容即可，不需要再调用 JSZipUtils.getBinaryContent 方法了，减少接口调用次数
  if (param.file.type.includes('zip')) {
    const zip = await loadZipFile(param.file);
    const prevList = await getPreviewList(zip);
    previewCache.value[url] = prevList;
    handleChoose(
      showFilesList.value[showFilesList.value.length - 1] as showFile,
      showFilesList.value.length - 1,
    );
    // 将该zip文件内部的图片和pdf解析出来，添加到预览缓存内。这样就无需在选择时解析该zip文件了 键为url，值为preview内容数组
  } else {
    setTimeout(() => {
      handleChoose(
        showFilesList.value[showFilesList.value.length - 1] as showFile,
        showFilesList.value.length - 1,
      );
    }, 32);
  }
};

/**
 * 获取最终需要上传的文件,根据 isDel 和 是否在showFilesList数组中有 判断是否需要上传
 * @param arr Array<backEndFile | File>
 * @returns Array<backEndFile | File>
 * @author wuenmin
 */
const getFinalUploadFiles = (arr: Array<backEndFile | File>) => {
  return arr.filter((item: backEndFile | File) => {
    // 此处根据isDel字段判断，和是否在showFilesList数组中有该项来判断哪些文件是需要上传的
    // 这个数组内的元素分成两组，一组是有 fileId 和 httpFilePaths ，另一组是直接是一个File文件的
    if ('httpFilePaths' in item) {
      // 这些是初始就有的文件
      const index = showFilesList.value.findIndex((itemIn) => {
        return itemIn.fileId === item.fileId;
      });
      return index === -1 ? false : !showFilesList.value[index]?.isDel;
    } else {
      // 这些是后上传的文件
      const index = showFilesList.value.findIndex(
        (itemIn) => itemIn.name === item.name,
      );
      return index === -1 ? false : !showFilesList.value[index]?.isDel;
    }
  });
};
/**
 * 更新props.modelValue
 * @param arr Array<backEndFile | File>
 * @author wuenmin
 */
const updateFinalUploadFiles = (arr: Array<backEndFile | File>) => {
  const midFileArr: Array<backEndFile | File> = getFinalUploadFiles(arr);
  // console.log('midFileArr', midFileArr);
  // debugger;
  emit('update:modelValue', midFileArr);
  emit('changeFiles', midFileArr);
};

const imageContainer = ref();
const handleDel = (item: showFile) => {
  item.isDel = true;
  updateFinalUploadFiles([...originFileList.value]);
  // console.log('handleDel', item);
};
const cancelDel = (item: showFile) => {
  item.isDel = false;
  updateFinalUploadFiles([...originFileList.value]);
};
const realDel = (item: showFile, index: number) => {
  // 删除预览缓存
  if (item.isZip) {
    const midObj = { ...previewCache.value };
    delete midObj[item.path];
    previewCache.value = midObj;
  }
  // 显示的文件列表更新
  showFilesList.value.splice(index, 1);
  // 将originFileList更新
  originFileList.value = originFileList.value.filter((itemIn) => {
    return 'httpFilePaths' in itemIn
      ? itemIn.fileId !== item.fileId
      : itemIn.name !== item.name;
  });
  updateFinalUploadFiles([...originFileList.value]);
  // 根据当前选中项是否在显示列表中，如果存在就不变，不存在就重新选中别的项
  const currentIndex = showFilesList.value.findIndex((item) => {
    return nowChoosedItem.value.fileId
      ? nowChoosedItem.value.fileId === item.fileId
      : nowChoosedItem.value.name === item.name;
  });
  if (currentIndex === -1) {
    if (showFilesList.value.length > 0) {
      if (showFilesList.value.length > index) {
        handleChoose(showFilesList.value[index], index);
      } else {
        handleChoose(showFilesList.value[index - 1], index - 1);
      }
    } else {
      nowChoosedItem.value = {};
      nowPreviewFiles.value = [];
    }
  }
};
const handleDownload = (item: showFile) => {
  Modal.confirm({
    content: '确定要下载该zip文件吗?',
    onOk() {
      downloadFileByBlob(item.name, item.path);
    },
    title: '提示',
  });
};
/**
 * 处理选中某项的逻辑
 */
const handleChoose = async (item: showFile, index: number) => {
  nowChoosedItem.value = item;
  previewLoading.value = true;
  showFilesList.value.forEach((item) => {
    item.isActive = false;
  });
  item.isActive = true;
  scrollTo(index * 106);
  // imageContainer.value.scrollTo({
  //   behavior: 'smooth',
  //   left: index * 106,
  // });
  // await waitForAMoment(300);
  // 接下来要在下面的盒子里预览选中项
  // 根据不同的选中项文件格式，执行不同的渲染逻辑
  if (!props.showPreview) {
    return null;
  }
  if (item.isZip) {
    // 判断是否有zip缓存，如果有就直接使用缓存，如果没有就重新请求zip文件
    if (previewCache.value[item.path]) {
      nowPreviewFiles.value = previewCache.value[item.path];
      previewLoading.value = false;
    } else {
      const zip = await getRomoteZipFile(item.path);
      const prevList = await getPreviewList(zip);
      previewCache.value[item.path] = prevList;
      nowPreviewFiles.value = prevList;
      previewLoading.value = false;
    }
  } else if (item.isPdf) {
    // 打开pdf预览
    nowPreviewFiles.value = [{ type: 'pdf', url: item.path }];
    previewLoading.value = false;
  } else {
    // 打开图片预览
    // console.log('handleChoose', item);
    nowPreviewFiles.value = [{ type: 'img', url: item.path }];
    previewLoading.value = false;
  }
};

const mouseenterCallback = (e) => {
  e.stopPropagation();
  imageContainer.value.addEventListener('wheel', wheelCallBack);
};
const mouseleaveCallback = (e) => {
  e.stopPropagation();
  imageContainer.value.removeEventListener('wheel', wheelCallBack);
};
const wheelCallBack = (e) => {
  e.stopPropagation();
  if (e.deltaY > 0) {
    scrollTo(nowScrollDistance.value + 80);
  } else {
    scrollTo(nowScrollDistance.value - 80);
  }
};

const scrollTo = (p) => {
  const containerWidth = imageContainer.value.getBoundingClientRect().width;
  if (p < 0) p = 0;
  if (p > itemsWidth.value - containerWidth) {
    p = itemsWidth.value - containerWidth;
  }
  nowScrollDistance.value = p;
  imageContainer.value.scrollTo({
    behavior: 'smooth',
    left: p,
  });
};
watch(
  () => showFilesList.value,
  (val) => {
    itemsWidth.value = val.length * 106 - 6;
  },
  {
    immediate: true,
  },
);
const handleListener = () => {
  imageContainer.value.removeEventListener('mouseenter', mouseenterCallback);
  imageContainer.value.removeEventListener('mouseleave', mouseleaveCallback);
  imageContainer.value.addEventListener('mouseenter', mouseenterCallback);
  imageContainer.value.addEventListener('mouseleave', mouseleaveCallback);
};
onMounted(() => {
  // 初始化时，默认选中第一个文件
  if (showFilesList.value && showFilesList.value.length > 0) {
    handleChoose(showFilesList.value[0]!, 0);
  } else {
    previewLoading.value = false;
  }
  handleListener();
});

/**
 * 初始化显示的文件列表 showFilesList ，已解决在vbenform中，通过setValue设置值，showFilesList没有更新，无法显示图片
 * @param list Array<backEndFile | File>
 */
function initShowFilesList(list: Array<backEndFile | File>) {
  originFileList.value = [...list];
  previewLoading.value = true;
  showFilesList.value = list
    ? list
        .filter((item: backEndFile) => !!item.fileId)
        .map((item: backEndFile, index) => {
          const newObj = {
            ...item,
            isActive: index === 0,
            isDel: false,
            isImg:
              item.httpFilePaths.endsWith('.jpg') ||
              item.httpFilePaths.endsWith('.jpeg') ||
              item.httpFilePaths.endsWith('.gif') ||
              item.httpFilePaths.endsWith('.png') ||
              item.httpFilePaths.endsWith('.bmp'),
            isPdf: item.httpFilePaths.split('?')[0].endsWith('.pdf'),
            isZip: item.httpFilePaths.split('?')[0].endsWith('.zip'),
            name:
              item.name || item.httpFilePaths.split('?')[0].split('/').pop(),
            path: item.httpFilePaths,
          };
          return newObj;
        })
    : [];
  // 初始化时，默认选中第一个文件
  if (showFilesList.value && showFilesList.value.length > 0) {
    handleChoose(showFilesList.value[0]!, 0);
  } else {
    previewLoading.value = false;
  }
  handleListener();
}
defineExpose({
  initShowFilesList,
});

const asyncModal = useAsyncModal();
const asyncModal1 = useAsyncModal();
const upload = ref();
const hasOpenTakePhotoModal = ref(false);
//
function handleUploadFile() {
  if (props.whetherCanTakePhoto) {
    asyncModal.openModal(ChooseUploadType, {}, {}).then((res) => {
      if (res === 'takePhoto') {
        hasOpenTakePhotoModal.value = true;
        asyncModal1
          .openModal(
            TakePhoto,
            {},
            {
              width: '800px',
              onCancel: () => {
                hasOpenTakePhotoModal.value = false;
              },
            },
          )
          .then((res) => {
            res.forEach((item) => {
              customRequest(item);
            });
            hasOpenTakePhotoModal.value = false;
          })
          .catch(() => {
            hasOpenTakePhotoModal.value = false;
          });
      } else if (res === 'chooseFile') {
        upload.value.$el.querySelector('input[type=file]').click();
      }
    });
  } else {
    upload.value.$el.querySelector('input[type=file]').click();
  }
}
</script>
<template>
  <div class="upload-container">
    <div class="upload-header">
      <div class="absolute left-0 top-0 text-xs text-red-500">
        文件格式只支持({{ accept.join(',') }})，且文件大小不能超过{{
          limitFileSize
        }}M,文件名不能有空格。最多支持上传{{ limitFileCount }}个文件
      </div>
      <div
        class="upload-form"
        v-if="mode === 'edit' && showFilesList.length < limitFileCount"
      >
        <Upload
          v-model:file-list="uploadFileList"
          list-type="picture-card"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          :custom-request="customRequest"
          multiple
          ref="upload"
          :accept="wholeAccepts.join(',')"
        >
          <template #trigger>
            <span style="display: none">1</span>
          </template>
          <!-- <img v-if="imageUrl" :src="imageUrl" alt="avatar" /> -->
          <div
            @click.prevent.stop="handleUploadFile"
            class="flex h-full w-full items-center justify-center"
          >
            <LoadingOutlined v-if="uploadLoading" class="text-lg" />
            <PlusOutlined v-else class="text-lg" />
            <!-- <div class="ant-upload-text">Upload</div> -->
          </div>
        </Upload>
      </div>
      <div
        class="upload-images"
        :style="{
          width:
            mode === 'edit' && showFilesList.length < limitFileCount
              ? 'calc(100% - 106px)'
              : '100%',
        }"
      >
        <div class="images-btn" @click.stop="scrollTo(nowScrollDistance - 100)">
          <LeftOutlined style="color: #fff" />
        </div>
        <div class="main-container" ref="imageContainer">
          <div
            class="images-item"
            :class="{
              isZip: item.isZip,
              isActive: item.isActive,
              isDel: item.isDel,
            }"
            v-for="(item, index) in showFilesList"
            :key="index"
            @click="handleChoose(item, index)"
          >
            <div class="image-item__imgArea">
              <img
                :title="item.name"
                :src="item.isZip ? zipSrc : item.isPdf ? pdfSrc : item.path"
                alt=""
              />
            </div>
            <div class="image-item__nameArea" :title="item.name">
              {{ item.name }}
            </div>
            <!--  @click.stop="handleDel(item)" -->
            <div
              class="item-delete-icon"
              @click.stop="handleDel(item)"
              v-if="mode === 'edit'"
            >
              <DeleteOutlined />
            </div>
            <!--  @click.stop="handleDownload(item)" -->
            <div
              class="item-download-icon"
              @click.stop="handleDownload(item)"
              v-if="item.isZip"
            >
              <DownloadOutlined />
            </div>
            <div class="item-mask__del">
              <Tooltip>
                <template #title>取消删除</template>
                <div class="cancel" @click.stop="cancelDel(item)">
                  <RollbackOutlined style="font-size: 12px" />
                </div>
              </Tooltip>
              <Tooltip>
                <template #title>彻底删除</template>
                <div class="realDel" @click.stop="realDel(item, index)">
                  <DeleteOutlined style="font-size: 12px" />
                </div>
              </Tooltip>

              <div class="del">已删除</div>
            </div>
          </div>
          <div
            v-if="!showFilesList || showFilesList.length === 0"
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              font-size: 14px;
              transform: translate(-50%, -50%);
            "
          >
            暂无数据
          </div>
        </div>
        <div class="images-btn" @click.stop="scrollTo(nowScrollDistance + 100)">
          <RightOutlined style="color: #fff" />
        </div>
      </div>
    </div>
    <div class="upload-body" v-if="showPreview" v-loading="previewLoading">
      <div
        class="preview-container"
        :style="{
          backgroundColor:
            !nowPreviewFiles || nowPreviewFiles.length === 0
              ? '#ebebeb'
              : 'transparent',
        }"
      >
        <div
          v-if="
            !previewLoading &&
            (!nowPreviewFiles || nowPreviewFiles.length === 0)
          "
          style="
            position: absolute;
            top: 50%;
            left: 50%;
            font-size: 14px;
            transform: translate(-50%, -50%);
          "
        >
          暂无可预览内容
        </div>
        <div
          class="preview-item"
          v-for="item in nowPreviewFiles"
          :key="item.url"
        >
          <div v-if="hasOpenTakePhotoModal" class="h-full w-full"></div>
          <PreviewImage
            v-if="item.type === 'img' && !hasOpenTakePhotoModal"
            :url="item.url"
          />
          <PreviewPdf
            v-if="item.type === 'pdf' && !hasOpenTakePhotoModal"
            :url="item.url"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.upload-container {
  width: 100%;
  height: 100%;
}

.upload-header {
  position: relative;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  user-select: none;
}

.upload-header .upload-form {
  width: 100px;
  height: 100px;
}

.upload-header .upload-images {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100px;
}

.upload-header .upload-images .images-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 40px;
  cursor: pointer;
  background: #aaa;
  border-radius: 13px;
}

.upload-header .upload-images .images-btn:hover {
  background-color: #979797;
}

.upload-header .upload-images .main-container {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
  width: calc(100% - 60px);
  height: auto;
  height: 100%;
  overflow: auto hidden;
}

.upload-header .upload-images .main-container::-webkit-scrollbar {
  display: none;
}

.upload-header .upload-images .main-container .images-item {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;

  /* background-color: pink; */
  border: 1px dashed #ccc;
}

.upload-header .upload-images .main-container .images-item .item-mask__del {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  display: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgb(255 255 255 / 90%);
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .item-mask__del
  .cancel {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  cursor: pointer;

  /* background-color: rgb(243 229 231); */
  border-radius: 0;
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .item-mask__del
  .realDel {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  cursor: pointer;

  /* background-color: rgb(243 229 231); */
  border-radius: 0;
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .item-mask__del
  .del {
  font-size: 14px;
}

.upload-header
  .upload-images
  .main-container
  .images-item.isDel
  .item-mask__del {
  display: block;
}

.upload-header .upload-images .main-container .images-item.isActive {
  border: 2px solid #0f74ff;
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .image-item__imgArea {
  width: 100%;
  height: 80%;
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .image-item__imgArea
  img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .image-item__nameArea {
  width: 100%;
  height: 20%;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 19px;
  white-space: nowrap;
  background-color: #fff;
}

.upload-header .upload-images .main-container .images-item .item-delete-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: #fff;
  cursor: pointer;
  background-color: #f56c6c;
  border-color: #f56c6c;
  border-radius: 13px;
  transform: translate(-50%, -50%);
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .item-delete-icon:hover {
  color: #fff;
  background: #f78989;
  border-color: #f78989;
}

.upload-header
  .upload-images
  .main-container
  .images-item:hover
  .item-delete-icon {
  display: flex;
}

.upload-header .upload-images .main-container .images-item .item-download-icon {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #3e96fa;
  cursor: pointer;
}

.upload-header
  .upload-images
  .main-container
  .images-item
  .item-download-icon:hover {
  background-color: rgb(189 189 189 / 80%);
}

.upload-body {
  width: 100%;
  height: calc(100% - 140px);
  margin-top: 20px;
}

.upload-body .preview-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
}

.upload-body .preview-item {
  flex-shrink: 0;
  width: 100%;
  height: 650px;
  overflow: hidden;
}
</style>
