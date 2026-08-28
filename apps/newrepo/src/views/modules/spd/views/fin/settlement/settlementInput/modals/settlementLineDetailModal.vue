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
      searchForm.value.settlementlineId = modalData.settlementlineId;
      // ChcGridApi.query();
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, modalData);
    }
  },
});
const searchForm = ref({
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
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出入库单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '110',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '科室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '81',
        sortable: true,
        align: 'right',
      },
      {
        field: 'packageNo',
        title: '包装号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'serNo',
        title: '厂家码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'patientname',
        title: '患者姓名',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'patientVisitCode',
        title: '患者编号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'indicatedoctorName',
        title: '主刀医生',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'completeUserName',
        title: '发货人',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'settlementLineId',
        title: '结算行号',
        minWidth: '110',
        sortable: true,
      },
    ],
    id: 'settlementInput_settlementLineDetail',
    dataTableId: '/settlementAction/queryLineDetail.do',
    tableSearchExtraParams: searchForm.value,
  },
);
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="查看"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
