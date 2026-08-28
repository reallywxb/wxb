<script setup lang="ts">
import type { RoleQuery } from '#/views/modules/flow/api/role/types';

import { computed, onMounted, reactive, ref } from 'vue';

import { CopyOutlined, FundViewOutlined } from '@ant-design/icons-vue';
import {
  Avatar,
  Button,
  Card,
  Drawer,
  Table,
  TableColumn,
} from 'ant-design-vue';

import { copyToBoard } from '#/utils/flow/objutil';
import { queryMineCC } from '#/views/modules/flow/api/processInstance';

import FlowNodeFormat from '../../components/flow/FlowNodeFormatData.vue';
import FormRender from '../../components/form/render/FormRender.vue';
import pagination from '../../components/pagination.vue';
import TaskHandle from '../../components/task/handler/task.vue';

const rightDrawerVisible = ref(false);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
});

const roleList = ref();

const currentData = ref();

const taskHandler = ref();
// 流程编码的表格宽度
const processInstanceBizCodeWidth = ref(200);

/**
 * 点击开始处理
 * @param row
 */
const deal = (row) => {
  currentData.value = row;
  taskHandler.value.deal({
    ccId: row.id,
    flowId: row.flowId,
    processInstanceId: row.processInstanceId,
  });
};
const currentDetailData = ref();

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  queryMineCC(queryParams)
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

// const taskSubmitEvent = () => {
//   rightDrawerVisible.value = false;
//   handleQuery();
// };

const copy = (value) => {
  copyToBoard(value);
};

onMounted(() => {
  handleQuery();
});

const formValue = computed(() => {
  const obj = {};

  for (const item of currentDetailData.value.formItems) {
    obj[item.id] = item.props.value;
  }
  return obj;
});
</script>

<template>
  <div class="app-container">
    <Card>
      <Table
        :loading="loading"
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
        <TableColumn title="发起人" data-index="startUserName" width="150" />
        <TableColumn title="发起时间" data-index="startTime" width="180" />
        <TableColumn title="节点" data-index="nodeName" width="200" />
        <TableColumn title="抄送时间" data-index="nodeTime" width="180" />

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
    <!--			右侧抽屉-->
    <Drawer v-model:open="rightDrawerVisible" size="400px">
      <template #title>
        <b class="replace-el-text large info">流程详情</b>
      </template>
      <Card style="margin-bottom: 20px">
        <div style="position: relative">
          <div style="display: flex; flex-direction: row">
            <div class="f11">
              <Avatar
                shape="square"
                :size="50"
                :src="currentDetailData.starterAvatarUrl"
              >
                {{ currentDetailData.starterName.substring(0, 1) }}
              </Avatar>
            </div>
            <div class="f22">
              <div>
                <b class="replace-el-text large primary">
                  {{ currentDetailData?.processName }}
                </b>
              </div>
              <div>
                <div class="replace-el-text small">
                  {{ currentDetailData.startTime }}
                </div>
              </div>
            </div>
          </div>
          <img
            v-if="currentDetailData.processInstanceResult === 1"
            class="iconclass"
            src="../../assets/images/pass.png"
          />
          <img
            v-if="currentDetailData.processInstanceResult === 2"
            class="iconclass"
            src="../../assets/images/refuse.png"
          />
          <img
            v-if="currentDetailData.processInstanceResult === 3"
            class="iconclass"
            src="../../assets/images/canceled.png"
          />
        </div>
      </Card>

      <Card class="box-card">
        <FormRender :form-list="currentDetailData.formItems" />
      </Card>
      <FlowNodeFormat
        :disable-select="true"
        :form-data="formValue"
        :process-instance-id="currentData.processInstanceId"
        :flow-id="currentData.flowId"
      />
    </Drawer>
    <TaskHandle ref="taskHandler" @task-submit-event="handleQuery" />
  </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/flow/common';

.iconclass {
  position: absolute;
  top: 0;
  right: 10px;
  width: 64px;
  height: 64px;
}

.f11 {
  width: 70px;
}

.f22 {
  width: calc(100% - 70px);
}
</style>
