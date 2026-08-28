<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

// import EditManfModalComp from './editManfModal.vue';

const modalOuterData = ref<any>({
  title: '',
});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // const modalData = modalApi.getData<any>();
      modalOuterData.value = modalApi.getData<any>();
      searchForm.value.orderId = modalOuterData.value.orderId;
      // searchForm.value.processId = modalOuterData.value.processId;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});
const searchForm = ref({
  orderId: undefined,
  // processId: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      // checkboxConfig: {
      //   checkMethod: (scope: any) => {
      //     return !modalOuterData.value.blackList.includes(
      //       scope.row.productCode,
      //     );
      //   },
      // },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'nodeName',
        title: '审批节点',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'wfstateName',
        title: '审批状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'userName',
        title: '审批人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'updated',
        title: '审批时间',
        minWidth: '130',
        align: 'center',
        sortable: true,
      },
    ],
    dataTableId: 'orderAction/queryActivity.do',
    id: 'manualInfoActionLog',
    tableSearchExtraParams: searchForm.value,
  },
);
// const [EditManfModal, editManfModalApi] = useVbenModal({
//   class: 'w-[500px]',
//   closable: true,
//   // 连接抽离的组件
//   connectedComponent: EditManfModalComp,
// });
// const editManf = (scope: any) => {
//   console.warn('editManf', scope.row);
//   editManfModalApi
//     .setData({
//       formData: {
//         packageId: Number(scope.row?.packageId),
//         serNo: scope.row?.serNo,
//       },
//       openType: 'close',
//     })
//     .open();
// };
// async function refreshTable() {
//   ChcGridApi.query();
// }
// function handleSearch() {
//   ChcGridApi.query();
// }
</script>
<template>
  <Modal
    class="h-[400px] w-[600px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    :title="modalOuterData.title || '配送包装'"
    title-tooltip="配送包装列表"
  >
    <div class="h-full">
      <!-- <EditManfModal :after-submit="refreshTable" /> -->
      <ChcGrid>
        <!-- <template #action="scope">
          <Button
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="editManf(scope)"
          >
            修改厂家码
          </Button>
        </template> -->
      </ChcGrid>
    </div>
  </Modal>
</template>
