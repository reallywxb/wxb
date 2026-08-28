<script setup lang="ts">
import type { BatchItem, StoragePath } from '../api';

import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

import {
  createIconifyIcon,
  MdiLightDelete,
  SvgCloseIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Modal as AntModal, Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import {
  deleteBatchAttachment,
  getBatchVBPActionList,
  saveBatchVBPAction,
} from '../api';
import pdfPlaceholder from '../image/pdf.jpg';
import PreviewImage from './previewImage.vue';
import PreviewPdf from './previewPdf.vue';
import { useUserStore } from '@vben/stores';

interface DialogState {
  title: string;
  type: 'add' | 'edit' | 'view';
  vbpBatchId?: string;
  callback?: (data: any) => void;
  [key: string]: any;
}

interface FileItem {
  id: string;
  file?: File;
  url: string;
  type: 'image' | 'pdf';
  name: string;
  isActive?: boolean;
  isDel?: boolean;
  isFromServer: boolean;
  serverId?: number;
  serverPath?: string;
  format?: string;
}

interface PreviewItem {
  type: 'img' | 'pdf';
  url: string;
}

const PlusOutlined = createIconifyIcon('ant-design:plus-outlined');
const LeftOutlined = createIconifyIcon('ant-design:left-outlined');
const RightOutlined = createIconifyIcon('ant-design:right-outlined');
const userStore = useUserStore();
const title = ref<string>('');
const state = ref<DialogState | Record<string, any>>({});
const formType = ref<'add' | 'edit' | 'view'>('add');
const isViewMode = computed(() => formType.value === 'view');
const currentBatchId = ref<string>('');
const fileInputRef = ref<HTMLInputElement>();
const fileList = ref<FileItem[]>([]);
const nowChoosedItem = ref<FileItem | null>(null);
const deletedServerFileIds = ref<number[]>([]);
const nowPreviewFiles = ref<PreviewItem[]>([]);
const previewLoading = ref(false);
const mainContainer = ref<HTMLElement>();
const imageContainer = ref<HTMLElement>();
const showArrows = ref(false);
const containerPadding = ref('0 10px');

const ALLOWED_CONFIG = {
  extensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  mimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
  displayText: 'jpg, png, jpeg, gif, pdf',
};

// 日期选择器禁用今天及之前的日期
const disabledDate = (current: any) => {
  if (userStore?.userInfo?.isProcurementRepair === true) {
    return false;
  }
  if (!current) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return current.toDate() <= today;
};

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    fileList.value.forEach((item) => {
      if (!item.isFromServer && item.url) {
        URL.revokeObjectURL(item.url);
      }
    });
    fileList.value = [];
    nowPreviewFiles.value = [];
    nowChoosedItem.value = null;
    deletedServerFileIds.value = [];
    showArrows.value = false;
  },
  onConfirm() {},
  showConfirmButton: false,
  showCancelButton: false,
  closeOnClickModal: false,
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      state.value = modalApi.getData<Record<string, any>>();
      title.value = state.value?.title || '';
      formType.value = state.value?.type || 'add';
      currentBatchId.value = state.value?.vbpBatchId || '';
      if (formType.value === 'view') {
        baseFormApi?.setState({ commonConfig: { disabled: true } });
      } else {
        baseFormApi?.setState({ commonConfig: { disabled: false } });
      }
      if (
        (formType.value === 'edit' || formType.value === 'view') &&
        currentBatchId.value
      ) {
        await loadBatchDetail(currentBatchId.value);
      }
    }
  },
});

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'vbpBatchId',
      formItemClass: 'col-span-1 pb-2 hidden',
      hideLabel: true,
      componentProps: () => ({ placeholder: '' }),
    },
    {
      component: 'Input',
      fieldName: 'productType',
      formItemClass: 'col-span-1 pb-2 hidden',
      hideLabel: true,
      componentProps: () => ({ placeholder: '' }),
    },
    {
      component: 'Input',
      fieldName: 'batchId',
      formItemClass: 'col-span-1 pb-2 hidden',
      hideLabel: true,
      componentProps: () => ({ placeholder: '' }),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '批次名称',
      rules: 'required',

      componentProps: () => ({
        placeholder: '请输入名称',
      }),
    },
    {
      component: 'ChcSelect',
      fieldName: 'type',
      label: '集采类型',
      rules: 'required',
      componentProps: () => ({
        dictUrl: '/baseHandleAction/refList.do?id=1000563',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择集采类型',
        paginate: false,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return {
            ...res,
            rows: undefined,
            records: (res.rows || []).map((item: any) => ({
              ...item,
              id: item.id,
            })),
          };
        },
      }),
    },
    {
      component: 'DatePicker',
      fieldName: 'beginDate',
      label: '开始日期',
      rules: 'required',
      componentProps: () => ({
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        disabledDate,
      }),
    },
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      label: '结束日期',
      rules: 'required',
      componentProps: () => ({
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        disabledDate,
      }),
    },
    {
      component: 'ChcSelect',
      fieldName: 'departmentId',
      label: '院区',
      rules: 'required',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择院区',
          paginate: false,
          filterByFrontEnd: true,
          allowClear: true,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',

          afterFetch(res: any) {
            const rows = res.rows?.map((item: any) => ({
              ...item,
              id: String(item.id),
            }));
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
    },
    {
      component: 'Textarea',
      componentProps: () => ({
        placeholder: '请输入描述',
        type: 'textarea',
        maxLength: 20,
      }),
      formItemClass: 'col-span-1',
      fieldName: 'remark',
      label: '备注',
    },
  ],
  wrapperClass: 'grid-cols-1',
});

