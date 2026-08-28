<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSpdGrid } from '#/components/spd';
const props = withDefaults(
  defineProps<{
    extraParams?: Record<string, any>;
  }>(),
  {
    extraParams: () => ({}),
  },
);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'Type',
        minWidth: 60,
        sortable: true,
        title: '操作',
      },
      {
        field: 'ColumnName',
        minWidth: 80,
        sortable: true,
        title: '列',
      },
      {
        field: 'OldValue',
        minWidth: 100,
        sortable: true,
        title: '旧值',
        align: 'right',
      },
      {
        field: 'NewValue',
        minWidth: 120,
        sortable: true,
        title: '新值',
        align: 'right',
      },
      {
        field: 'UpdatedBy',
        minWidth: 100,
        sortable: true,
        title: '操作人',
      },
      {
        field: 'Updated',
        minWidth: 180,
        sortable: true,
        title: '操作时间',
      },
      {
        field: 'Remote_Addr',
        minWidth: 100,
        sortable: true,
        title: '远程地址',
      },
      {
        field: 'Remote_Host',
        minWidth: 100,
        sortable: true,
        title: '远程主机',
      },
      {
        field: 'TableName',
        minWidth: 110,
        sortable: true,
        title: '表',
      },
      {
        field: 'Record_ID',
        minWidth: 135,
        sortable: true,
        title: '单据ID',
      },
    ],
    dataTableId: '/changeLogHandleAction/queryChangeLog.do',
    id: 'actionLog',
    tableSearchExtraParams: props.extraParams,
  },
);
onMounted(() => {
  console.log('props.extraParams', props.extraParams);

  ChcGridApi.query();
});
const batchAddGridApi = computed(() => {
  return ChcGridApi.grid;
});

defineExpose({
  gridApi: batchAddGridApi,
});
</script>
<template>
  <div class="h-full">
    <ChcGrid> </ChcGrid>
  </div>
</template>
<style scoped></style>
