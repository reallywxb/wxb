<script setup lang="ts">
import type { BatchItem, StoragePath } from '../api';

import { nextTick, onMounted, onUnmounted, ref } from 'vue';

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
import pdfPlaceholder from '../image/pdf.jpg'; // PDF占位图
import PreviewImage from './previewImage.vue';
import PreviewPdf from './previewPdf.vue';

interface DialogState {
  title: string;
  type: 'add' | 'edit';
  vbpBatchId?: string;
  callback?: (data: any) => void;
  [key: string]: any;
}

// 文件列表
interface FileItem {
  id: string;
  file?: File; // File对象(仅本地新增)
  url: string;
  type: 'image' | 'pdf';
  name: string;
  isActive?: boolean; // 是否选中状态
  isDel?: boolean; // 删除标记
  isFromServer: boolean; // 文件来源: true=服务端, false=本地
  serverId?: number; // 服务端文件ID (接口返回的 id)
  serverPath?: string; // 服务端完整路径 (接口返回的 path)
  format?: string; // 文件格式 (接口返回的 format)
}

// 预览项接口
interface PreviewItem {
  type: 'img' | 'pdf';
  url: string;
}

// 图标
const PlusOutlined = createIconifyIcon('ant-design:plus-outlined');
const LeftOutlined = createIconifyIcon('ant-design:left-outlined');
const RightOutlined = createIconifyIcon('ant-design:right-outlined');
const title = ref<string>(''); // 弹窗标题
const state = ref<DialogState | Record<string, any>>({}); // 用于存储弹窗数据
const formType = ref<'add' | 'edit'>('add');
const currentBatchId = ref<string>(''); // 当前批次ID
// 文件相关
const fileInputRef = ref<HTMLInputElement>(); // 隐藏的 file input 元素引用
const fileList = ref<FileItem[]>([]);
const nowChoosedItem = ref<FileItem | null>(null);
const deletedServerFileIds = ref<number[]>([]); // 记录被删除的服务端文件ID
// 预览相关
const nowPreviewFiles = ref<PreviewItem[]>([]);
const previewLoading = ref(false);
// 滚动相关
const mainContainer = ref<HTMLElement>();
const imageContainer = ref<HTMLElement>();
const showArrows = ref(false); // 是否显示左右箭头
const containerPadding = ref('0 10px'); // 容器内边距

// const ALLOWED_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.pdf', '.png']);
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

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },

  onClosed() {
    // 清空文件列表和预览
    fileList.value.forEach((item) => {
      if (!item.isFromServer && item.url) {
        URL.revokeObjectURL(item.url);
      }
    });
    // 重置所有状态
    fileList.value = [];
    nowPreviewFiles.value = [];
    nowChoosedItem.value = null;
    deletedServerFileIds.value = [];
    showArrows.value = false;
  },
  onConfirm() {},
  showConfirmButton: false,
  showCancelButton: false,
  // cancelText: '关闭',
  closeOnClickModal: false,
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      state.value = modalApi.getData<Record<string, any>>();
      title.value = state.value?.title || '';
      formType.value = state.value?.type || 'add';
      currentBatchId.value = state.value?.vbpBatchId || '';
      console.warn(`打开了${title.value}`, state.value);
      // 编辑模式: 加载批次详情
      if (formType.value === 'edit' && currentBatchId.value) {
        await loadBatchDetail(currentBatchId.value);
      }
      // if (state.value.type === 'edit') {
      //   const result = await getBatchVBPActionList({
      //     batchId: state.value.vbpBatchId || undefined,
      //   });
      //   console.warn('获取到的批次操作列表', result);
      //   if (result && result.rows && result.rows.length > 0) {
      //     const record: BatchItem = result.rows[0];
      //     if (record.vbpBatchId > 0) {
      //       console.warn('record:', record);
      //       const filePath: FileItem[] = [];
      //       if (record.storagePaths && record.storagePaths.length > 0) {
      //         record.storagePaths.forEach((item: StoragePath) => {
      //           filePath.push({
      //             path: item.path,
      //             format: item.format,
      //             id: item.id,
      //           });
      //         });
      //         fileList.value = filePath;
      //       }
      //     }
      //   }
      // }
    }
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行，值为horizontal
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
      componentProps: () => {
        return {
          placeholder: '',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productType',
      formItemClass: 'col-span-1 pb-2 hidden',
      hideLabel: true,
      componentProps: () => {
        return {
          placeholder: '',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'batchId',
      formItemClass: 'col-span-1 pb-2 hidden',
      hideLabel: true,
      componentProps: () => {
        return {
          placeholder: '',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '批次名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入名称',
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'type',
      label: '集采类型',
      rules: 'required',
      // defaultValue: '',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000601',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择集采类型',
          paginate: false,
          // showChooseAll: '',
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
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'beginDate',
      label: '开始日期',
      rules: 'required',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      label: '结束日期',
      rules: 'required',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入描述',
          type: 'textarea',
          maxLength: 20,
        };
      },
      formItemClass: 'col-span-1',
      fieldName: 'remark',
      label: '备注',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

// 加载批次详情数据
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
        remark: record.remark || '',
      });
      // 处理服务端的文件
      if (record.storagePaths && record.storagePaths.length > 0) {
        fileList.value = record.storagePaths.map((item: StoragePath) => {
          return convertServerFileToFileItem(item);
        });
        // console.log('loadBatchDetail_fileList:', fileList.value);
        // console.log('loadBatchDetail_fileList:', fileList.value);
        // 初始化选择第一个文件
        if (fileList.value.length > 0) {
          await nextTick();
          handleChoose(fileList.value[0]!, 0);
        }
        computeWidth();
      }
    }
  } catch (error) {
    console.error('加载批次详情失败:', error);
  }
};

