<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  tabs: { key: string; label: string }[];
}>();

const emit = defineEmits<{
  change: [key: string];
}>();

const activeKey = ref('hospital');

function handleChange(key: string) {
  activeKey.value = key;
  emit('change', key);
}
</script>
<template>
  <div
    class="flex items-center gap-6 border-b border-solid border-[#e5e7eb] bg-[#f1f8ff] px-4"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="border-b-[2px] px-1 py-3 text-[14px] font-[500] transition-colors"
      :class="[
        activeKey === tab.key
          ? 'border-[#1D4ED8] text-[#1D4ED8]'
          : 'border-transparent text-[#6B7280] hover:text-[#1D4ED8]',
      ]"
      @click="handleChange(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
<style scoped></style>
