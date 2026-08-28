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
      searchForm.value.inoutLineId = modalOuterData.value.inoutLineId;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
    }
  },
});
const searchForm = ref({
  inoutLineId: undefined,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
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
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'parentPackageNo',
        title: '原包装号',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'packageNo',
        title: '包装号',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        visible: false,
        // hidden: true,
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '150',
        sortable: true,
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   // visible: detailInfo.value?.type === 'edit',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: '操作',
      //   width: 110,
      // },
    ],
    queryUrl: '/inoutAction/queryPackages.do',
    id: 'storageOutQueryPackageDetailModal',
    tableSearchExtraParams: searchForm.value,
    beforeFetchFn(params) {
      return {
        ...params,
        start: undefined,
        limit: 0,
      };
    },
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
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    :title="modalOuterData.title || '配送包装'"
    :title-tooltip="modalOuterData.title || '配送包装列表'"
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
