<script lang="ts" setup>
import type { UploadChangeParam, UploadFile } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdUploadloadOutlined } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Modal, message, Switch, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { auditDocument, deleteDocument, uploadKnowledge } from './api';
import SegmentsModalComp from './modals/segmentsModal.vue';

// 上传成功预览弹窗（简单列表：标题 + 图片数）
const previewSections = ref<any[]>([]);
const [PreviewModal, previewModalApi] = useVbenModal({
  title: '预览',
  class: 'w-[700px]',
  closable: true,
  showCancelButton: false,
  showConfirmButton: false,
  draggable: true,
  onClosed: () => {
    previewSections.value = [];
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = previewModalApi.getData<any>();
      previewSections.value = data?.sections || [];
    } else {
      previewSections.value = [];
    }
  },
});

// 查看片段弹窗（卡片详情：内容/标签/状态/检索/创建时间）
const [SegmentsModal, segmentsModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  connectedComponent: SegmentsModalComp,
  draggable: true,
});
// ==================== 上传表单 ====================

const uploadFileError = ref('');

const [UploadForm, uploadFormApi] = useVbenForm({
  layout: 'horizontal',
  commonConfig: {
    labelClass: 'w-[80px]',
    componentProps: { class: 'w-full' },
  },
  showDefaultActions: false,
  submitOnChange: false,
  submitOnEnter: false,
  wrapperClass: 'grid grid-cols-4 gap-x-4 gap-y-2',
  schema: [
    {
      fieldName: 'doc_name',
      label: '文档标题',
      component: 'Input',
      rules: 'required',
      formItemClass: 'col-span-1',
      componentProps: {
        allowClear: true,
      },
    },
    {
      fieldName: 'doc_type',
      label: '文档类型',
      component: 'Select',
      formItemClass: 'col-span-1',
      defaultValue: '查询规则',
      rules: 'selectRequired',
      componentProps: {
        options: [
          {
            label: '查询规则',
            value: '查询规则',
          },
          { label: '操作手册', value: '操作手册' },
          { label: '普通问答', value: '普通问答' },
        ],
      },
    },
    {
      fieldName: 'version',
      label: '版本号',
      component: 'Input',
      formItemClass: 'col-span-1',
      componentProps: { placeholder: '如 V1.0_202608', allowClear: true },
    },
    {
      fieldName: 'tags',
      label: '标签',
      component: 'Input',
      formItemClass: 'col-span-1',
      help: '用于按角色/终端/业务模块筛选',
      componentProps: {
        placeholder: 'JSON数组格式, 如 ["PC端","采购业务"]',
        allowClear: true,
      },
    },
  ],
});

