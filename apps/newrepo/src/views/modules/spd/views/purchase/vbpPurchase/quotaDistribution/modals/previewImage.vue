<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { Image } from 'ant-design-vue';

const props = defineProps<{
  url: string;
}>();
const prevImg = ref();
const visible = ref(true);
const getHtmlContainer = () => {
  return () => prevImg.value;
};

// 在 window 的 capture 阶段拦截 wheel 事件，阻止 Ant Design Image Preview 的缩放
// Ant Design 在 window 的 bubbling 阶段监听，所以我们在 capture 阶段抢先处理
let wheelHandler: ((e: Event) => void) | null = null;

onMounted(() => {
  // 调试：监听 window 上的 wheel 事件
  const debugHandler = (e: Event) => {
    const target = (e as WheelEvent).target as HTMLElement;
    const inPopup = target?.closest?.('.ant-select-dropdown');
    if (inPopup) {
      console.log(
        '[DEBUG] wheel on select dropdown, target:',
        target.tagName,
        target.className,
      );
    }
  };
  window.addEventListener('wheel', debugHandler, { capture: true });

  // 延迟注册，确保在 Ant Design 的监听之后
  setTimeout(() => {
    wheelHandler = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      const previewWrap = document.querySelector('.ant-image-preview-wrap');

      // 如果预览不存在或已关闭，不处理
      if (!previewWrap) return;

      const targetEl = wheelEvent.target as HTMLElement;

      // 1. 检查是否在弹出层（下拉框等）上 — 阻止传递给 Ant Image，但不阻止默认滚动
      const popupEl = targetEl?.closest?.(
        '.ant-select-dropdown, .ant-dropdown, .ant-tooltip, .ant-popover, .ant-picker-dropdown, .rc-select-dropdown',
      );
      if (popupEl) {
        wheelEvent.stopImmediatePropagation();
        // 不调用 preventDefault()，让下拉框的正常滚动行为继续
        return;
      }

      // 2. 检查是否在图片预览区域内 — 放行，让 Ant Design 处理缩放
      if (previewWrap.contains(wheelEvent.target as Node)) {
        // 在预览区域内，放行（不阻止）
        return;
      }

      // 3. 在其他区域（Modal 内容、缩略图等），阻止传递到 Ant Design 的缩放 handler
      wheelEvent.stopImmediatePropagation();
      wheelEvent.preventDefault();
    };

    window.addEventListener('wheel', wheelHandler, {
      capture: true,
      passive: false,
    });
  }, 500);
});

onUnmounted(() => {
  if (wheelHandler) {
    window.removeEventListener('wheel', wheelHandler, { capture: true });
    wheelHandler = null;
  }
});
</script>
<template>
  <div class="preview-image" ref="prevImg">
    <Image
      :src="url"
      style="display: none"
      :preview="{
        getContainer: getHtmlContainer(),
        src: props.url,
        visible,
        maskClassName: 'ant-image-preview-mask',
      }"
      :preview-mask="false"
    />
  </div>
</template>
<style scoped>
.preview-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-image ::v-deep(.ant-image-preview-wrap) {
  position: absolute;
}

.preview-image
  ::v-deep(.ant-image-preview-body .ant-image-preview-operations-wrapper) {
  position: absolute;
}

.preview-image
  ::v-deep(.ant-image-preview-body .ant-image-preview-img-wrapper) {
  align-items: normal;
}

.preview-image
  ::v-deep(.ant-image-preview-operations-operation:has(.anticon-close)) {
  display: none;
}

.preview-image ::v-deep(.ant-image-preview-mask) {
  position: absolute;
}

/* 阻止预览区域外的滚轮事件触发缩放 */
.preview-image ::v-deep(.ant-image-preview-wrap) {
  pointer-events: auto;
}

.preview-image ::v-deep(body) {
  overflow: hidden !important;
}
</style>
