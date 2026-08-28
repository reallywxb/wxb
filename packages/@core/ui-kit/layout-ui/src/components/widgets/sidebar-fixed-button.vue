<script setup lang="ts">
import { Pin, PinOff } from '@vben-core/icons';

const expandOnHover = defineModel<boolean>('expandOnHover');

function toggleFixed() {
  expandOnHover.value = !expandOnHover.value;
}
</script>

<template>
  <div
    class="flex-center dark:hover:text-foreground dark:text-foreground/60 dark:hover:bg-accent-hover dark:bg-accent absolute bottom-2 right-3 z-10 cursor-pointer rounded-sm bg-[hsl(var(--sidebar-accent-hover))] p-[5px] text-[hsl(var(--sidebar-foreground))] transition-all duration-300 hover:bg-[hsl(var(--sidebar-accent-active))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
    @click="toggleFixed"
  >
    <PinOff v-if="!expandOnHover" class="size-3.5" />
    <Pin v-else class="size-3.5" />
  </div>
</template>