// ==================== 工具函数 ====================
function formatDateTime(val: any): string {
  if (!val) return val;
  if (typeof val === 'number') {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}`;
  }
  if (typeof val === 'object') {
    if (val.time !== undefined) return formatDateTime(val.time);
    const y = (val.year || 0) + 1900;
    const m = String((val.month || 0) + 1).padStart(2, '0');
    const d = String(val.date || 1).padStart(2, '0');
    const h = String(val.hours || 0).padStart(2, '0');
    const min = String(val.minutes || 0).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  }
  return String(val);
}

// ==================== 文件上传 ====================
const fileList = ref<any[]>([]);
const selectedFile = ref<File | null>(null);
// 是否增在提交
const isSubmitting = ref(false);

function handleChange(info: UploadChangeParam<UploadFile<any>>) {
  const { file, fileList: list } = info;
  if (file.status === 'removed' || list.length === 0) {
    selectedFile.value = null;
    fileList.value = [];
    uploadFileError.value = '请选择文档文件';
    return;
  }
  const rawFile = file instanceof File ? file : file.originFileObj || file;
  if (!(rawFile instanceof File)) return;

  const name = rawFile.name || '';
  if (!name.toLowerCase().match(/\.(docx|pdf|txt|md)$/)) {
    message.error('仅支持 .docx / .pdf / .txt / .md 格式');
    fileList.value = [];
    selectedFile.value = null;
    return;
  }
  if (rawFile.size && rawFile.size > 100 * 1024 * 1024) {
    message.error('文件不能超过 100MB');
    fileList.value = [];
    selectedFile.value = null;
    return;
  }
  if (!rawFile.size) {
    message.error('请不要上传空文件');
    selectedFile.value = null;
    fileList.value = [];
    uploadFileError.value = '';
    return;
  }

  // 文件小于 10KB 时给出确认提示
  if (rawFile.size && rawFile.size < 10 * 1024) {
    Modal.confirm({
      title: '文件过小提示',
      content: '文件小于10KB，是否确认上传？',
      centered: true,
      onOk: () => {
        selectedFile.value = rawFile;
        fileList.value = list;
        uploadFileError.value = '';
      },
      onCancel: () => {
        selectedFile.value = null;
        fileList.value = [];
        uploadFileError.value = '';
      },
    });
    return;
  }
  selectedFile.value = rawFile;
  fileList.value = list;
  uploadFileError.value = '';
}
function handleReset() {
  uploadFormApi.setValues({
    doc_name: '',
    doc_type: '查询规则',
    version: '',
    tags: '',
  });
  fileList.value = [];
  selectedFile.value = null;
  uploadFileError.value = '';
}
async function handleSubmit() {
  const { valid } = await uploadFormApi.validate();
  if (!valid) return;
  if (!selectedFile.value) {
    uploadFileError.value = '请选择文档文件';
    return;
  }
  uploadFileError.value = '';
  const formValues = await uploadFormApi?.getValues();
  isSubmitting.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('doc_name', formValues.doc_name);
  formData.append('doc_type', formValues.doc_type);
  formData.append('version', formValues.version || '');
  formData.append('tags', formValues.tags || '');
  console.log('formData', formData);
  uploadFormApi?.setState({ commonConfig: { disabled: true } });
  uploadKnowledge(formData)
    .then((res) => {
      console.log('res', res);
      if (!res?.success) {
        throw Error(res?.msg || '上传失败');
      }
      message.success(res?.msg || res?.message || '上传成功！');
      handleReset();
      gridApi.reload();
      // 展示解析后的片段预览（简单列表）
      const sections = res.sections || [];
      if (sections.length > 0) {
        previewModalApi
          ?.setData({
            title: `${res.docName || '文档'} — 共 ${res.sectionCount || sections.length} 个片段`,
            sections,
          })
          .open();
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      uploadFormApi?.setState({ commonConfig: { disabled: false } });
      isSubmitting.value = false;
    });
}

// ==================== 文档列表表格 ====================
const [Grid, gridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: { content: '查询' },
      commonConfig: { labelClass: 'w-[80px]' },
      showCollapseButton: false,
      resetButtonOptions: { show: false },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: { trigger: 'row' },
      // checkboxConfig: { highlight: false },
      proxyConfig: { autoLoad: true },
      pagerConfig: { enabled: true },
      // seqConfig: {
      //   seqMethod: ({ rowIndex }: any) => rowIndex + 1,
      //   startIndex: 1,
      // },
      cellClassName: (scope: Record<string, any>) => {
        if (scope?.column?.field !== 'IS_ACTIVE') {
          return '';
        }
        const cellValue = scope?.row?.['IS_ACTIVE'];
        if (cellValue === 'Y') return 'text-green-500';
        if (cellValue === 'N') return 'text-orange-500';
        return 'text-gray-400';
      },
    }),
  },
  {
    id: 'knowledgeBaseTable',
    queryUrl: '/aIChatAction/listDocuments.do',
    beforeFetchFn: (params: Record<string, any>) => {
      console.log('beforeFetchFn params', params);
      return {
        ...params,
        // pageNum: params.start + 1,
        pageSize: params.limit,
      };
    },
    afterFetchFn: (res: any) => {
      return {
        ...res,
        records: res.data || res.rows || [],
        total: res?.total || 0,
      };
    },
    // formSchema: [
    //   {
    //     component: 'Input',
    //     componentProps: { allowClear: true, placeholder: '请输入文档标题' },
    //     fieldName: 'docTitle',
    //     label: '文档标题',
    //     formItemClass: 'pl-[10px] pr-[10px]',
    //     labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   },
    //   {
    //     component: 'ChcSelect',
    //     componentProps: () => ({
    //       dictUrl: '/datatable/getDict/ai.kb.docType',
    //       placeholder: '请选择文档类型',
    //       paginate: false,
    //       showSearch: true,
    //       filterByFrontEnd: true,
    //       afterFetch: (records: any[]) => ({ records }),
    //     }),
    //     fieldName: 'docType',
    //     label: '文档类型',
    //     formItemClass: 'pl-[10px] pr-[10px]',
    //     labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //     defaultValue: '',
    //   },
    //   {
    //     component: 'Input',
    //     componentProps: { allowClear: true, placeholder: '请输入关键词' },
    //     fieldName: 'keyword',
    //     label: '关键词',
    //     formItemClass: 'pl-[10px] pr-[10px]',
    //     labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   },
    // ],
    gridColumns: [
      {
        fixed: 'left',
        title: '序号',
        width: 50,
        type: 'seq',
        align: 'center',
        // formatter(scope: any) {
        //   console.log('testtestetsdasaaaaaaaaaaaaaaaa', scope);
        //   return scope.rowIndex + 1;
        // },
      },
      { field: 'DOC_NAME', title: '文档标题', minWidth: 150, sortable: true },
      { field: 'DOC_TYPE', title: '类型', minWidth: 150, sortable: true },
      { field: 'VERSION', title: '版本', width: 150, sortable: true },
      {
        field: 'TOTAL_CHUNK_COUNT',
        title: '片段数',
        width: 150,
        sortable: true,
        align: 'center',
      },
      {
        field: 'IS_ACTIVE',
        title: '状态',
        width: 150,
        sortable: true,
        align: 'center',
        editRender: {},
        slots: {
          default: 'defaultIsActive',
        },
      },
      {
        field: 'CREATED_TIME',
        width: 150,
        title: '创建时间',
        sortable: true,
        formatter: ({ cellValue }: any) => formatDateTime(cellValue),
      },
      {
        align: 'center',
        slots: { default: 'action' },
        field: 'action',
        fixed: 'right',
        width: 220,
        title: '操作',
      },
    ],
  },
);

// ==================== 操作 ====================

function handleDel(row: any) {
  Modal.confirm({
    title: '确认删除',
    content: '确定删除该文档及其所有片段吗？',
    centered: true,
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await deleteDocument({ docId: row.DOC_ID });
        if (!res?.success) {
          throw Error(res?.msg || '删除失败');
        }
        message.success('删除成功');
        gridApi.reload();
      } catch (err) {
        console.error(err);
      }
    },
  });
}

function handleAudit(row: any) {
  Modal.confirm({
    title: '审核确认',
    content: '确认审核通过该文档？通过后将进入知识库，可被AI检索命中。',
    centered: true,
    onOk: async () => {
      try {
        const res = await auditDocument({ docId: row.DOC_ID, IS_ACTIVE: 'Y' });
        if (!res?.success) {
          throw Error(res?.msg || '审核失败');
        }
        message.success(res.message || '审核通过');
        gridApi.reload();
      } catch (err) {
        console.error(err);
      }
    },
  });
}
function handleCancelAudit(row: any) {
  Modal.confirm({
    title: '状态变更',
    content: '设为非活跃后，需重新审核，确认操作吗？',
    centered: true,
    onOk: async () => {
      try {
        const res = await auditDocument({ docId: row.DOC_ID, IS_ACTIVE: 'N' });
        if (!res?.success) {
          throw Error(res?.msg || '失败');
        }
        message.success(res.message || '成功');
        gridApi.reload();
      } catch (err) {
        console.error(err);
      }
    },
  });
}

const handleStatusChange = (row: any, newVal: boolean) => {
  if (newVal) {
    // 新值为 true（N→Y），不允许
    message.warning('只能将活跃状态改为待审核，不可逆操作');
  } else {
    // 新值为 false（Y→N），调用取消审核
    handleCancelAudit(row);
  }
};

function handleViewSegments(row: any) {
  segmentsModalApi
    ?.setData({
      title: `文档片段 - ${row.DOC_NAME}`,
      docId: row.DOC_ID,
    })
    .open();
}
</script>

<template>
  <Page
    content-class="flex flex-col overflow-hidden p-2"
    auto-content-height
    header-class="px-3 py-2"
  >
    <!-- 上传成功预览弹窗 -->
    <PreviewModal>
      <div class="max-h-[500px] overflow-y-auto">
        <ul v-if="previewSections.length > 0" class="space-y-2">
          <li
            v-for="(s, i) in previewSections"
            :key="s.chunk_id || i"
            class="rounded border border-gray-200 px-4 py-3"
          >
            <span class="font-medium text-gray-800">
              {{ i + 1 }}. {{ s.title || '未命名' }}</span
            >
            <span class="ml-2 text-sm text-gray-400">
              ({{ s.imageCount || 0 }} 张图片)
            </span>
          </li>
        </ul>
        <div v-else class="py-8 text-center text-gray-400">暂无片段数据</div>
      </div>
    </PreviewModal>

    <!-- 查看片段弹窗（卡片详情） -->
    <SegmentsModal />

    <!-- 上传知识文档区域 -->
    <div class="flex-shrink-0 rounded bg-white p-4 shadow-sm">
      <h3 class="mb-3 text-base font-semibold">上传知识文档</h3>
      <UploadForm />

      <div class="mt-3 flex items-start gap-4">
        <label
          class="mr-2 flex w-[80px] flex-shrink-0 items-center justify-end text-sm leading-6"
        >
          <span class="text-red-500">*</span>
          <span class="ml-1 font-medium">文档文件</span>
        </label>
        <div class="flex-1">
          <div class="relative">
            <UploadDragger
              v-model:file-list="fileList"
              name="file"
              accept=".docx,.pdf,.txt,.md"
              :max-count="1"
              :before-upload="() => false"
              @change="handleChange"
              class="h-[100px]"
              :disabled="isSubmitting"
            >
              <p class="ant-upload-drag-icon flex justify-center">
                <AntdUploadloadOutlined class="text-[36px] text-gray-400" />
              </p>
              <p class="ant-upload-text text-gray-500">
                点击或拖拽 .docx / .pdf / .txt / .md 文件到此处上传（最大100MB）
              </p>
            </UploadDragger>
          </div>
          <div
            v-if="uploadFileError"
            class="text-destructive text-[0.8rem]"
            role="alert"
          >
            {{ uploadFileError }}
          </div>
          <div class="mt-3 flex justify-end gap-2">
            <Button
              type="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <template #icon>
                <AntdUploadloadOutlined />
              </template>
              上传并解析
            </Button>
            <Button :disabled="isSubmitting" @click="handleReset">重置</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识库文档列表 -->
    <div
      class="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded bg-white shadow-sm"
    >
      <h3 class="flex-shrink-0 px-4 py-2 text-base font-semibold">
        知识库文档列表
      </h3>
      <div class="flex-1 overflow-hidden">
        <Grid>
          <template #defaultIsActive="{ row }">
            <Switch
              :checked="row.IS_ACTIVE === 'Y'"
              checked-children="活跃"
              un-checked-children="待审核"
              :disabled="row.IS_ACTIVE === 'N'"
              @update:checked="(val: boolean) => handleStatusChange(row, val)"
            />
          </template>
          <template #action="{ row }">
            <Button
              v-if="row.IS_ACTIVE === 'N'"
              type="primary"
              ghost
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              data-testid="button_audit"
              @click="handleAudit(row)"
            >
              审核
            </Button>

            <Button
              type="primary"
              ghost
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              data-testid="button_view"
              @click="handleViewSegments(row)"
            >
              查看片段
            </Button>
            <Button
              type="primary"
              ghost
              danger
              data-testid="button_del"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleDel(row)"
            >
              删除
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
:deep(.ant-upload-drag) {
  border: 2px dashed #4096ff !important;
  background: #e8f4ff !important;
}

:deep(.ant-upload-drag:hover) {
  border-color: #69b1ff !important;
  background: #e8f4ff !important;
}
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>
