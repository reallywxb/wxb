<script setup lang="ts">
import { computed, ref } from 'vue';

import { Paintbrush } from '@vben/icons';
import { $t } from '@vben/locales';
import { convertToHsl, TinyColor } from '@vben/utils';

import { useThrottleFn } from '@vueuse/core';

defineOptions({
  name: 'PreferenceHeaderSidebarColors',
});

const headerAndSidebarColorInput = ref();
const headerColorInput = ref();
const sidebarColorInput = ref();

const themeHeaderColor = defineModel<string>('themeHeaderColor');
const themeSidebarColor = defineModel<string>('themeSidebarColor');

const updateHeaderColor = useThrottleFn(
  (value: string) => {
    themeHeaderColor.value = value;
  },
  300,
  true,
  true,
);

const updateSidebarColor = useThrottleFn(
  (value: string) => {
    themeSidebarColor.value = value;
  },
  300,
  true,
  true,
);

const headerInputValue = computed(() => {
  return new TinyColor(themeHeaderColor.value || '').toHexString();
});

const sidebarInputValue = computed(() => {
  return new TinyColor(themeSidebarColor.value || '').toHexString();
});
function handleHeaderAndSidebarInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  updateHeaderColor(convertToHsl(target.value));
  updateSidebarColor(convertToHsl(target.value));
}
function handleHeaderInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  updateHeaderColor(convertToHsl(target.value));
}

function handleSidebarInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  updateSidebarColor(convertToHsl(target.value));
}
function selectHeaderAndSidebarColor() {
  headerAndSidebarColorInput.value?.click?.();
}

function selectHeaderColor() {
  headerColorInput.value?.click?.();
}

function selectSidebarColor() {
  sidebarColorInput.value?.click?.();
}

// function resetToDefault() {
//   // 重置为CSS变量默认值
//   themeHeaderColor.value = 'hsl(var(--header))';
//   themeSidebarColor.value = 'hsl(var(--sidebar))';
// }
</script>

<template>
  <div class="w-full space-y-4">
    <!-- <div class="flex items-center justify-between">
      <div class="text-sm font-medium">
        {{ $t('preferences.theme.headerAndSidebar.title') }}
      </div>
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground text-xs"
        @click="resetToDefault"
      >
        {{ $t('preferences.reset') }}
      </button>
    </div> -->
    <div class="space-y-2">
      <!-- <div class="text-muted-foreground text-xs">
        {{ $t('preferences.theme.headerAndSidebar.headerAndSidebarColor') }}
      </div> -->
      <div
        class="outline-box flex-center group cursor-pointer"
        @click.stop="selectHeaderAndSidebarColor"
      >
        <div class="flex size-full justify-center px-10 py-3">
          <div class="flex-center relative size-6 rounded-sm">
            <Paintbrush
              class="absolute z-10 size-5 opacity-60 group-hover:opacity-100"
            />
            <input
              ref="headerAndSidebarColorInput"
              class="absolute inset-0 opacity-0"
              type="color"
              @input="handleHeaderAndSidebarInputChange"
            />
          </div>
        </div>
      </div>
      <!-- <div class="flex items-center justify-between">
        <div class="text-muted-foreground truncate text-xs">
          {{ headerInputValue }}
        </div>
        <div
          class="size-4 rounded border"
          :style="{ backgroundColor: headerInputValue }"
        ></div>
      </div> -->
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- 顶栏颜色选择器 -->
      <div class="space-y-2">
        <div class="text-muted-foreground text-xs">
          {{ $t('preferences.theme.headerAndSidebar.headerColor') }}
        </div>
        <div
          class="outline-box flex-center group cursor-pointer"
          @click.stop="selectHeaderColor"
        >
          <div class="flex size-full justify-center px-10 py-3">
            <div class="flex-center relative size-6 rounded-sm">
              <Paintbrush
                class="absolute z-10 size-5 opacity-60 group-hover:opacity-100"
              />
              <input
                ref="headerColorInput"
                :value="headerInputValue"
                class="absolute inset-0 opacity-0"
                type="color"
                @input="handleHeaderInputChange"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-muted-foreground truncate text-xs">
            {{ headerInputValue }}
          </div>
          <div
            class="size-4 rounded border"
            :style="{ backgroundColor: headerInputValue }"
          ></div>
        </div>
      </div>

      <!-- 侧边栏颜色选择器 -->
      <div class="space-y-2">
        <div class="text-muted-foreground text-xs">
          {{ $t('preferences.theme.headerAndSidebar.sidebarColor') }}
        </div>
        <div
          class="outline-box flex-center group cursor-pointer"
          @click.stop="selectSidebarColor"
        >
          <div class="flex size-full justify-center px-10 py-3">
            <div class="flex-center relative size-6 rounded-sm">
              <Paintbrush
                class="absolute z-10 size-5 opacity-60 group-hover:opacity-100"
              />
              <input
                ref="sidebarColorInput"
                :value="sidebarInputValue"
                class="absolute inset-0 opacity-0"
                type="color"
                @input="handleSidebarInputChange"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-muted-foreground truncate text-xs">
            {{ sidebarInputValue }}
          </div>
          <div
            class="size-4 rounded border"
            :style="{ backgroundColor: sidebarInputValue }"
          ></div>
        </div>
      </div>
    </div>

    <!-- <div class="text-muted-foreground text-xs">
      {{ $t('preferences.theme.headerAndSidebar.description') }}
    </div> -->
  </div>
</template>
