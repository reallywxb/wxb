<script setup lang="ts">
import { ChevronsLeft, ChevronsRight } from '@vben-core/icons';

const collapsed = defineModel<boolean>('collapsed');

function handleCollapsed() {
  collapsed.value = !collapsed.value;
}
</script>

<template>
  <div
    class="flex-center dark:hover:text-foreground dark:text-foreground/60 dark:hover:bg-accent-hover dark:bg-accent absolute bottom-2 left-3 z-10 cursor-pointer rounded-sm bg-[hsl(var(--sidebar-accent-hover))] p-1 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent-active))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
    @click.stop="handleCollapsed"
  >
    <ChevronsRight v-if="collapsed" class="size-4" />
    <ChevronsLeft v-else class="size-4" />
  </div>
</template>
