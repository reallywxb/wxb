<script setup lang="ts">
import { Button } from 'ant-design-vue';

const emit = defineEmits(['submit']);
function handleTakePhoto() {
  emit('submit', 'takePhoto');
}
function handleChooseFile() {
  emit('submit', 'chooseFile');
}
</script>
<template>
  <div>
    <h2 class="mb-[20px] text-2xl font-[700]">请选择上传方式</h2>
    <Button type="primary" @click="handleChooseFile">选择文件</Button>
    <Button class="ml-[12px]" type="primary" @click="handleTakePhoto">
      拍照上传
    </Button>
  </div>
</template>
<style scoped></style>
