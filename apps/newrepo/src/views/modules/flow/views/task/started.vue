<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { CopyOutlined, FundViewOutlined } from '@ant-design/icons-vue';
import { Button, Card, Table, TableColumn, Tag } from 'ant-design-vue';

import { copyToBoard } from '#/utils/flow/objutil';
import { queryMineStarted } from '#/views/modules/flow/api/task';

import pagination from '../../components/pagination.vue';
import TaskHandle from '../../components/task/handler/task.vue';

// function stop({ processInstanceId }: any) {
//   stopProcessInstance(processInstanceId).then(() => {
//     handleQuery();
//   });
// }

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: 10,
});

const roleList = ref();

const currentData = ref();
/**
 * 点击开始处理
 * @param row
 */
const deal = (row) => {
  currentData.value = row;

  taskHandler.value.deal(row);
};

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  queryMineStarted(queryParams)
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

const taskHandler = ref();
onMounted(() => {
  handleQuery();
});

// 流程编码的表格宽度
const processInstanceBizCodeWidth = ref(200);
const copy = (value) => {
  copyToBoard(value);
};
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
        <TableColumn title="流程" data-index="name" min-width="200" />
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

        <TableColumn title="发起时间" data-index="createTime" width="180" />
        <TableColumn title="结束时间" data-index="endTime" width="180" />
        <TableColumn title="状态" data-index="taskCreateTime" width="100">
          <template #default="scope">
            <Tag v-if="scope.record.status === 1" color="success">进行中</Tag>
            <Tag v-else-if="scope.record.status === 3" color="error">
              已撤销
            </Tag>
            <Tag v-else>已结束</Tag>
          </template>
        </TableColumn>
        <TableColumn title="审批结果" data-index="taskCreateTime" width="100">
          <template #default="scope">
            <Tag v-if="scope.record.result === 1" color="success">同意</Tag>
            <Tag v-else-if="scope.record.result === 2" color="error">
              拒绝
            </Tag>
            <Tag v-else-if="scope.record.result === 3" color="warning">
              撤销
            </Tag>
          </template>
        </TableColumn>

        <TableColumn width="100" fixed="right" title="操作">
          <template #default="scope">
            <Button type="link" size="small" @click="deal(scope.record)">
              <FundViewOutlined />
              查看
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

    <!--			查看流程图-->
    <!--    <view-process-instance-image />-->
  </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/flow/common';

.f11 {
  width: 70px;
}

.f22 {
  width: calc(100% - 70px);
}

.iconclass {
  position: absolute;
  top: 0;
  right: 10px;
  width: 80px;
  height: 64px;
}
</style>
