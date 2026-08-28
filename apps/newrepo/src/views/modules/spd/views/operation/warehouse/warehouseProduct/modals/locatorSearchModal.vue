<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input, Switch } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

const emit = defineEmits(['close', 'confirm']);

const modalOuterData = ref();
const searchForm = ref({
  productName: undefined,
});

const extraParams = ref({
  isScatter: 'Y',
  type: 'locator',
  warehouseId: '',
});
const isInit = ref(true);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        pageSize: 25,
        layouts: ['PrevPage', 'Jump', 'PageCount', 'NextPage'],
        size: 'mini',
        simple: true,
      },
    }),
  },
  {
    gridColumns: [
      {
        type: 'radio',
        width: 50,
        fixed: 'left',
        visible: false,
      },
      { field: 'name', title: '货位名称', minWidth: '200', sortable: true },
    ],
    id: 'locatorChooseTable',
    dataTableId: '/warehouseAction/wareLocatorList.do',
    tableSearchExtraParams: searchForm.value,
    beforeFetchFn: (params: any) => {
      return {
        ...params,
        isScatter: extraParams.value.isScatter,
        type: extraParams.value.type,
        warehouseId: extraParams.value.warehouseId || undefined,
      };
    },
    afterFetchFn: (params) => {
      const rows = params.rows || [];

      isInit.value = true;
      if (locatorInfo.value.id) {
        const tableItem = rows.find(
          (item: any) => item.id === Number(locatorInfo.value.id),
        );
        if (tableItem) {
          locatorInfo.value = tableItem;
        } else {
          rows.unshift(locatorInfo.value);
        }
      }
      return {
        ...params,
        records: params.rows,
      };
    },
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        // 如果和当前选中行相同，说明是初始化自动选中，忽略

        if (isInit.value) {
          await ChcGridApi.grid?.clearRadioRow();
          if (locatorInfo.value.id) {
            // setTimeout(() => {
            ChcGridApi.grid?.setRadioRow(locatorInfo.value);
            // }, 2000)
          }
        }
        isInit.value = false;
        if (selectRow.value.id && row?.id === selectRow.value.id) return;
        selectRow.value = row?.id ? row : {};
      },
    },
  },
);

const selectRow = ref<any>({});
const isAutoMove = ref('Y');
const locatorInfo = ref<any>({});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    emit('confirm', {
      ...selectRow.value,
      isAutoMove: isAutoMove.value,
    });
    modalApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    isInit.value = true;
    if (isOpen) {
      selectRow.value = {};
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      // 从父级传入的 warehouseId
      extraParams.value.warehouseId = modalData?.warehouseId || '';
      // 从父级传入的货位信息，用于回显选中
      locatorInfo.value = modalData?.locatorInfo || {};
      isAutoMove.value = modalData?.locatorInfo.isAutoMove || 'Y';
      if (locatorInfo.value.id) {
        selectRow.value = { ...locatorInfo.value };
      }
      setTimeout(() => {
        ChcGridApi.query();
        // 没有货位信息时，清除自动选中的第一行（setRadioRow 在 200ms 后触发）
      }, 0);
    }
  },
});

function handleSearch() {
  ChcGridApi.query();
}
</script>
<template>
  <Modal
    class="h-[600px] w-[400px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="散件货位选择"
  >
    <div class="h-full">
      <div class="h-[450px]">
        <ChcGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="searchForm.productName"
              placeholder="货位名称/编码"
              class="mr-[6px] w-[280px]"
              allow-clear
              @keyup.enter="handleSearch"
              data-testid="input_locatorName_locatorSearchModal"
            />
            <Button
              type="primary"
              @click="handleSearch"
              data-testid="button_search_locatorSearchModal"
            >
              查询
            </Button>
          </template>
        </ChcGrid>
      </div>

      <div class="mt-[10px] flex items-center gap-2 px-2">
        <span class="text-sm">是否移库</span>
        <Switch
          v-model:checked="isAutoMove"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
        />
      </div>
    </div>
  </Modal>
</template>
