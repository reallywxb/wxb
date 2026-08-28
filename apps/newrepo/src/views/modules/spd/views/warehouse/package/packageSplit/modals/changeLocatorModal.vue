<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { useSpdGrid } from '#/components/spd';

const searchParams = ref<Record<string, any>>({});
const modalOuterData = ref<any>();
// changeLocatorModal
const [ChangeLocatorModal, changeLocatorModalApi] = useVbenModal({
  draggable: true,
  // showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  onCancel() {
    changeLocatorModalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onConfirm() {
    const row = chcGridApi.grid.getRadioRecord();
    if (isEmpty(row)) {
      changeLocatorModalApi.close();
    } else {
      modalOuterData.value.callBack(row);
      changeLocatorModalApi.close();
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = changeLocatorModalApi.getData<any>();
      searchParams.value = {
        value: modalOuterData.value.rowData.locatorName,
        warehouseId: modalOuterData.value.warehouseId,
        isScatter: 'N',
      };
      setTimeout(() => {
        chcGridApi.query();
      }, 0);
    }
  },
});
const chcGridOption: SchemaColumnAndOptions = {
  queryUrl: '/warehouseAction/locatorList.do',
  getTableId: () => modalOuterData.value?.tableId,
  gridColumns: [
    {
      type: 'radio',
      width: 50,
      align: 'center',
    },
    {
      field: 'id',
      title: '货位ID',
      minWidth: '200',
      sortable: false,
    },
    {
      field: 'name',
      title: '货位名称',
      minWidth: '250',
      sortable: false,
    },
  ],
  autoSelectFirstRow: false,
  gridEvents: {
    radioChange() {},
  },

  tableSearchExtraParams: searchParams.value,
  afterFetchFn: (params) => {
    return {
      ...params,
      records: params.rows,
    };
  },
  beforeFetchFn: () => {
    const p = {
      ...searchParams.value,
      limit: 0,
    };
    return p;
  },
};
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      showDefaultActions: false,
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      wrapperClass: 'grid-cols-2',
    },
    gridOptions: {
      stripe: false,
      pagerConfig: {
        enabled: false,
      },
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        highlight: true,
      },
      align: 'center',
    },
  },
  chcGridOption,
);
</script>
<template>
  <ChangeLocatorModal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="更改货位"
  >
    <div class="h-full">
      <ChcGrid />
    </div>
  </ChangeLocatorModal>
</template>
