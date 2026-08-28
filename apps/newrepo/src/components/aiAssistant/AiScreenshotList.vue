<template>
  <div class="ai-screenshot-list">
    <div class="ai-screenshot-title">📷 相关作业流程截图</div>
    <div
      v-for="(screenshot, index) in screenshots"
      :key="index"
      class="ai-screenshot-item"
    >
      <img
        :src="normalizeImageUrl(screenshot.url)"
        :alt="screenshot.name"
        @click="previewImage(screenshot.url)"
      />
      <div v-if="screenshot.name" class="ai-screenshot-name">
        {{ screenshot.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Image } from 'ant-design-vue';

import { normalizeImageUrl } from './utils/image';

/**
 * @date 2026-08-05
 * @prompt 实现 AI 助手截图列表组件，展示知识库相关截图
 * @description 渲染截图列表，点击图片可使用 Ant Design Image 预览
 */

interface Screenshot {
  name: string;
  url: string;
}

defineProps<{
  screenshots: Screenshot[];
}>();

const previewImage = (url: string) => {
  // 使用 Ant Design Image 预览
  Image.preview({
    src: normalizeImageUrl(url),
  });
};
</script>

<style scoped>
.ai-screenshot-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e8e8e8;
}

.ai-screenshot-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.ai-screenshot-item {
  display: inline-block;
  margin-right: 12px;
  margin-bottom: 8px;
  cursor: pointer;
}

.ai-screenshot-item img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.ai-screenshot-item img:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ai-screenshot-name {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 4px;
}
</style>
