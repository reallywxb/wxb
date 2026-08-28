<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { Button, Input } from 'ant-design-vue';
import { useSpdGrid } from '#/components/spd';

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

      searchForm.value.settlementId = modalData.settlementId;
      searchForm.value.settlementlineId = modalData.settlementLineId;
      // ChcGridApi.query();
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
  settlementId: undefined,
  settlementlineId: undefined,
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
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'movementDate',
        title: '出入库时间',
        width: '130',
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出入库单号',
        width: '110',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名',
        width: '110',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '110',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '110',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '110',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '科室',
        width: '120',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '140',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        width: '81',
        sortable: true,
      },
      {
        field: 'packageNo',
        title: '包装号',
        width: '100',
        sortable: true,
      },
      {
        field: 'serNo',
        title: '厂家码',
        width: '100',
        sortable: true,
      },
      {
        field: 'patientname',
        title: '患者姓名',
        width: '100',
        sortable: true,
      },
      {
        field: 'patientVisitCode',
        title: '患者编号',
        width: '100',
        sortable: true,
      },
      {
        field: 'indicatedoctorName',
        title: '主刀医生',
        width: '100',
        sortable: true,
      },
      {
        field: 'completeUserName',
        title: '发货人',
        width: '110',
        sortable: true,
      },
      {
        field: 'settlementLineId',
        title: '结算行号',
        width: '110',
        sortable: true,
      },
    ],
    dataTableId: '/settlementAction/queryLineDetail.do',
    tableSearchExtraParams: searchForm.value,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[50%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="结算明细"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
