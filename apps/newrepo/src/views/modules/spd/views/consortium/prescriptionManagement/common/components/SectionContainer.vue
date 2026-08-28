<script setup lang="ts">
defineOptions({
  name: 'SectionContainer',
});
defineProps({
  title: {
    type: String,
    default: '',
  },
  isShowLine: {
    type: Boolean,
    default: false,
  },
  headerClass: {
    type: String,
    default: 'p-2 pl-0',
  },
  contentClass: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="box-border flex h-full w-full flex-col overflow-hidden">
    <div
      class="box-border flex flex-shrink-0 items-center justify-between"
      :class="headerClass"
    >
      <div class="flex items-center justify-start">
        <div v-if="isShowLine" class="mr-1 box-border h-6 w-1 bg-black"></div>
        <div class="text-base font-semibold text-[rgba(50,57,57,0.88)]">
          {{ title }}
        </div>
        <slot name="titleExtra"></slot>
      </div>
      <slot name="extra"></slot>
    </div>
    <div class="relative box-border min-h-0 flex-1" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>
