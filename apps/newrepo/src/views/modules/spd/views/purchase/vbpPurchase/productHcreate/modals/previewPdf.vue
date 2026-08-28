<script setup lang="ts">
withDefaults(
  defineProps<{
    url: string;
  }>(),
  {
    url: '',
  },
);
</script>
<template>
  <div class="preview-image">
    <iframe :src="url" frameborder="0" height="100%" width="100%"></iframe>
  </div>
</template>
<style scoped>
.preview-image {
  width: 100%;
  height: 100%;
  background-color: skyblue;
}
</style>
