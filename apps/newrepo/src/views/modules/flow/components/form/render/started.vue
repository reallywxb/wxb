<script setup lang="ts">
import { defineExpose, onMounted, reactive, ref, watch } from 'vue';

import { Table, TableColumn, Tag } from 'ant-design-vue';

import { queryMineStarted } from '#/views/modules/flow/api/task';

import pagination from '../../pagination.vue';

const props = defineProps({
  flowIdList: {
    type: Array,
    default: () => [],
  },
  itemList: {
    type: Array,
    default: () => [],
  },
});

const loading = ref(false);
const total = ref(0);
const roleList = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  flowIdList: props.flowIdList,
});

const multipleSelection = ref([]);
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};
const dataTableRef = ref();

const clear = () => {
  dataTableRef.value!.clearSelection();
};

const getData = () => {
  const value = multipleSelection.value;
  const arr = [];
  for (const it of value) {
    arr.push({
      processInstanceId: it.processInstanceId,
      processName: it.name,
      flowId: it.flowId,
    });
  }
  return arr;
};

watch(
  () => props.itemList,
  (v) => {
    const map = new Set(v.map((w) => w.processInstanceId));
    // dataTableRef.value!.clearSelection();

    for (const it of roleList.value) {
      if (map.has(it.processInstanceId)) {
        // dataTableRef.value!.toggleRowSelection(it,true);
      }
    }
  },
);

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  queryMineStarted(queryParams)
    .then((data) => {
      roleList.value = data.records;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  handleQuery();
});

defineExpose({ clear, getData });
</script>

<template>
  <div>
    <Table
      ref="dataTableRef"
      :loading="loading"
      :data-source="roleList"
      highlight-current-row
      border
      :row-selection="{
        onChange: (selectedRowKeys: string[], selectedRows: any[]) =>
          handleSelectionChange(selectedRows),
      }"
    >
      <TableColumn type="selection" width="55" />
      <TableColumn title="分组" data-index="groupName" width="100" />
      <TableColumn title="流程" data-index="name" width="200" />
      <TableColumn title="发起时间" data-index="createTime" width="200" />
      <TableColumn title="结束时间" data-index="endTime" width="200" />
      <TableColumn title="状态" data-index="taskCreateTime" width="100">
        <template #default="scope">
          <Tag v-if="scope.record.status === 1" color="success">进行中</Tag>
          <Tag v-else-if="scope.record.status === 3" color="error">已撤销</Tag>
          <Tag v-else>已结束</Tag>
        </template>
      </TableColumn>
      <TableColumn title="审批结果" data-index="taskCreateTime" width="100">
        <template #default="scope">
          <Tag v-if="scope.record.result === 1" color="success">同意</Tag>
          <Tag v-else-if="scope.record.result === 2" color="error">拒绝</Tag>
          <Tag v-else-if="scope.record.result === 3" color="warning">撤销</Tag>
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
  </div>
</template>
