<script setup lang="ts">
interface Props {
  /**
   * @zh_CN 是否收起文本
   */
  collapsed?: boolean;
  /**
   * @zh_CN Logo 跳转地址
   */
  href?: string;
  /**
   * @zh_CN Logo 图片大小
   */
  logoSize?: number;
  /**
   * @zh_CN 组件所在位置
   */
  place?: 'header' | 'sidebar';
  /**
   * @zh_CN Logo 图标
   */
  src?: string;
  /**
   * @zh_CN Logo 文本
   */
  text: string;
  /**
   * @zh_CN Logo 主题
   */
  theme?: string;
}

defineOptions({
  name: 'VbenLogo',
});

withDefaults(defineProps<Props>(), {
  collapsed: false,
  href: 'javascript:void 0',
  logoSize: 24,
  src: '',
  theme: 'light',
  place: 'header',
});
</script>

<template>
  <div :class="theme" class="flex h-full items-center text-lg">
    <a
      :class="$attrs.class"
      :href="href"
      class="flex h-full items-center gap-2 overflow-hidden px-3 text-lg leading-normal transition-all duration-500"
    >
      <img
        v-if="src"
        :alt="text"
        :src="src"
        :style="{ height: `${logoSize}px` }"
        class="relative rounded-none bg-transparent"
      />
      <template v-if="!collapsed">
        <slot name="text">
          <span
            class="dark:text-foreground truncate text-nowrap font-semibold"
            :class="[
              place === 'header'
                ? 'text-[hsl(var(--header-foreground))]'
                : 'text-[hsl(var(--sidebar-foreground))]',
            ]"
          >
            {{ text }}
          </span>
        </slot>
      </template>
    </a>
  </div>
</template>
