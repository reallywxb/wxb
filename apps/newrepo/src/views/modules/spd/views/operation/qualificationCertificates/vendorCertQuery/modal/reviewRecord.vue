<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import detailView from './productDetail.vue';

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
          field: 'certType',
          minWidth: 100,
          title: '证照类型',
          sortable: false,
        },
        {
          field: 'certNo',
          minWidth: 100,
          title: '证照号',
          sortable: false,
        },
        {
          field: 'certDate',
          minWidth: 100,
          title: '开始时间',
          sortable: false,
        },
        {
          field: 'certValidTo',
          minWidth: 100,
          title: '有效期至',
          sortable: false,
        },
        {
          field: 'validityType',
          title: '是否长期',
          width: '70',
          sortable: false,
          formatter: ({ row }: any) => {
            const validityTypeMap: Record<string, string> = {
              R: '否',
              L: '是',
            };
            return validityTypeMap[row.validityType] || '';
          },
        },
        {
          field: 'checkUser',
          minWidth: 100,
          title: '审核人',
          sortable: false,
        },
        {
          field: 'checkTime',
          minWidth: 150,
          title: '审核时间',
          sortable: false,
        },
        {
          field: 'bpartnerName',
          minWidth: 100,
          title: '供应商',
          sortable: true,
        },
        {
          field: 'statusName',
          minWidth: 100,
          title: '状态',
          sortable: true,
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
      '/productCertAction/querySyncApply.do?page=Product&isShowLogs=Y',
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

const hanldeDetailView = (row: any) => {
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
            data-testid="button_viewDetail_reviewRecord"
          >
            查看详情
          </Button>
        </template>
      </ChcGrid>
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss"></style>
