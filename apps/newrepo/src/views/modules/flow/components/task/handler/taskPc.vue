<script setup lang="ts">
import { onMounted, ref } from 'vue';

import TaskUIHandle from './taskUiPc.vue';

const emit = defineEmits(['taskSubmitEvent']);

/**
 * 点击开始处理
 */
const deal = (row: any) => {
  taskUiHandler.value.deal(
    row.taskId,
    row.processInstanceId,
    row.flowId,
    row.ccId,
    row.nodeId,
  );
};

defineExpose({ deal });

const taskSubmitEvent = () => {
  emit('taskSubmitEvent');
};

onMounted(() => {});
const taskUiHandler = ref();
</script>

<template>
  <div>
    <TaskUIHandle @task-submit-event="taskSubmitEvent" ref="taskUiHandler" />
  </div>
</template>
<style scoped lang="less"></style>
