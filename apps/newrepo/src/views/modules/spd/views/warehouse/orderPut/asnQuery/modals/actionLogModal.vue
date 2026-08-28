<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import TemFormModal from './temCheck/FormModal.vue';
import { temFormOptions } from './temCheck/temFormOptions';

const modalOuterData = ref();
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
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      console.warn('onOpenChange2222222222222', modalData.qtyType);
      searchForm.value.asnLineId = modalData.asnLineId;
      searchForm.value.orderLineId = modalData.orderLineId;
      searchForm.value.checkStatus =
        modalOuterData.value.clickType === 'qtyChecked' ? 'Y' : undefined;
      setTimeout(() => {
        ChcGridApi.query();
      }, 500);
      console.warn('onOpenChange333333', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  asnLineId: undefined,
  orderLineId: undefined,
  checkStatus: undefined,
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
        field: 'packageNo',
        minWidth: 80,
        sortable: false,
        title: '包装号',
      },
      {
        field: 'qtyDelivered',
        minWidth: 100,
        sortable: false,
        title: '数量',
        align: 'right',
      },
      {
        field: 'serNo',
        minWidth: 120,
        sortable: false,
        title: '厂家码',
      },
      {
        field: 'checkerName',
        minWidth: 100,
        sortable: false,
        title: '验收人',
      },
      {
        field: 'checkTime',
        minWidth: 180,
        sortable: false,
        title: '验收时间',
      },
      {
        field: 'putawayName',
        minWidth: 100,
        sortable: false,
        title: '上架人',
      },
      {
        field: 'putawayTime',
        minWidth: 100,
        sortable: false,
        title: '上架时间',
      },
      {
        field: 'rejectReasonName',
        minWidth: 100,
        sortable: false,
        title: '拒收原因',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        // visible: detailInfo.value?.type === 'edit',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 110,
      },
    ],
    dataTableId: '/asnAction/queryPackageDetail.do',
    id: 'manualInfoActionLog',
    tableSearchExtraParams: searchForm.value,
  },
);

const [TemCheckFormModal, temModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: TemFormModal,
});

const editManf = (scope: any) => {
  console.warn('editManf', scope.row);
  temModalApi
    .setData({
      formData: {
        packageId: Number(scope.row?.packageId),
        serNo: scope.row?.serNo,
      },
      openType: 'close',
    })
    .open();
};
async function refreshTable() {
  ChcGridApi.query();
}
// function handleSearch() {
//   ChcGridApi.query();
// }
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="配送包装"
    title-tooltip="配送包装列表"
  >
    <div class="h-full">
      <TemCheckFormModal
        :after-submit="refreshTable"
        :add-form-options="temFormOptions"
      />
      <ChcGrid>
        <template #action="scope">
          <Button
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="editManf(scope)"
            :data-testid="`button_editManf_${scope.rowIndex}_actionLogModal`"
          >
            修改厂家码
          </Button>
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>
