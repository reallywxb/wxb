<script setup lang="ts">
import type { FormVO } from '#/views/modules/flow/api/form/types';

import { ref } from 'vue';

import { startFlow } from '#/views/modules/flow/api/flow';

import StartFlowUi from './startFlowUI.vue';

const currentOpenFlow = ref<FormVO[]>([]);

const handle = (row) => {
  currentOpenFlow.value = row;

  startProcess(row);
};

defineExpose({ handle });

const startFlowUiRef = ref();

const startProcess = (f) => {
  startFlowUiRef.value.handle(
    f.flowId,
    undefined,
    f.processInstanceId,
    f.uniqueId,
  );
};

const submitProcess = (data) => {
  startFlow(data).then((res) => {
    startFlowUiRef.value.complete(res);
  });
};
</script>

<template>
  <div>
    <StartFlowUi @complete="submitProcess" ref="startFlowUiRef" />
  </div>
</template>

<style scoped lang="less"></style>
