<script setup lang="ts">
import {
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue';

import {
  createFrame,
  destroyFrame,
  FrameManager,
  hideIframe,
  showIframe,
  updateIframeSrc,
} from './core';

interface FrameOptions {
  src?: string;
  keepAlive?: boolean;
  iframeAttrs?: Record<string, any>;
  maxCacheSize?: number;
  parentContainer?: HTMLElement;
  zIndex?: number;
}

const props = withDefaults(defineProps<FrameOptions>(), {
  src: '',
  keepAlive: true,
  maxCacheSize: 10,
  zIndex: 1,
  iframeAttrs: () => ({}),
  parentContainer: undefined,
});

const emit = defineEmits<{
  load: [event: Event];
  error: [event: Event | string];
  activated: [];
  deactivated: [];
  destroy: [];
  resize: [rect: DOMRect];
  cacheHit: [];
  cacheMiss: [];
}>();

const iframeContainerRef = useTemplateRef<HTMLDivElement>('iframeContainerRef');
let idCounter = 0;
const uid = `iframe_${idCounter++}`;
const loading = ref(false);
const error = ref(false);

/** 获取容器位置 */
function getRect(): {
  width: number;
  height: number;
  top: number;
  left: number;
} {
  const el = iframeContainerRef.value;
  if (el) {
    const rect = el.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    };
  }
  return { width: 0, height: 0, top: 0, left: 0 };
}

/** 加载完成 */
function handleLoad(event: Event) {
  loading.value = false;
  emit('load', event);
}

/** 加载失败 */
function handleError(event: Event | string) {
  loading.value = false;
  error.value = true;
  emit('error', event);
}

/** 获取或创建 frame */
function getOrCreateFrame() {
  if (!props.src) return;
  const frame = FrameManager.get(uid);
  if (frame) {
    emit('cacheHit');
    return frame;
  }
  emit('cacheMiss');
  const rect = getRect();
  return createFrame({
    uid,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    src: props.src,
    zIndex: props.zIndex,
    attrs: props.iframeAttrs,
    onLoaded: handleLoad,
    onError: handleError,
    keepAlive: props.keepAlive,
    container: props.keepAlive
      ? undefined
      : (iframeContainerRef.value ?? undefined),
    parentContainer: props.parentContainer,
  });
}

/** 显示 iframe */
function doShow() {
  const frame = FrameManager.get(uid);
  if (frame) {
    showIframe(frame);
  } else if (props.src) {
    getOrCreateFrame();
  }
}

/** 隐藏 iframe */
function doHide() {
  const frame = FrameManager.get(uid);
  if (frame) {
    hideIframe(frame);
  }
}

/** 更新 src */
function doUpdate() {
  const frame = FrameManager.get(uid);
  if (frame) {
    updateIframeSrc(frame, props.src);
  } else if (props.src) {
    getOrCreateFrame();
  }
}

// 监听 src 变化
watch(
  () => props.src,
  (newSrc) => {
    if (!newSrc) {
      const frame = FrameManager.get(uid);
      if (frame) destroyFrame(frame);
      return;
    }
    doUpdate();
  },
);

// 监听 maxCacheSize
watch(
  () => props.maxCacheSize,
  (size) => {
    FrameManager.setMaxCacheSize(size);
  },
);

onMounted(async () => {
  await nextTick();
  doShow();
  FrameManager.setMaxCacheSize(props.maxCacheSize);
});

onActivated(() => {
  if (props.keepAlive) {
    doShow();
  } else {
    doUpdate();
  }
  emit('activated');
});

onDeactivated(() => {
  if (props.keepAlive) {
    doHide();
  } else {
    const frame = FrameManager.get(uid);
    if (frame) destroyFrame(frame);
  }
  emit('deactivated');
});

onBeforeUnmount(() => {
  const frame = FrameManager.get(uid);
  if (frame) destroyFrame(frame);
  emit('destroy');
});
</script>

<template>
  <div
    ref="iframeContainerRef"
    class="relative h-full w-full"
    role="keep-alive-frame-container"
  >
    <!-- 加载中 -->
    <div
      v-if="src && loading"
      class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      :style="{ zIndex: zIndex + 1 }"
    >
      <div class="keep-alive-loading-spinner"></div>
    </div>
    <!-- 错误 -->
    <div
      v-else-if="src && error"
      class="flex h-full w-full items-center justify-center text-gray-500"
    >
      出错了！
    </div>
    <!-- 空 -->
    <div
      v-else-if="!src"
      class="flex h-full w-full items-center justify-center text-gray-500"
    >
      请输入 iframe 的地址
    </div>
  </div>
</template>

<style scoped>
.keep-alive-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
<style>
/* 全局样式 - iframe 隐藏 */
iframe.keep-alive-frame.is-hidden {
  visibility: hidden !important;
  pointer-events: none !important;
}
</style>
