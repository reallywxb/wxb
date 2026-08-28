<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

const props = defineProps<{
  orderData: any;
}>();

const data = ref();
const title = ref('查看');

// const props = defineProps<{
//   rejectOrders: number[];
// }>();

const selectParams = ref({});

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
          field: 'nodeName',
          minWidth: 130,
          title: '审批节点',
          sortable: true,
        },
        {
          field: 'wfstateName',
          minWidth: 130,
          title: '审批状态',
          sortable: true,
        },

        {
          field: 'userName',
          minWidth: 120,
          title: '审批人',
          sortable: true,
        },
        {
          field: 'updated',
          minWidth: 140,
          title: '审批时间',
          sortable: true,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    dataTableId: '/orderAction/queryActivity.do',
    id: 'approvalTable',
    // commonFormOptions,
    // viewFormOptions,

    tableSearchExtraParams: selectParams.value,
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
      await nextTick();
      console.warn('data.value', props.orderData.orderId, chcGridApi);
      selectParams.value = {
        orderId: props.orderData.orderId,
        // processId: props.orderData.processId,
      };
      setTimeout(() => {
        chcGridApi.query({
          orderId: props.orderData.orderId,
          // processId: props.orderData.processId,
        });
      }, 200);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst class="h-[500px] w-[600px]" confirm-text="确定" :title="title">
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
