<script setup lang="ts">
import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarRootProps,
} from 'radix-vue';

import type { ClassType } from '@vben-core/typings';

import { computed } from 'vue';

import { Avatar, AvatarFallback, AvatarImage } from '../../ui';

interface Props extends AvatarFallbackProps, AvatarImageProps, AvatarRootProps {
  alt?: string;
  class?: ClassType;
  dot?: boolean;
  dotClass?: ClassType;
  size?: number;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  alt: 'avatar',
  as: 'button',
  dot: false,
  dotClass: 'bg-green-500',
  class: '',
  size: 32,
});

const text = computed(() => {
  return props.alt.length > 4 ? props.alt.slice(0, 4) : props.alt;
  // return props.alt.length > 3 ? props.alt.slice(-2) : props.alt;
});

// 根据名字长度动态计算头像大小
const dynamicSize = computed(() => {
  const len = text.value.length;
  if (len <= 2) return props.size;
  if (len <= 3) return props.size + 4;
  if (len <= 4) return props.size + 8;
  return props.size;
});

const rootStyle = computed(() => {
  const size = dynamicSize.value;
  return size > 0
    ? {
        height: `${size}px`,
        width: `${size}px`,
      }
    : {};
});
</script>

<template>
  <div
    :class="props.class"
    :style="rootStyle"
    class="relative flex flex-shrink-0 items-center"
  >
    <Avatar :class="props.class" class="size-full !overflow-visible">
      <AvatarImage :alt="alt" :src="src" />

      <AvatarFallback class="whitespace-nowrap text-xs font-medium">
        {{ text }}
      </AvatarFallback>
    </Avatar>
    <span
      v-if="dot"
      :class="dotClass"
      class="border-background absolute bottom-0 right-0 size-3 rounded-full border-2"
    >
      <!-- <span
      v-if="dot"
      :class="dotClass"
      class="border-background absolute bottom-0 right-0 size-3 rounded-full border-2"
    > -->
    </span>
  </div>
</template>