/**
 * 将服务端文件数据转换为统一的FileItem格式
 * @param serverFile 服务端返回的文件数据
 */
const convertServerFileToFileItem = (serverFile: StoragePath): FileItem => {
  // 判断文件类型
  const formatLower = serverFile.format?.toLowerCase() || '';
  const isImage = ['gif', 'jpeg', 'jpg', 'png'].includes(formatLower);
  // 服务端path http://192.168.20.141:31742/spd/batchVBPAction/view.do?path=file://VBP_Batch_Attach/1000003/test_logo.png
  // 从path 中提取出文件名称
  const fileName = serverFile.path.split('/').pop() || `文件${serverFile.id}`;
  // console.log('fileName', fileName);
  return {
    id: `server-${serverFile.id}`, // 统一ID格式: server-数字
    isFromServer: true, // 标记为服务端文件
    serverId: serverFile.id, // 保存服务端ID
    serverPath: serverFile.path, // 保存完整路径
    format: serverFile.format, // 保存格式
    url: serverFile.path, // 预览URL直接用path
    type: isImage ? 'image' : 'pdf', // 文件类型
    name: fileName, // 显示名称
    isActive: false,
    isDel: false,
  };
};
// 验证文件类型
const validateFileType = (file: File): boolean => {
  // 检查MIME类型
  if (ALLOWED_CONFIG.mimeTypes.includes(file.type)) {
    return true;
  }
  // 检查文件扩展名
  const fileExtension = file.name
    .slice(Math.max(0, file.name.lastIndexOf('.')))
    .toLowerCase();
  // 检查文件扩展名是否在允许的列表中
  return ALLOWED_CONFIG.extensions.includes(fileExtension);
};

// 验证文件名是否包含空格
const validateFileName = (fileName: string): boolean => {
  return !fileName.includes(' ');
};

// 验证文件大小是否超过限制
const validateFileSize = (fileSize: number, limitMB: number = 20): boolean => {
  const limitBytes = limitMB * 1024 * 1024;
  return fileSize <= limitBytes;
};

// 检查文件名是否已存在
const isDuplicateFile = (fileName: string): boolean => {
  return fileList.value.some((item) => item.name === fileName);
};

