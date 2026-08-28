<script setup lang="ts">
defineOptions({
  name: 'RadioBtnGroupSplit',
});
withDefaults(
  defineProps<{
    gap?: string;
    options?: { label: string; value: number | string }[];
    size?: 'default' | 'large' | 'middle' | 'mini' | 'small';
  }>(),
  {
    gap: '4px',
    options: () => [],
    size: 'small',
  },
);
const model = defineModel<number | string>();
</script>
<template>
  <ul class="flex flex-nowrap" :style="{ gap }" v-if="options.length > 0">
    <li
      v-for="item in options"
      :key="item.value"
      class="radioItem"
      @click.stop.prevent="model = item.value"
      :class="model === item.value ? 'active' : ''"
    >
      {{ item.label }}
    </li>
  </ul>
</template>
<style scoped>
.radioItem {
  padding: 3px 8px;
  font-size: 12px;
  color: hsl(var(--foreground));
  cursor: pointer;
  user-select: none;
  list-style: none;
  background-color: hsl(var(--accent-dark));
  border-radius: calc(var(--radius));
}

.radioItem.active:hover {
  background-color: hsl(var(--primary) / 80%);
}

.active {
  font-weight: 700;
  color: hsl(var(--primary-foreground));
  background-color: hsl(var(--primary));
}
</style>
