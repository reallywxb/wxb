<script lang="ts" setup>
import type { reviewRecordRow } from '../type';

import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import detailView from './detailView.vue';

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
          field: 'contractNo',
          minWidth: 100,
          title: '合同号',
          sortable: true,
        },
        {
          field: 'beginDate',
          minWidth: 100,
          title: '开始时间',
          sortable: false,
        },
        {
          field: 'endDate',
          minWidth: 100,
          title: '结束时间',
          sortable: false,
        },
        {
          field: 'scope',
          minWidth: 100,
          title: '范围',
          sortable: false,
        },
        {
          field: 'description',
          minWidth: 100,
          title: '备注',
          sortable: false,
        },
        {
          field: 'statusName',
          minWidth: 80,
          title: '状态',
          sortable: true,
        },
        {
          field: 'checkUser',
          minWidth: 100,
          title: '审核人',
          sortable: true,
        },
        {
          field: 'checkTime',
          minWidth: 150,
          title: '审核时间',
          sortable: false,
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          width: 100,
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
    dataTableId:
      '/productCertAction/querySyncApply.do?page=Contract&isShowLogs=Y',
    id: 'contractQuery_reviewRecord',
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
          searchId: data.value.searchId,
        });
      }, 200);
    }
  },
});

// 查看详情
const [detailViewModal, detailViewModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: detailView,
  draggable: true,
});

const hanldeDetailView = (row: reviewRecordRow) => {
  console.warn('authorizationBook===>row', row);
  detailViewModalApi
    .setData({
      row,
    })
    .open();
};

onMounted(() => {});
</script>
<template>
  <ModalFirst class="h-[750px] w-[1050px]" confirm-text="确定" :title="title">
    <div class="h-full">
      <detailViewModal />
      <ChcGrid>
        <template #action="scope">
          <Button
            type="primary"
            class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="hanldeDetailView(scope.row)"
            :data-testid="`button_review_record_${scope.rowIndex}_reviewRecord`"
          >
            查看详情
          </Button>
        </template>
      </ChcGrid>
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss"></style>
