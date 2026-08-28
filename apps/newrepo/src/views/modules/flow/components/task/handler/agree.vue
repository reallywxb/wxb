<script setup lang="ts">
import { defineExpose, ref, watch } from 'vue';

import { Button, Modal } from 'ant-design-vue';

import { completeTask, resolveTask } from '#/views/modules/flow/api/task';

import CommentHandle from './components/comment.vue';

const emit = defineEmits(['taskSubmitEvent']);

const dialogVisible = ref(false);

const commentContent = ref({});

const frontJoinTask = ref(false);
const needSignature = ref(false);
const formValue = ref();
const dialogTitle = ref('');
const processInstanceId = ref('');
const taskId = ref('');

const handle = (pid, tid, formData, dt, dialogTitle1, needSignature1) => {
  dialogTitle.value = dialogTitle1;
  frontJoinTask.value = dt;
  needSignature.value = needSignature1;

  formValue.value = formData;

  processInstanceId.value = pid;
  taskId.value = tid;

  dialogVisible.value = true;
};

defineExpose({ handle });
const loading = ref(false);

const submit = () => {
  loading.value = true;

  let param = {
    paramMap: formValue.value,
    approveResult: true,
    processInstanceId: processInstanceId.value,
    taskId: taskId.value,
  };
  param = { ...param, ...commentContent.value };

  if (frontJoinTask.value) {
    // 前加签
    resolveTask(param)
      .then(() => {
        dialogVisible.value = false;

        emit('taskSubmitEvent');
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    completeTask(param)
      .then(() => {
        dialogVisible.value = false;

        emit('taskSubmitEvent');
      })
      .finally(() => {
        loading.value = false;
      });
  }
};
const dialogClosed = () => {
  commentContent.value = {};
};

watch(
  () => dialogVisible.value,
  (visible) => {
    if (!visible) {
      dialogClosed();
    }
  },
);
</script>

<template>
  <div>
    <Modal
      v-model:open="dialogVisible"
      :title="dialogTitle"
      width="400px"
      destroy-on-close
    >
      <template #title>
        <div style="font-size: 20px; font-weight: bold; text-align: left">
          {{ dialogTitle }}
        </div>
      </template>

      <CommentHandle :content="commentContent" />

      <template #footer>
        <span class="dialog-footer">
          <Button @click="dialogVisible = false">取消</Button>
          <Button :loading="loading" type="primary" @click="submit">
            确定
          </Button>
        </span>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="less"></style>
