<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

const data = ref();
const title = ref('审核记录');

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        {
          title: '序号',
          type: 'seq',
          width: 40,
          align: 'center',
          sortable: false,
          visible: false,
        },
        {
          field: 'productcode',
          width: 120,
          title: '药品编码',
          sortable: true,
        },
        {
          field: 'productName',
          width: 120,
          title: '药品名称',
          sortable: true,
        },
        {
          field: 'productSpec',
          width: 130,
          title: '规格',
          sortable: true,
        },
        {
          field: 'certValidTo',
          width: 130,
          title: '型号',
          sortable: true,
          visible: false,
        },
        {
          field: 'manufacturer',
          width: 130,
          title: '生产企业',
          sortable: true,
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
    dataTableId: '/certAction/queryLinkProduct.do',
    id: 'productQuery_reviewRecord',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return params;
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
      await nextTick();
      console.warn('data.value', data.value);
      setTimeout(() => {
        chcGridApi.query({
          productId: data.value.searchId,
        });
      }, 200);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst class="h-[750px] w-[1050px]" confirm-text="确定" :title="title">
    <div class="h-full">
      <ChcGrid />
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss"></style>
