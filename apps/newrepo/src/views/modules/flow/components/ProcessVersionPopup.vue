<script setup lang="ts">
import { defineEmits, defineExpose, ref, watch } from 'vue';

import {
  Button,
  message,
  Modal,
  Table,
  TableColumn,
  Tag,
} from 'ant-design-vue';

// import { Position } from '@vben/chc-icons';
import {
  getListByUniqueId,
  setMainProcess,
} from '#/views/modules/flow/api/flow';

const emit = defineEmits(['closeDialogEvent']);
const dialogTableVisible = ref(false);
const uniqueId = ref();
const show = (uid) => {
  uniqueId.value = uid;

  handleQuery(() => {
    dialogTableVisible.value = true;
  });
};
// 查询数据
function handleQuery(f) {
  getListByUniqueId(uniqueId.value).then((data) => {
    gridData.value = data;

    if (f) {
      f();
    }
  });
}

// 设置主流程
function setMainProcessFunc(item: any) {
  setMainProcess(item.flowId).then(() => {
    message.success('操作成功');
    handleQuery();
  });
}

const gridData = ref([]);

defineExpose({ show });

function closedEvent() {
  emit('closeDialogEvent');
}

watch(
  () => dialogTableVisible.value,
  (visible) => {
    if (!visible) {
      closedEvent();
    }
  },
);
</script>

<template>
  <Modal v-model:open="dialogTableVisible" title="版本管理" width="800px">
    <div>
      <Table :data-source="gridData">
        <TableColumn data-index="name" title="流程名称" min-width="200" />
        <TableColumn
          title="流程版本"
          data-index="taskCreateTime"
          min-width="200"
        >
          <template #default="scope"> V:{{ scope.record.version }} </template>
        </TableColumn>
        <TableColumn title="主版本" data-index="taskCreateTime" min-width="200">
          <template #default="scope">
            <Tag v-if="scope.record.isStop" color="error">否</Tag>
            <Tag v-else color="processing">是</Tag>
          </template>
        </TableColumn>
        <TableColumn data-index="createTime" title="创建时间" width="200" />
        <TableColumn width="200" fixed="right" title="操作">
          <template #default="scope">
            <Button
              :disabled="!scope.record.isStop"
              type="link"
              size="small"
              @click="setMainProcessFunc(scope.record)"
            >
              <!--              <icon><Position /></icon>-->

              设为主版本
            </Button>
          </template>
        </TableColumn>
      </Table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <Button @click="dialogTableVisible = false">关闭</Button>
      </span>
    </template>
  </Modal>
</template>

<style scoped lang="less"></style>
