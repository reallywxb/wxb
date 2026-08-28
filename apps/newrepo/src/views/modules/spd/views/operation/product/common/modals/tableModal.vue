<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Button, message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

defineOptions({
  name: 'CommonGridModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  disabled?: boolean;
  formSchemas?: Array<any>;
  gridColumns: Array<VbenFormProps>;
}>();

const defaultRowValue = computed(() => {
  const obj = {};

  props.gridColumns
    .filter((column) => column.field)
    .forEach(({ field }) => {
      obj[field] = '';
    });

  return obj;
});
interface Param {
  rows: Array<any>;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
}

const param = ref<Param>();

const gridData = ref([]);

const removedIds = ref([]);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: props.formSchemas?.length
    ? {
        fieldMappingTime: [['date', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
        layout: 'horizontal',
        showCollapseButton: false,
        showDefaultActions: false,
        wrapperClass:
          'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-6',
        compact: false,
        schema: props.formSchemas,
      }
    : null,
  gridOptions: {
    keyboardConfig: {
      isEdit: true,
    },
    size: 'small',
    editConfig: {
      enabled: true,
      mode: 'row',
      trigger: 'dblclick', // dblclick
      showStatus: false,
      showIcon: false,
      autoClear: true,
    },
    radioConfig: {
      trigger: 'row',
      highlight: true,
    },
    keepSource: true,
    height: '500px',
    pagerConfig: {
      enabled: false,
    },
    showOverflow: true,
    proxyConfig: {
      autoLoad: false,
    },
    border: true,
    cellConfig: {
      height: 32,
    },
    data: gridData.value,
    rowConfig: {
      isCurrent: false,
    },
    columns: props.gridColumns,
    cellStyle(scope: any) {
      if (
        scope.column.field === 'qtyPlaned' ||
        scope.column.field === 'vendorId' ||
        scope.column.field === 'isGift'
      ) {
        return {
          backgroundColor: '#D7FFF5',
        };
      }
      if (
        scope.column.field === 'price' &&
        scope.row.price !== scope.row.priceList
      ) {
        return {
          color: 'red',
        };
      }
    },
    rowStyle(scope: any) {
      if (scope && scope.row && scope.$table.isEditByRow(scope.row)) {
        return {
          backgroundColor: '#E0FFFC',
          color: '#000',
        };
      } else if (scope && scope.row && scope.$table.isInsertByRow(scope.row)) {
        return {
          backgroundColor: '#CEFFE4',
          color: '#000',
        };
      } else if (scope && scope.row && scope.$table.isUpdateByRow(scope.row)) {
        return {
          backgroundColor: '#FFE2E2',
          color: '#000',
        };
      }
    },
    headerCellStyle({ column }: any) {
      if (
        column.field === 'qtyPlaned' ||
        column.field === 'vendorId' ||
        column.field === 'isGift'
      ) {
        return {
          // backgroundColor: '#D7FFF5',
          // color: '#000',
        };
      }
    },
  },
  gridEvents: {
    //   editActivated: (scope: any) => {
    //     vendorParams.value = {
    //       productId: scope.row.productId,
    //       isNoProtocolPo: currentWarehouseInfo.value.isNoProtocolPo,
    //       isBPartnerProductControl:
    //       currentWarehouseInfo.value.isBPartnerProductControl,
    //       noProtocolPricePoSource: 'M', // 本字段写死为M
    //     };
    //     // 用于获取当前正在操作行和列的赋值
    //     currentEditRow.value = scope.row;
    //     currentField.value = scope.column.field;
    //   },
    //   editClosed: async ({ row }: any) => {
    //     currentInsertRows.value = gridApi.grid.getInsertRecords();
    //     currentUpdateRows.value = gridApi.grid.getUpdateRecords();
    //     if (autoSaveController.value === 'onSaving') {
    //       currentEditRow.value = undefined;
    //       currentField.value = '';
    //     } else {
    //       autoSaveController.value = 'onSaving';
    //       if (
    //         gridApi.grid.isInsertByRow(row) ||
    //         gridApi.grid.isUpdateByRow(row)
    //       ) {
    //         currentEditRow.value = undefined;
    //         currentField.value = '';
    //         // 对该行数据进行保存
    //         handleSaveRow({
    //           $grid: gridApi.grid,
    //           row,
    //         })
    //           .then(() => {
    //             autoSaveController.value = 'wait';
    //             currentInsertRows.value = [];
    //             currentUpdateRows.value = [];
    //           })
    //           .catch(() => {
    //             autoSaveController.value = 'error';
    //             currentInsertRows.value = [];
    //             currentUpdateRows.value = [];
    //           });
    //       } else {
    //         autoSaveController.value = 'wait';
    //       }
    //     }
  },
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (props.formSchemas?.length) {
      const { valid } = await gridApi.formApi.validate();
      if (!valid) {
        return;
      }
    }
    try {
      await param.value?.submit({
        schema: await gridApi.formApi.getValues(),
        rows: gridApi.grid.getFullData(),
        removed: removedIds.value,
      });

      message.success('操作成功');

      modalApi.close();
      props.afterSubmit?.();
    } catch (error) {
      console.error(error);
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;

      setTimeout(() => {
        gridApi.formApi.setValues(param.value.schema);
        gridApi.grid.loadData(param.value.rows);

        gridApi.formApi.updateSchema(props.formSchemas);
      });
    }
  },
});

function add() {
  // gridData.value.push(cloneDeep(defaultRowValue.value));
  gridApi.grid.insertAt(cloneDeep(defaultRowValue.value), -1);
}
function del() {
  gridApi.grid
    .removeRadioRow()
    .then(({ row: { productSpecId, contractLineId } }) => {
      if (productSpecId ?? contractLineId) {
        removedIds.value.push(productSpecId ?? contractLineId);
      }
    });
}

defineExpose({
  modalApi,
  gridApi,
});
</script>
<template>
  <Modal class="w-[50%]" :title="param?.title">
    <Grid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="add()"
          class="mr-[0.5rem]"
          data-testid="button_add_tableModal"
        >
          添加
          <!--          <template #icon>-->
          <!--            <AddActionIcon />-->
          <!--          </template>-->
        </Button>
        <Button
          danger
          type="primary"
          @click="del()"
          class="mr-[0.5rem]"
          data-testid="button_delete_tableModal"
        >
          删除
          <!--          <template #icon>-->
          <!--            <SvgDeleteIcon />-->
          <!--          </template>-->
        </Button>
      </template>
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </Grid>
  </Modal>
</template>
