<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useSpdGrid } from '#/components/spd';

const modalOuterData = ref<Record<string, any>>({});

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    },
  },
  {
    gridColumns: [
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
    ],
    queryUrl: '/inoutAction/queryPackages.do',
    id: 'packageDetailModal',
    beforeFetchFn(params) {
      // 申请类型是数组转为字符串
      let queryOrderType = modalOuterData.value?.formValues?.queryOrderType;
      if (
        queryOrderType &&
        Array.isArray(queryOrderType) &&
        queryOrderType.length > 0
      ) {
        queryOrderType = queryOrderType
          .map((val: string) => `'${val}'`)
          .join(',');
      }
      return {
        ...params,
        ...modalOuterData.value?.formValues,
        queryOrderType,
        productId: modalOuterData.value?.row?.productId,
        start: undefined,
        limit: 0,
      };
    },
  },
);
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
      console.log('modalOuterData', modalOuterData.value);
      setTimeout(() => {
        chcGridApi.query();
      }, 200);
    }
  },
});
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="包装明细查看"
  >
    <div class="h-full">
      <ChcGrid> </ChcGrid>
    </div>
  </Modal>
</template>
