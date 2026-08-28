<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button, Modal } from 'ant-design-vue';

import { completeTask } from '#/views/modules/flow/api/task';

import CommentHandle from './components/comment.vue';

const emit = defineEmits(['taskSubmitEvent']);
const dialogVisible = ref(false);

const formValue = ref();
const dialogTitle = ref('');
const processInstanceId = ref('');
const taskId = ref('');
const needSignature = ref(false);

const handle = (pid, tid, formData, dialogTitle1, needSignature1) => {
  dialogTitle.value = dialogTitle1;
  needSignature.value = needSignature1;

  processInstanceId.value = pid;
  taskId.value = tid;

  formValue.value = formData;

  dialogVisible.value = true;
};

defineExpose({ handle });
const loading = ref(false);

const submit = () => {
  loading.value = true;

  let param = {
    paramMap: formValue.value,
    approveResult: false,
    processInstanceId: processInstanceId.value,
    taskId: taskId.value,
  };
  param = { ...param, ...commentContent.value };

  completeTask(param)
    .then(() => {
      dialogVisible.value = false;

      emit('taskSubmitEvent');
    })
    .finally(() => {
      loading.value = false;
    });
};
const dialogClosed = () => {
  commentContent.value = {};
};
const commentContent = ref({});

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
    <Modal v-model:open="dialogVisible" width="400px" destroy-on-close>
      <template #title>
        <div style="font-size: 20px; font-weight: bold; text-align: left">
          {{ dialogTitle }}
        </div>
      </template>
      <CommentHandle :content="commentContent" />

      <template #footer>
        <span class="dialog-footer">
          <Button @click="dialogVisible = false">取消</Button>
          <Button type="primary" :loading="loading" @click="submit">
            确定
          </Button>
        </span>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="less"></style>