const loadBatchDetail = async (batchId: string) => {
  try {
    const result = await getBatchVBPActionList({ batchId });
    if (result && result.rows && result.rows.length > 0) {
      const record: BatchItem = result.rows[0];
      await nextTick();
      baseFormApi.setValues({
        vbpBatchId: record.vbpBatchId,
        batchId: record.vbpBatchId,
        productType: 'H',
        name: record.name,
        type: record.type,
        beginDate: record.beginDate,
        endDate: record.endDate,
        departmentId: record.departmentId,
        remark: record.remark || '',
      });
      if (record.storagePaths && record.storagePaths.length > 0) {
        fileList.value = record.storagePaths.map((item: StoragePath) =>
          convertServerFileToFileItem(item),
        );
        if (fileList.value.length > 0) {
          await nextTick();
          handleChoose(fileList.value[0], 0);
        }
        computeWidth();
      }
    }
  } catch (error) {
    console.error('加载批次详情失败:', error);
  }
};

const convertServerFileToFileItem = (serverFile: StoragePath): FileItem => {
  const formatLower = serverFile.format?.toLowerCase() || '';
  const isImage = ['gif', 'jpeg', 'jpg', 'png'].includes(formatLower);
  const fileName = serverFile.path.split('/').pop() || `文件${serverFile.id}`;
  return {
    id: `server-${serverFile.id}`,
    isFromServer: true,
    serverId: serverFile.id,
    serverPath: serverFile.path,
    format: serverFile.format,
    url: serverFile.path,
    type: isImage ? 'image' : 'pdf',
    name: fileName,
    isActive: false,
    isDel: false,
  };
};

const validateFileType = (file: File): boolean => {
  if (ALLOWED_CONFIG.mimeTypes.includes(file.type)) return true;
  const fileExtension = file.name
    .slice(Math.max(0, file.name.lastIndexOf('.')))
    .toLowerCase();
  return ALLOWED_CONFIG.extensions.includes(fileExtension);
};

const validateFileName = (fileName: string): boolean => !fileName.includes(' ');

const validateFileSize = (fileSize: number, limitMB: number = 20): boolean => {
  const limitBytes = limitMB * 1024 * 1024;
  return fileSize <= limitBytes;
};

const isDuplicateFile = (fileName: string): boolean =>
  fileList.value.some((item) => item.name === fileName);

