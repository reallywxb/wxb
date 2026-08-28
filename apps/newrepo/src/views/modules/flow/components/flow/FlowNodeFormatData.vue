<script setup lang="ts">
import { defineExpose, onMounted, ref } from 'vue';

import { deepCopy } from '#/utils/flow/objutil';
import { formatStartNodeShow } from '#/views/modules/flow/api/base';

import FlowNodeFormat from './FlowNodeFormat.vue';

const row = ref([]);
const selectUserNodeIdList = ref([]);
const disableSelect = ref(true);

const paramMapData = ref({});

const queryData = (p, fid, pid, tid, f) => {
  const data = {
    flowId: fid,
    processInstanceId: pid,
    paramMap: p,
    taskId: tid,
    from: f,
  };
  paramMapData.value = data;
  refresh();
};

const refresh = () => {
  formatStartNodeShow(paramMapData.value).then((data) => {
    row.value = data.processNodeShowDtoList;
    disableSelect.value = data.disableSelectUser;
    selectUserNodeIdList.value = data.selectUserNodeIdList;
    handleExistNodeUser(row.value);
  });
};

// 处理已经存在的需要选择人员处理节点
function handleExistNodeUser(list) {
  // nodeUser.value={};
  const filter = list
    .filter((res) => res.status === 0)
    .filter((res) => res.selectUser === true)
    .filter((res) => res.type === 1);

  for (const item of filter) {
    const userVoList = deepCopy(item.userVoList);
    if (userVoList && userVoList.length > 0) {
      for (const u of userVoList) {
        u.type = 'user';
      }
      nodeUser.value[item.id] = userVoList;
    }
    item.userVoList = [];
  }
}

onMounted(() => {});

const validate = (op) => {
  if (op !== 'pass') {
    // 只有通过 才校验
    return true;
  }

  return true;
};

const nodeUser = ref({});

const formatSelectNodeUser = () => {
  const obj = {};

  return obj;
};

defineExpose({ validate, refresh, formatSelectNodeUser, queryData });
</script>

<template>
  <FlowNodeFormat
    :row="row"
    :node-user="nodeUser"
    :disable-select="disableSelect"
  />
</template>

<style scoped lang="less"></style>
