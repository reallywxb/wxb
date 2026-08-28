<script setup lang="ts">
import type { LocationQuery } from 'vue-router';

import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { CopyOutlined, FundViewOutlined } from '@ant-design/icons-vue';
import { Button, Card, Table, TableColumn } from 'ant-design-vue';

import { copyToBoard, isNotBlank } from '#/utils/flow/objutil';
import { getTask, queryMineTask } from '#/views/modules/flow/api/task';

import pagination from '../../components/pagination.vue';
import TaskHandle from '../../components/task/handler/task.vue';

const loading = ref(false);
const total = ref(0);

const copy = (value) => {
  copyToBoard(value);
};

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

const roleList = ref();

const taskHandler = ref();
/**
 * 点击开始处理
 * @param row
 */
const deal = (row) => {
  getTask(row.taskId).then(() => {
    const d = {
      taskId: row.taskId,
      processInstanceId: row.processInstanceId,
      flowId: row.flowId,
    };

    taskHandler.value.deal(d);
  });
};

// 流程编码的表格宽度
const processInstanceBizCodeWidth = ref(200);

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  queryMineTask(queryParams)
    .then((data) => {
      for (const itm of data.records) {
        const number = itm.processInstanceBizCode?.length * 12;
        if (number > processInstanceBizCodeWidth.value) {
          processInstanceBizCodeWidth.value = number;
        }
      }
      roleList.value = data.records;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

const route = useRoute();

onMounted(() => {
  handleQuery();

  const query: LocationQuery = route.query;

  if (isNotBlank(query.taskId)) {
    // 跳转过来的
    deal({ taskId: query.taskId });
  }
});
</script>

<template>
  <div class="app-container">
    <Card shadow="never">
      <Table
        v-loading="loading"
        :data-source="roleList"
        highlight-current-row
        :pagination="false"
      >
        <TableColumn title="分组" data-index="groupName" min-width="100" />
        <TableColumn title="流程" data-index="processName" min-width="200" />
        <TableColumn
          title="编码"
          data-index="processInstanceBizCode"
          :width="processInstanceBizCodeWidth"
        >
          <template #default="scope">
            <div class="replace-el-text primary">
              <CopyOutlined
                @click="copy(scope.record.processInstanceBizCode)"
              />
              {{ scope.record.processInstanceBizCode }}
            </div>
          </template>
        </TableColumn>
        <TableColumn title="发起人" data-index="rootUserName" width="150" />
        <TableColumn title="发起时间" data-index="startTime" width="180" />
        <TableColumn title="当前节点" data-index="taskName" width="150" />
        <TableColumn title="任务时间" data-index="taskCreateTime" width="180" />

        <TableColumn fixed="right" width="100" title="操作">
          <template #default="scope">
            <Button type="link" size="small" @click="deal(scope.record)">
              <FundViewOutlined />
              开始处理
            </Button>
          </template>
        </TableColumn>
      </Table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </Card>
    <TaskHandle ref="taskHandler" @task-submit-event="handleQuery" />
  </div>
</template>
<style lang="scss" scoped>
@use '../../../../../styles/flow/common';
</style>
