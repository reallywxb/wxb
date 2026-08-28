<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { useRoute } from 'vue-router';
import { Button, Input } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { deepClone } from '#/utils/util';

// const route = useRoute();

// const urlParams: { [key: string]: any } = route.meta?.urlParams || {}; // 路由给过来的参数
const searchParams = ref({
  productName: undefined,
  value: undefined,
  warehouseId: undefined,
  // limit: 0,
});
const modalOuterData = ref<any>();

// changeLocatorModal
const [ChangeLocatorModal, changeLocatorModalApi] = useVbenModal({
  draggable: true,
  // showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  // footer: false,
  onCancel() {
    changeLocatorModalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onConfirm() {
    const row = chcGridApi.grid.getRadioRecord();
    const params = {
      asnLineId: modalOuterData.value.lineData.asnLineId,
      locatorId: row.id,
    };
    requestFormClient.post('/asnAction/saveAsnLocator.do', params).then(() => {
      // console.log('onConfirm:', row);
      modalOuterData.value.callBack(row);
      changeLocatorModalApi.close();
    });
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = changeLocatorModalApi.getData<any>();
      searchParams.value.value = modalOuterData.value.lineData.locatorName;
      searchParams.value.productName =
        modalOuterData.value.lineData.locatorName;
      searchParams.value.warehouseId =
        modalOuterData.value.lineData.warehouseId;
      setTimeout(() => {
        chcGridApi.query();
      }, 0);
    }
  },
});
const chcGridOption: SchemaColumnAndOptions = {
  gridColumns: [
    {
      type: 'radio',
      width: 50,
      visible: false,
    },
    // {
    //   title: '序号',
    //   width: 50,
    //   align: 'center',
    //   formatter(scope: any) {
    //     return scope.rowIndex + 1;
    //   },
    // },
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
    cellDblclick: ({ column, row }) => {
      if (column.title !== '操作' && column.title !== '序号') {
        console.warn('双击1', row);
        const params = {
          asnLineId: modalOuterData.value.lineData.asnLineId,
          locatorId: row.id,
        };
        requestFormClient
          .post('/asnAction/saveAsnLocator.do', params)
          .then(() => {
            // console.log('onConfirm:', row);
            modalOuterData.value.callBack(row);
            changeLocatorModalApi.close();
          });
      }
    },
  },
  getTableId: () => modalOuterData.value?.tableId,
  tableSearchExtraParams: searchParams.value,
  afterFetchFn: (params) => {
    originRows.value = params.rows.map((item: any) => {
      return deepClone(item);
    });
    return {
      ...params,
      records: params.rows,
    };
  },
  beforeFetchFn: (params) => {
    return {
      ...params,
      start: undefined,
      limit: 0,
    };
  },
  queryUrl: '/warehouseAction/locatorList.do',
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
const originRows = ref<any[]>([]);
const handleSearch = () => {
  searchParams.value.value = searchParams.value.productName;
  // if (searchParams.value.value) {
  // 查询
  chcGridApi.query();
  // }
};
</script>
<template>
  <ChangeLocatorModal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="更改验收货位"
    title-tooltip="更改验收货位"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Input
            v-model:value="searchParams.productName"
            class="mr-[0.5rem] w-[180px]"
            allow-clear
            placeholder="请输入货位名称"
            @keyup.enter="handleSearch"
            data-testid="input_product_name_changeLocatorModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_search_changeLocatorModal"
          >
            搜索
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
  </ChangeLocatorModal>
</template>