const computeWidth = () => {
  nextTick(() => {
    if (!mainContainer.value || !imageContainer.value) return;
    const containerWidth = mainContainer.value.offsetWidth;
    const uploadBtnWidth = 100;
    const availableWidth = containerWidth - uploadBtnWidth;
    const filesWidth = fileList.value.length * 90;
    if (filesWidth > availableWidth) {
      showArrows.value = true;
      containerPadding.value = '0 50px';
    } else {
      showArrows.value = false;
      containerPadding.value = '0 10px';
    }
  });
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;
  const validFiles: File[] = [];
  const errors: string[] = [];
  [...files].forEach((file) => {
    if (!validateFileType(file)) {
      errors.push(`${file.name}: 格式不支持`);
      return;
    }
    if (!validateFileName(file.name)) {
      errors.push(`${file.name}: 文件名不能包含空格`);
      return;
    }
    if (!validateFileSize(file.size)) {
      errors.push(`${file.name}: 文件大小超过20M`);
      return;
    }
    if (isDuplicateFile(file.name)) {
      errors.push(`${file.name}: 文件已存在, 请重新选择`);
      return;
    }
    validFiles.push(file);
  });
  if (errors.length > 0) message.error(errors.join('\n'));
  validFiles.forEach((file) => {
    const fileId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'pdf';
    const newFile: FileItem = {
      id: fileId,
      isFromServer: false,
      file,
      url,
      type,
      name: file.name,
      isActive: false,
      isDel: false,
    };
    fileList.value.push(newFile);
  });
  if (fileList.value.length > 0 && !nowChoosedItem.value) {
    nextTick(() => handleChoose(fileList.value[0], 0));
  }
  computeWidth();
  target.value = '';
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleChoose = async (item: FileItem, index: number) => {
  if (item.isDel) return;
  previewLoading.value = true;
  nowChoosedItem.value = item;
  fileList.value.forEach((f) => (f.isActive = false));
  item.isActive = true;
  scrollTo(index * 106);
  if (item.type === 'pdf') {
    nowPreviewFiles.value = [{ type: 'pdf', url: item.url }];
  } else if (item.type === 'image') {
    nowPreviewFiles.value = [{ type: 'img', url: item.url }];
  }
  await nextTick();
  previewLoading.value = false;
};

const handleDeleteFile = (item: FileItem, index: number) => {
  AntModal.confirm({
    title: '提示',
    content: `确认删除文件 "${item.name}" 吗?`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        if (item.isFromServer && item.serverId) {
          await deleteBatchAttachment(item.serverId);
          deletedServerFileIds.value.push(item.serverId);
        } else {
          URL.revokeObjectURL(item.url);
        }
        fileList.value.splice(index, 1);
        if (nowChoosedItem.value?.id === item.id) {
          if (fileList.value.length > 0) {
            const nextIndex = Math.min(index, fileList.value.length - 1);
            handleChoose(fileList.value[nextIndex], nextIndex);
          } else {
            nowChoosedItem.value = null;
            nowPreviewFiles.value = [];
          }
        }
        computeWidth();
        message.success('删除成功');
      } catch (error) {
        console.error('删除文件失败:', error);
        message.error('删除文件失败');
      }
    },
  });
};

const scrollTo = (index: number) => {
  if (!imageContainer.value) return;
  const scrollPosition = index * 90;
  imageContainer.value.scrollTo({ left: scrollPosition, behavior: 'smooth' });
};

const handleScrollLeft = () => {
  if (!imageContainer.value) return;
  const currentScroll = imageContainer.value.scrollLeft;
  imageContainer.value.scrollTo({
    left: currentScroll - 90,
    behavior: 'smooth',
  });
};

const handleScrollRight = () => {
  if (!imageContainer.value) return;
  const currentScroll = imageContainer.value.scrollLeft;
  imageContainer.value.scrollTo({
    left: currentScroll + 90,
    behavior: 'smooth',
  });
};

const wheelCallback = (e: WheelEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (!imageContainer.value) return;
  const currentScroll = imageContainer.value.scrollLeft;
  const delta = e.deltaY > 0 ? 80 : -80;
  imageContainer.value.scrollTo({
    left: currentScroll + delta,
    behavior: 'smooth',
  });
};

const mouseenterCallback = () => {
  imageContainer.value?.addEventListener('wheel', wheelCallback);
};

const mouseleaveCallback = () => {
  imageContainer.value?.removeEventListener('wheel', wheelCallback);
};

const handleSubmit = async () => {
  try {
    const validateResult = await baseFormApi.validate();
    if (!validateResult.valid) return;
    const formValues = await baseFormApi.getValues();
    const newFormValues = Object.fromEntries(
      Object.entries(formValues).filter(
        ([, v]) => v !== null && v !== undefined,
      ),
    );
    const newFiles = fileList.value
      .filter((item) => !item.isFromServer && item.file)
      .map((item) => item.file);
    const params = {
      ...newFormValues,
      productType: 'H',
      files: newFiles,
    };
    AntModal.confirm({
      title: '提示',
      content: '确认通过？',
      onOk: async () => {
        try {
          const res = await saveBatchVBPAction(params as any);
          message.success(formType.value === 'edit' ? '修改成功' : '新增成功');
          if (state.value.callback) {
            state.value.callback({
              batchId: res.batchId || res.data?.batchId || currentBatchId.value,
              type: formType.value,
            });
          }
          modalApi.close();
        } catch (error) {
          console.error('提交失败:', error);
          message.error('提交失败');
        }
      },
    });
  } catch (error) {
    console.error('提交失败:', error);
  }
};

onMounted(() => {
  if (imageContainer.value) {
    imageContainer.value.addEventListener('mouseenter', mouseenterCallback);
    imageContainer.value.addEventListener('mouseleave', mouseleaveCallback);
  }
});
onUnmounted(() => {
  if (imageContainer.value) {
    imageContainer.value.removeEventListener('mouseenter', mouseenterCallback);
    imageContainer.value.removeEventListener('mouseleave', mouseleaveCallback);
  }
  window.removeEventListener('resize', computeWidth);
});
</script>

