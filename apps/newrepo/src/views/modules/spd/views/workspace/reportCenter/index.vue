<script setup lang="ts">
// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 实现报表类型和报表名称下拉框联动，并使用 iframe 渲染 UReport 报表
// @description 页面加载时调用接口获取报表树数据，实现报表类型与报表名称的级联选择功能，选中报表后通过 iframe 内嵌 UReport 预览
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { message, Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';
import KeepAliveIframe from '#/components/spd/KeepAliveIframe/src/index.vue';

/** 报表树节点类型定义 */
interface ReportTreeNode {
  label: string;
  value: string;
  children: ReportTreeNode[];
}

/** 报表类型选项 */
const reportTypeOptions = ref<Array<{ label: string; value: string }>>([]);

/** 报表名称选项 */
const reportNameOptions = ref<Array<{ label: string; value: string }>>([]);

/** 完整的报表树数据 */
const reportTreeData = ref<ReportTreeNode[]>([]);

/** UReport 报表预览 URL */
const reportPreviewUrl = ref('');

/** iframe 加载状态 */
const isLoading = ref(false);
// 初始的页签名称
const INITIAL_DOCUMENT_TITLE = document.title;
onUnmounted(() => {
  document.title = INITIAL_DOCUMENT_TITLE;
});
const openNewWindow = () => {
  window.open(window.location.pathname, '_blank');
};

/**
 * 查询表单配置
 * 包含报表类型和报表名称两个字段
 */
const [QueryForm, queryFormApi] = useVbenForm({
  compact: true,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    colon: true,
    labelWidth: 80,
  },

  layout: 'horizontal',
  wrapperClass: 'grid-cols-4',
  showDefaultActions: false,
  schema: [
    {
      component: 'Select',
      fieldName: 'reportType',
      label: '报表类型',
      formItemClass: 'col-span-1',
      componentProps: {
        placeholder: '请选择报表类型',
        allowClear: false,
        options: reportTypeOptions,
        onChange: (value: string) => {
          handleReportTypeChange(value);
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'reportName',
      label: '报表名称',
      formItemClass: 'col-span-1',
      componentProps: {
        placeholder: '请选择报表名称',
        allowClear: true,
        options: reportNameOptions,
        onChange: (value: string) => {
          handleReportNameChange(value);
        },
      },
    },
  ],
});

/**
 * 获取报表树数据
 * 页面加载时调用，初始化报表类型和名称下拉框
 */
const fetchReportTree = async () => {
  try {
    const res = await requestFormClient.post(
      '/uReportCenterAction/getReportTree',
    );
    console.warn('报表树数据', res);

    if (res?.success && res?.data) {
      reportTreeData.value = res.data;

      // 提取报表类型：过滤出 label 为"采购","财务","默认"的节点
      const typeList = res.data
        .filter((item: ReportTreeNode) =>
          ['采购', '财务', '默认'].includes(item.label),
        )
        .map((item: ReportTreeNode) => ({
          label: item.label,
          value: item.value,
        }));

      reportTypeOptions.value = typeList;
      // reportTypeOptions.value.push({
      //   label: '默认2',
      //   value: '默认2',
      // });

      // 默认选中第一项
      if (typeList.length > 0) {
        queryFormApi.setValues({ reportType: typeList[0].value });
        handleReportTypeChange(typeList[0].value);
      }
    } else {
      message.error('获取报表树数据失败');
    }
  } catch (error) {
    console.error('获取报表树数据失败', error);
    message.error('获取报表树数据失败');
  }
};

/**
 * 监听报表名称选项变化，动态更新表单字段配置
 */
watch(
  () => reportNameOptions.value,
  (newOptions) => {
    queryFormApi.setValues({
      reportName: '',
    });
  },
  { deep: true },
);

/**
 * 处理报表类型变更
 * 根据选中的报表类型，动态更新报表名称下拉框的选项
 * @param typeValue 选中的报表类型值
 */
const handleReportTypeChange = (typeValue: string) => {
  console.warn('选中的报表类型', typeValue);

  // 找到对应的节点
  const targetNode = reportTreeData.value.find(
    (item: ReportTreeNode) => item.value === typeValue,
  );

  if (targetNode && targetNode.children) {
    // 将该类型下的所有 children 转换为下拉框选项
    reportNameOptions.value = targetNode.children.map(
      (child: ReportTreeNode) => ({
        label: child.label,
        value: child.value,
      }),
    );

    // 清空报表名称的选择和预览 URL
    queryFormApi.setValues({ reportName: undefined });
    reportPreviewUrl.value = '';
  } else {
    reportNameOptions.value = [];
  }
};

/**
 * 处理报表名称变更
 * 构建 UReport 预览 URL 并在 iframe 中展示
 * @param nameValue 选中的报表名称值（文件路径）
 */
const handleReportNameChange = (nameValue: string) => {
  console.warn('选中的报表名称', nameValue);

  if (!nameValue) {
    document.title = INITIAL_DOCUMENT_TITLE;
    reportPreviewUrl.value = '';
    return;
  }

  // 找到对应的报表节点信息
  const selectedReport = reportNameOptions.value.find(
    (item) => item.value === nameValue,
  );
  document.title = selectedReport?.label || INITIAL_DOCUMENT_TITLE;
  if (selectedReport) {
    console.warn('报表信息', {
      label: selectedReport.label,
      value: selectedReport.value,
    });

    // 构建 UReport 预览 URL
    // 直接访问 UReport 服务，不走 Vite 代理（iframe 内部资源不会被代理）
    reportPreviewUrl.value = `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/ureport/preview?_u=file:${nameValue}`;
    // isLoading.value = true;
    // const targetUrl = 'http://192.168.30.61:5000';
    // reportPreviewUrl.value = `${targetUrl}/ureport/preview?_u=file:${nameValue}`;
    // 等待 DOM 更新（iframe 渲染完成后）再显示加载状态
    nextTick(() => {
      isLoading.value = true;
    });
  }
};

/**
 * iframe 加载完成回调
 */
const handleIframeLoad = () => {
  isLoading.value = false;
  console.warn('UReport 报表加载完成');
};

/** 页面加载时获取报表树数据 */
onMounted(() => {
  fetchReportTree();
});
// AI-GENERATED-END
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="box-border flex h-full w-full flex-col bg-white p-4">
      <div class="mb-1 flex items-center gap-2">
        <QueryForm class="flex-1" />
        <Button type="primary" @click="openNewWindow"> 新窗口选择报表 </Button>
      </div>
      <!-- UReport 报表预览区域 -->
      <div class="relative flex-1">
        <!-- 加载中遮罩 -->
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/80"
        >
          <span class="text-gray-500">报表加载中...</span>
        </div>
        <!-- 报表 iframe -->
        <KeepAliveIframe
          v-if="reportPreviewUrl"
          :src="reportPreviewUrl"
          class="h-full w-full border-0"
          @load="handleIframeLoad"
        />
        <!-- 未选择报表时的提示 -->
        <div
          v-else
          class="flex h-full items-center justify-center text-gray-400"
        >
          请选择报表名称
        </div>
      </div>
    </div>
  </Page>
</template>
