<script setup lang="ts">
import { defineExpose, onMounted, reactive, ref } from 'vue';

import { Table, TableColumn, Tag } from 'ant-design-vue';

import { queryMineCCInstance } from '#/views/modules/flow/api/task';
import Pagination from '#/views/modules/flow/components/pagination.vue';

const props = defineProps({
  flowIdList: {
    type: Array,
    default: () => [],
  },
});
onMounted(() => {
  handleQuery();
});
const loading = ref(false);
const total = ref(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  flowIdList: props.flowIdList,
});
const roleList = ref();

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  queryMineCCInstance(queryParams)
    .then((data) => {
      roleList.value = data.records;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
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
      processName: it.processName,
      flowId: it.flowId,
    });
  }
  return arr;
};
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
      <TableColumn title="流程" data-index="processName" width="200" />
      <TableColumn title="发起人" data-index="startUserName" width="150" />
      <TableColumn title="发起时间" data-index="startTime" width="200" />
      <TableColumn title="状态" data-index="taskCreateTime" width="150">
        <template #default="scope">
          <Tag v-if="scope.record.processInstanceStatus === 1" color="success">
            进行中
          </Tag>
          <Tag
            v-else-if="scope.record.processInstanceStatus === 3"
            color="error"
          >
            已撤销
          </Tag>
          <Tag v-else>已结束</Tag>
        </template>
      </TableColumn>
      <TableColumn title="审批结果" data-index="taskCreateTime">
        <template #default="scope">
          <Tag v-if="scope.record.processInstanceResult === 1" color="success">
            同意
          </Tag>
          <Tag
            v-else-if="scope.record.processInstanceResult === 2"
            color="error"
          >
            拒绝
          </Tag>
          <Tag
            v-else-if="scope.record.processInstanceResult === 3"
            color="warning"
          >
            撤销
          </Tag>
        </template>
      </TableColumn>
    </Table>

    <Pagination
      v-if="total > 0"
      v-model:total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handleQuery"
    />
  </div>
</template>

<style scoped lang="less"></style>
