<script lang="ts" setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
const htmlContent = ref('');
const iframeRef = useTemplateRef<HTMLIFrameElement>('iframeRef');
/**
 * 加载HTML文件内容
 */
const loadHtmlContent = async (url: string) => {
  try {
    // const htmlUrl = '/vben/docs/采购功能操作指引.html';
    const htmlUrl = url;
    const response = await fetch(htmlUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取原始字节数据
    const arrayBuffer = await response.arrayBuffer();

    // 使用TextDecoder解码gb2312编码的内容
    const decoder = new TextDecoder('gb2312');
    let content = decoder.decode(arrayBuffer);

    // 处理图片相对路径，使用public目录中的资源
    const basePath = `/${import.meta.env.VITE_BASE}/docs/`;

    content = content.replaceAll(
      /src="([^"]*\.(?:png|jpg|jpeg|gif|bmp|webp))"/gi,
      (match, imagePath) => {
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
          return match;
        }
        return `src="${basePath}${imagePath}"`;
      },
    );

    // 处理可能的乱码图片引用
    content = content.replaceAll(
      /src="([^"]*files[^"]*\.(?:png|jpg|jpeg|gif|bmp|webp))"/gi,
      (match, imagePath) => {
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
          return match;
        }
        return `src="${basePath}${imagePath}"`;
      },
    );

    // content = content.replaceAll(/charset=gb2312/gi, 'charset=utf-8');

    htmlContent.value = content;
  } catch (error) {
    console.error('加载HTML文件失败:', error);
    htmlContent.value = '<p>加载文档失败，请稍后重试。</p>';
  }
  nextTick(() => {
    if (iframeRef.value) {
      iframeRef.value.srcdoc = htmlContent.value;
      // 当iframe内容加载完成后调整高度
      iframeRef.value.addEventListener('load', () => {
        try {
          // 访问iframe内部的文档高度
          const iframeDoc =
            iframeRef.value?.contentDocument ||
            iframeRef.value?.contentWindow?.document;
          if (iframeDoc) {
            // 获取内容实际高度
            const contentHeight = iframeDoc.body.scrollHeight;
            // 设置iframe高度，增加一些缓冲区
            iframeRef.value.style.height = `${contentHeight + 20}px`;
            console.warn('iframe高度已调整为:', contentHeight + 20);
          }
        } catch (error) {
          console.error('调整iframe高度失败:', error);
        }
      });
    }
  });
};

const [ModalFirst, modalApi] = useVbenModal({
  appendToMain: true,
  showConfirmButton: false,
  confirmDisabled: false,
  showCancelButton: false,
  onCancel() {
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      // 当模态框打开时加载HTML内容
      loadHtmlContent(modalData.value.url || '');
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[600px] w-[800px]">
    <iframe ref="iframeRef" frameborder="0" class="h-full w-full"></iframe>
  </ModalFirst>
</template>

<style scoped>
.html-content {
  max-height: 70vh;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
}

.html-content :deep(.Section0) {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.html-content :deep(table) {
  width: 100%;
  margin: 10px 0;
  border-collapse: collapse;
}

.html-content :deep(td) {
  padding: 8px;
  vertical-align: top;
  border: 1px solid #ddd;
}

.html-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 10px auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.html-content :deep(p) {
  margin: 8px 0;
  text-align: justify;
  word-wrap: break-word;
}

.html-content :deep(h1, h2, h3, h4, h5, h6) {
  margin: 15px 0 10px;
  font-weight: bold;
}

.html-content :deep(*) {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif !important;
}

.html-content :deep(span) {
  font-size: inherit;
}

.html-content :deep(.MsoNormal) {
  padding: 0;
  margin: 0;
}

/* 确保图片容器正确显示 */
.html-content :deep(div) {
  word-wrap: break-word;
}

.html-content :deep(table.MsoNormalTable) {
  border-collapse: collapse;
  border: 1px solid #000;
}

.html-content :deep(table.MsoNormalTable td) {
  padding: 4px 8px;
  border: 1px solid #000;
}
</style>
