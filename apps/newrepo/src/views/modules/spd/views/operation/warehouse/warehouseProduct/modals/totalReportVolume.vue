<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

const data = ref();
const title = ref('查看');

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        {
          title: '序号',
          type: 'seq',
          width: 40,
          align: 'center',
          sortable: true,
        },

        {
          field: 'created',
          minWidth: 140,
          title: '时间',
          sortable: false,
        },
        {
          field: 'realName',
          minWidth: 100,
          title: '操作人',
          sortable: false,
        },

        {
          field: 'oldValue',
          minWidth: 120,
          title: '原值',
          sortable: false,
        },
        {
          field: 'newValue',
          minWidth: 120,
          title: '新值',
          sortable: false,
        },
        {
          field: 'changeValue',
          minWidth: 120,
          title: '变化',
          sortable: false,
          formatter: (row: any) => {
            return row.newValue - row.oldValue;
          },
        },
        {
          field: 'description',
          title: '描述',
          width: '260',
          sort: false,
        },
      ],
      proxyConfig: {
        autoLoad: true,
      },
    },
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    dataTableId: '/warehouseAction/queryReplenishLog.do',
    id: 'totalReportVolumeTable',
    tableSearchExtraParams: {
      columnName: 'ReportDrugQty',
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },

  showConfirmButton: false,
  showCancelButton: false,

  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      title.value = data.value.modalTitle;
      await nextTick();
      setTimeout(() => {
        chcGridApi.query({
          replenishId: data.value.replenishId,
        });
      }, 200);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst class="h-[600px] w-[800px]" confirm-text="确定" :title="title">
    <div class="h-full">
      <ChcGrid />
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