// 计算是否需要显示箭头
const computeWidth = () => {
  nextTick(() => {
    if (!mainContainer.value || !imageContainer.value) return;

    // 计算容器可用宽度（减去上传按钮的宽度）
    const containerWidth = mainContainer.value.offsetWidth;
    const uploadBtnWidth = 100; // 上传按钮 80px + margin 20px
    const availableWidth = containerWidth - uploadBtnWidth;

    // 计算文件列表总宽度：每个文件项 80px + gap 10px
    const filesWidth = fileList.value.length * 90;

    if (filesWidth > availableWidth) {
      // 需要滚动，显示箭头并调整padding
      showArrows.value = true;
      containerPadding.value = '0 50px'; // 左右留出箭头位置
    } else {
      // 不需要滚动，隐藏箭头
      showArrows.value = false;
      containerPadding.value = '0 10px';
    }
  });
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  // console.log('handleFileChange_event', event);
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  // 验证文件类型
  const validFiles: File[] = [];
  const errors: string[] = [];

  [...files].forEach((file) => {
    // 1. 类型校验
    if (!validateFileType(file)) {
      errors.push(`${file.name}: 格式不支持`);
      return;
    }

    // 2. 文件名校验
    if (!validateFileName(file.name)) {
      errors.push(`${file.name}: 文件名不能包含空格`);
      return;
    }

    // 3. 大小校验
    if (!validateFileSize(file.size)) {
      errors.push(`${file.name}: 文件大小超过20M`);
      return;
    }
    // 4. 重复校验
    if (isDuplicateFile(file.name)) {
      errors.push(`${file.name}: 文件已存在, 请重新选择`);
      return;
    }
    validFiles.push(file);
  });

  // 提示错误信息
  if (errors.length > 0) {
    message.error(errors.join('\n'));
  }

  // 处理合法的文件
  validFiles.forEach((file) => {
    // 生成文件 ID
    const fileId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    //  生成预览 URL
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'pdf';
    // 构建文件项
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

  // 自动预览第一个文件
  if (fileList.value.length > 0 && !nowChoosedItem.value) {
    nextTick(() => {
      handleChoose(fileList.value[0], 0);
    });
  }
  // 重新计算是否需要显示箭头
  computeWidth();
  // 清空 input 的值，允许重复选择同一文件
  target.value = '';
};

// 触发文件选择(打开文件选择弹窗)
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleChoose = async (item: FileItem, index: number) => {
  // console.log('handleChoose_item', item);
  if (item.isDel) return;

  previewLoading.value = true;
  nowChoosedItem.value = item;
  // 更新激活状态
  fileList.value.forEach((f) => (f.isActive = false));
  item.isActive = true;
  // 滚动到对应位置
  scrollTo(index * 106);
  if (item.type === 'pdf') {
    nowPreviewFiles.value = [{ type: 'pdf', url: item.url }];
  } else if (item.type === 'image') {
    nowPreviewFiles.value = [{ type: 'img', url: item.url }];
  }
  await nextTick();
  previewLoading.value = false;
};

// 删除文件
const handleDeleteFile = (item: FileItem, index: number) => {
  // console.log('handleDeleteFile_item', item);
  AntModal.confirm({
    title: '提示',
    content: `确认删除文件 "${item.name}" 吗?`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      // 需要区分情况 如果是新增直接本地删除 如果是编辑过来的需要调用删除接口删除
      try {
        if (item.isFromServer && item.serverId) {
          // 调用删除接口
          await deleteBatchAttachment(item.serverId);
          deletedServerFileIds.value.push(item.serverId);
          // console.log('删除服务器文件成功:', item.serverId);
        } else {
          // 释放URL对象
          URL.revokeObjectURL(item.url);
          // console.log('删除本地文件成功:', item.url);
        }
        // 从列表中移除
        fileList.value.splice(index, 1);
        // fileList.value = fileList.value.filter((f) => f.id !== item.id);
        // 如果删除的是当前预览的文件，清空预览或切换到其他文件
        if (nowChoosedItem.value?.id === item.id) {
          //   const index = fileList.value.findIndex((f) => f.id === item.id);
          //   if (fileList.value.length > 1) {
          //     // 切换到下一个或上一个文件
          //     const nextIndex =
          //       index === fileList.value.length - 1 ? index - 1 : index + 1;
          //     currentPreviewUrl.value = fileList.value[nextIndex].url;
          //   } else {
          //     currentPreviewUrl.value = '';
          //   }
          // }
          if (fileList.value.length > 0) {
            // 选中相邻的文件
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

// 滚动控制
const scrollTo = (index: number) => {
  if (!imageContainer.value) return;

  // 每个item的宽度：80px + 10px gap = 90px
  const scrollPosition = index * 90;

  imageContainer.value.scrollTo({
    left: scrollPosition,
    behavior: 'smooth',
  });
};

const handleScrollLeft = () => {
  if (!imageContainer.value) return;

  const currentScroll = imageContainer.value.scrollLeft;
  imageContainer.value.scrollTo({
    left: currentScroll - 90, // 每次滚动一个item的宽度
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

// 鼠标滚轮控制
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

// 鼠标移入移出事件
const mouseenterCallback = () => {
  imageContainer.value?.addEventListener('wheel', wheelCallback);
};

const mouseleaveCallback = () => {
  imageContainer.value?.removeEventListener('wheel', wheelCallback);
};

// 提交
const handleSubmit = async () => {
  try {
    const validateResult = await baseFormApi.validate();
    if (!validateResult.valid) {
      return;
    }
    const formValues = await baseFormApi.getValues();
    //  深度过滤对象中的null和undefined属性
    const newFormValues = Object.fromEntries(
      Object.entries(formValues).filter(
        ([_, v]) => v !== null && v !== undefined,
      ),
    );
    // 只提取本地新增的文件(服务端文件不需要重复上传)
    const newFiles = fileList.value
      .filter((item) => !item.isFromServer && item.file)
      .map((item) => item.file);
    // console.log('newFiles', newFiles);
    const params = {
      ...newFormValues,
      productType: 'H',
      // files: fileList.value.map((item) => item.file),
      files: newFiles,
    };
    console.warn('提交参数:', params);
    AntModal.confirm({
      title: '提示',
      content: '确认通过？',
      onOk: async () => {
        try {
          const res = await saveBatchVBPAction(params as any);
          // console.log('提交成功:', res);
          message.success(formType.value === 'edit' ? '修改成功' : '新增成功');
          // 调用回调,通知父组件刷新
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
      <!-- 左侧：文件上传和预览区 -->
      <div class="w-8/12">
        <!-- 文件列表区域 -->
        <div class="upload-header mb-2" ref="mainContainer">
          <div class="flex h-full w-full border border-[#b1b1b1] py-2">
            <!-- 上传按钮 -->
            <div class="upload-btn" @click="triggerFileInput">
              <PlusOutlined class="text-xl text-gray-400" />
              <span class="mt-1 text-xs text-gray-500">上传文件</span>
            </div>
            <!-- 上传列表容器 -->
            <div
              class="file-list-wrapper"
              :style="{ padding: containerPadding }"
            >
              <!-- 左切换按钮 -->
              <div
                class="arrow-btn left-arrow-btn"
                @click="handleScrollLeft"
                v-show="showArrows"
              >
                <LeftOutlined style="color: #fff" />
              </div>
              <!-- 滚动列表 -->
              <div class="scroll-container" ref="imageContainer">
                <div class="file-list">
                  <div
                    v-for="(item, index) in fileList"
                    :key="item.id"
                    class="file-item"
                    :class="{ active: item.isActive, del: item.isDel }"
                    @click="handleChoose(item, index)"
                  >
                    <!-- 图片预览 -->
                    <div class="file-item__preview">
                      <img
                        v-if="item.type === 'image'"
                        :src="item.url"
                        :alt="item.name"
                      />
                      <!-- PDF 图标 -->
                      <img v-else :src="pdfPlaceholder" />
                    </div>
                    <!-- 文件名 -->
                    <div
                      class="flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs text-gray-500"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </div>
                    <!-- 删除蒙层 -->
                    <div class="file-item-mask">
                      <MdiLightDelete
                        class="delete-icon"
                        @click.stop="handleDeleteFile(item, index)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右切换按钮 -->
              <div
                class="arrow-btn right-arrow-btn"
                @click="handleScrollRight"
                v-show="showArrows"
              >
                <RightOutlined style="color: #fff" />
              </div>
            </div>
            <!-- 隐藏的 file input -->
            <input
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
        <!-- 预览区 -->
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
      <!-- 右侧：表单输入区 -->
      <div class="w-4/12">
        <BaseForm />
      </div>
    </div>
    <template #prepend-footer>
      <Button type="primary" @click="handleSubmit" data-testid="button_submit">
        提交
        <template #icon>
          <SvgSaveIcon class="mb-1" />
        </template>
      </Button>
      <Button @click="modalApi.close()" data-testid="button_cancel">
        关闭
        <template #icon>
          <SvgCloseIcon class="mb-1" />
        </template>
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
  height: 100%;
  transition: padding 0.3s;
}

.scroll-container {
  // width: calc(100% - 100px);
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

// 左右切换按钮
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

.text {
  width: calc(100% - 80px);
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  color: #303033;
  white-space: nowrap;
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
