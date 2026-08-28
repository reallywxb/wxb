<script setup lang="ts">
import { defineExpose, ref } from 'vue';

import {
  ArrowDownOutlined,
  CloseOutlined,
  SelectOutlined,
} from '@ant-design/icons-vue';
import { Button, Dropdown, Menu, MenuItem } from 'ant-design-vue';

import { queryTaskOperData } from '#/views/modules/flow/api/base';

import AgreeHandle from '../handler/agree.vue';
import RefuseHandle from '../handler/refuse.vue';

const emit = defineEmits(['taskSubmitEvent', 'validateForm']);

defineExpose({ handle });

// 是否是委派任务
const delegationTask = ref(false);

const taskId = ref();
const processInstanceId = ref();

const taskExist = ref(false);

function handle(tId) {
  if (!tId || tId.length === 0) {
    return;
  }
  taskId.value = tId;

  queryTaskOperData(tId).then((data) => {
    processInstanceId.value = data.processInstanceId;

    nodeId.value = data.nodeId;
    needSignature.value = data.needSignature;
    delegationTask.value = data.frontJoinTask;
    taskExist.value = data.taskExist;
    process.value = data.process;
    const node = data.node;
    if (node?.operList) {
      operList.value = node.operList.filter((k) => k.checked);
    }
  });
}

const nodeId = ref();
const needSignature = ref(false);
const process = ref();

/**
 * 提交任务
 */
const submitTask = (name, fv) => {
  agreeHandler.value.handle(
    processInstanceId.value,
    taskId.value,
    fv,
    delegationTask.value,
    name,
    needSignature.value,
  );
};

/**
 * 拒绝任务
 */
const refuseTask = (name, fv) => {
  refuseHandler.value.handle(
    processInstanceId.value,
    taskId.value,
    fv,
    name,
    needSignature.value,
  );
};

const operList = ref([]);
const executeOperMethod = (op) => {
  emit('validateForm', op, (valid, fv) => {
    if (valid) {
      const name = operList.value.find((res) => res.key === op).name;

      if (op === 'refuse') {
        refuseTask(name, fv);
        return;
      }
      if (op === 'pass') {
        submitTask(name, fv);
      }
    }
  });
};
const taskSubmitEvent = () => {
  emit('taskSubmitEvent');
};

const agreeHandler = ref();
const refuseHandler = ref();
</script>

<template>
  <div>
    <!--			同意提交处理-->
    <AgreeHandle @task-submit-event="taskSubmitEvent" ref="agreeHandler" />
    <!--			拒绝审核处理-->
    <RefuseHandle @task-submit-event="taskSubmitEvent" ref="refuseHandler" />

    <div style="flex: auto" v-if="taskExist">
      <template v-if="delegationTask">
        <Button size="large" type="primary" @click="executeOperMethod('pass')">
          <SelectOutlined />
          提交
        </Button>
      </template>
      <template v-else>
        <template v-if="operList.length > 2">
          <Dropdown style="margin-right: 20px">
            <Button>
              更多
              <ArrowDownOutlined class="el-icon--right" />
            </Button>
            <template #overlay>
              <Menu @click="executeOperMethod">
                <template v-for="(item, index) in operList">
                  <MenuItem :key="item.key" v-if="index > 1">
                    <template #icon>
                      <Component :is="item.icon" />
                    </template>
                    {{ item.name }}
                  </MenuItem>
                </template>
              </Menu>
            </template>
          </Dropdown>

          <template v-for="(item, index) in operList">
            <!--									{{item}}-->
            <Button
              :key="item.key"
              v-if="index <= 1"
              :type="item.type"
              @click="executeOperMethod(item.key)"
            >
              <SelectOutlined v-if="item.key === 'pass'" />
              <CloseOutlined v-else-if="item.key === 'refuse'" />
              {{ item.name }}
            </Button>
          </template>
        </template>

        <template v-else>
          <template v-for="item in operList" :key="item.key">
            <Button
              v-if="item.type === 'danger'"
              danger
              @click="executeOperMethod(item.key)"
            >
              <SelectOutlined v-if="item.key === 'pass'" />
              <CloseOutlined v-else-if="item.key === 'refuse'" />
              {{ item.name }}
            </Button>
            <Button
              v-else
              :type="item.type"
              @click="executeOperMethod(item.key)"
            >
              <SelectOutlined v-if="item.key === 'pass'" />
              <CloseOutlined v-else-if="item.key === 'refuse'" />
              {{ item.name }}
            </Button>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
