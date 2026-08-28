<script lang="ts" setup>
import { Maximize, Minimize } from '@vben-core/icons';

import { useFullscreen } from '@vueuse/core';

import { VbenIconButton } from '../button';

defineOptions({ name: 'FullScreen' });

const { isFullscreen, toggle } = useFullscreen();

// 重新检查-全屏状态
isFullscreen.value = !!(
  document.fullscreenElement ||
  // @ts-ignore
  document.webkitFullscreenElement ||
  // @ts-ignore
  document.mozFullScreenElement ||
  // @ts-ignore
  document.msFullscreenElement
);
</script>
<template>
  <VbenIconButton
    @click="toggle"
    class="dark:hover:bg-accent dark:hover:text-accent-foreground dark:text-foreground bg-[hsl(var(--header))] text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header-accent-hover))] hover:text-[hsl(var(--header-accent-foreground))]"
  >
    <Minimize v-if="isFullscreen" class="size-4" />
    <Maximize v-else class="size-4" />
  </VbenIconButton>
</template>
