<script lang="ts" setup>
import type { reviewRecordRow } from '../type';

import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import detailView from './detailView.vue';

const data = ref();
const title = ref('审查记录');

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
        },

        {
          field: 'manufacturerName',
          minWidth: 100,
          title: '生产企业',
          sortable: false,
        },
        {
          field: 'authorizeCompanyName',
          minWidth: 100,
          title: '授权企业',
          sortable: false,
        },

        {
          field: 'toAuthorizeCompanyName',
          minWidth: 100,
          title: '被授权企业',
          sortable: true,
        },
        {
          field: 'certDate',
          minWidth: 110,
          title: '开始时间',
          sortable: true,
        },
        {
          field: 'certValidTo',
          minWidth: 110,
          title: '有效期至',
          sortable: true,
        },
        {
          field: 'scope',
          minWidth: 100,
          title: '范围',
          sortable: false,
        },
        {
          field: 'statusName',
          minWidth: 70,
          title: '状态',
          sortable: true,
        },
        {
          field: 'checkUser',
          minWidth: 90,
          title: '审核人',
          sortable: false,
        },
        {
          field: 'checkTime',
          minWidth: 130,
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
      '/productCertAction/querySyncApply.do?page=Authorize&isShowLogs=Y',
    id: 'reviewRecord',
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
  console.warn('row', row);
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
          <div class="checkStyle">
            <Button
              type="primary"
              class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="hanldeDetailView(scope.row)"
              :data-testid="`button_detail_${scope.rowIndex}_reviewRecord`"
            >
              查看详情
            </Button>
          </div>
        </template>
      </ChcGrid>
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