<template>
  <Modal :title="title" class="h-[500px] w-[1000px]">
    <div class="mb-1 text-sm text-[red]">
      文件格式只支持({{ ALLOWED_CONFIG.displayText }})
    </div>
    <div class="flex h-[calc(100%-40px)]">
      <div class="w-8/12">
        <div class="upload-header mb-2" ref="mainContainer">
          <div class="flex h-full w-full border border-[#b1b1b1] py-2">
            <div
              v-if="!isViewMode"
              class="upload-btn"
              @click="triggerFileInput"
            >
              <PlusOutlined class="text-xl text-gray-400" />
              <span class="mt-1 text-xs text-gray-500">上传文件</span>
            </div>
            <div
              class="file-list-wrapper"
              :style="{ padding: containerPadding }"
            >
              <div
                class="arrow-btn left-arrow-btn"
                @click="handleScrollLeft"
                v-show="showArrows"
              >
                <LeftOutlined style="color: #fff" />
              </div>
              <div class="scroll-container" ref="imageContainer">
                <div class="file-list">
                  <div
                    v-for="(item, index) in fileList"
                    :key="item.id"
                    class="file-item"
                    :class="{ active: item.isActive, del: item.isDel }"
                    @click="handleChoose(item, index)"
                  >
                    <div class="file-item__preview">
                      <img
                        v-if="item.type === 'image'"
                        :src="item.url"
                        :alt="item.name"
                      />
                      <img v-else :src="pdfPlaceholder" />
                    </div>
                    <div
                      class="flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs text-gray-500"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </div>
                    <div class="file-item-mask">
                      <MdiLightDelete
                        v-if="!isViewMode"
                        class="delete-icon"
                        @click.stop="handleDeleteFile(item, index)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="arrow-btn right-arrow-btn"
                @click="handleScrollRight"
                v-show="showArrows"
              >
                <RightOutlined style="color: #fff" />
              </div>
            </div>
            <input
              v-if="!isViewMode"
              ref="fileInputRef"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf"
              id="secondaryfileinput0"
              class="hidden"
              @change="handleFileChange"
            />
          </div>
        </div>
        <div class="h-[calc(100%-120px)] w-full">
          <div class="gallery">
            <div
              v-if="!previewLoading && nowPreviewFiles.length === 0"
              class="flex h-full items-center justify-center text-gray-500"
            >
              暂无文件可预览
            </div>
            <div
              class="h-full w-full"
              v-for="item in nowPreviewFiles"
              :key="item.url"
            >
              <PreviewImage v-if="item.type === 'img'" :url="item.url" />
              <PreviewPdf v-if="item.type === 'pdf'" :url="item.url" />
            </div>
          </div>
        </div>
      </div>
      <div class="w-4/12">
        <BaseForm />
      </div>
    </div>
    <template #prepend-footer>
      <template v-if="!isViewMode">
        <Button
          type="primary"
          @click="handleSubmit"
          data-testid="button_submit"
        >
          提交
          <template #icon><SvgSaveIcon class="mb-1" /></template>
        </Button>
      </template>
      <Button @click="modalApi.close()" data-testid="button_cancel">
        关闭
        <template #icon><SvgCloseIcon class="mb-1" /></template>
      </Button>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.upload-header {
  position: relative;
  width: 100%;
  user-select: none;
}

.upload-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 90px;
  margin: 0 10px;
  cursor: pointer;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #fff;
    border-color: #40a9ff;

    .text-gray-400 {
      color: #40a9ff;
    }
  }
}

.file-list-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 90px;
  transition: padding 0.3s;
}

.scroll-container {
  width: 100%;
  height: 100%;
  overflow: auto hidden;

  &::-webkit-scrollbar {
    display: none;
  }

  .file-list {
    display: flex;
    gap: 10px;
    width: max-content;
    height: 100%;

    .file-item {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 80px;
      height: 90px;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover .file-item-mask {
        opacity: 1;
      }

      &.active {
        border: 2px solid #1890ff;
        box-shadow: 0 0 0 2px rgb(24 144 255 / 20%);
      }

      &.del {
        pointer-events: none;
        opacity: 0.5;
      }

      .file-item__preview {
        display: flex;
        flex: 1;
        flex-direction: column;
        width: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }
}

.arrow-btn {
  position: absolute;
  top: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: rgb(0 0 0 / 50%);
  border-radius: 50%;
  transform: translateY(-50%);
  transition: all 0.3s;

  &:hover {
    background-color: rgb(0 0 0 / 80%);
  }
}

.left-arrow-btn {
  left: 0;
}

.right-arrow-btn {
  right: 0;
}

.file-item-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0 0 0 / 50%);
  opacity: 0;
  transition: opacity 0.3s;

  .delete-icon {
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: #ff4d4f;
      transform: scale(1.2);
    }
  }
}

.gallery {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background: rgb(0 0 0 / 30%);
  border: 0;
}
</style>
