<script setup lang="ts">
import type { Ref } from 'vue';

import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { inject, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';
import { isEmpty } from '@vben/utils';

import { Button, message } from 'ant-design-vue'; // 获取Vxe的select组件
import { cloneDeep } from 'lodash-es';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

import scanModalUi from '../modals/scanModal.vue';

const props = withDefaults(
  defineProps<{
    refreshFatherTable: () => void;
    scanBtnVisible: boolean;
    thisTab: PageTab;
  }>(),
  {},
);
const VxeSelect = VxeUI.getComponent('VxeSelect');
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const hiddenField: string = urlParams?.hiddenField || '';
console.warn('urlParams', urlParams);
const fatherTableParams = ref<Record<string, any>>({});

const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// const isFirstLoaded = ref(false); // 是否已初次加载完
const EDITABLE_FIELDS = new Set([
  'description',
  'inventoryReason',
  'qtyBaseUomCount',
  'qtyUomCount',
]);
const READ_ONLY_FIELDS = new Set(['qtyBaseUomCount', 'qtyUomCount']);
const currentEditRow = ref<Record<string, any>>({});
const currentField = ref('');
const inventoryReasonParams = ref<Record<string, any>>({});
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存保存了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
const inventoryReasonOptions = ref<{ label: string; value: number | string }[]>(
  [],
);
(() => {
  requestFormClient
    .post('/baseHandleAction/refList.do?id=1000109', {})
    .then((res) => {
      inventoryReasonOptions.value = res.rows.map((item: any) => {
        return {
          ...item,
          label: item.name,
          value: item.id,
        };
      });
    });
})();
let gridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    type: 'checkbox',
    align: 'center',
    width: '50',
    title: '多选',
  },
  {
    type: 'seq',
    title: '序号',
    width: '50',
    align: 'center',
  },
  {
    field: 'productCode',
    title: '药品编码',
    width: '120',
    sortable: true,
  },
  {
    field: 'productName',
    title: '药品名称',
    width: '200',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    width: '90',
    sortable: true,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    width: '150',
    sortable: true,
  },

  // TODO:字段名重复
  // {
  //   field: 'uomName',
  //   title: '单位',
  //   width: '70',
  //   sortable: true,
  // },
  {
    field: 'qtyMaxBook',
    title: '账存数量',
    width: '100',
    align: 'right',
    sortable: true,
  },
  {
    field: 'qtyUomCount',
    title: '实盘数量',
    width: '130',
    align: 'right',
    editRender: {
      name: 'VxeNumberInput',
      props: {},
    },
  },
  {
    field: 'uomName',
    title: '单位',
    align: 'right',
    width: '100',
    sortable: true,
  },
  {
    field: 'qtyMinBook',
    title: '账存最小单位数量',
    align: 'right',
    width: '150',
    formatter: ({ cellValue }) => {
      if (cellValue == null || cellValue === '') return '';
      return Math.round(Number(cellValue));
    },
  },
  {
    field: 'qtyBaseUomCount',
    title: '实盘最小单位数量',
    align: 'right',
    width: '180',
    visible: !hiddenField.includes('qtyBaseUomCount'),
    formatter: ({ cellValue }) => {
      if (cellValue == null || cellValue === '') return '';
      return Math.round(Number(cellValue));
    },
    editRender: {
      name: 'VxeNumberInput',
      props: { type: 'integer', min: 0, step: 1, digits: 0 },
    },
  },
  {
    field: 'baseUomName',
    title: '实盘小单位',
    align: 'right',
    width: '100',
    visible: !hiddenField.includes('baseUomName'),
    sortable: true,
  },
  // {
  //   field: 'qtyCount',
  //   title: '实盘数量',
  //   align: 'right',
  //   width: '90',
  //   formatter: ({ cellValue }) => {
  //     return Math.floor(cellValue) === cellValue
  //       ? cellValue
  //       : cellValue.toFixed(2);
  //   },
  //   sortable: true,
  // },
  {
    field: 'qtyDiff',
    title: '差异数量',
    align: 'right',
    width: '90',
    sortable: true,
  },
  {
    field: 'diffAmt',
    title: '差异金额',
    align: 'right',
    width: '90',
    sortable: true,
  },
  {
    field: 'inventoryReason',
    title: '损溢原因',
    width: '150',
    // verify: 'required',
    formatter: ({ row }) => {
      const item = inventoryReasonOptions.value.find(
        (item) => item.value === row.inventoryReason,
      );
      if (!isEmpty(item)) {
        return item!.label;
      }
      return row.inventoryReason;
    },
    editRender: {},
    slots: {
      edit: 'edit_inventoryReason',
    },
  },
  {
    field: 'description',
    title: '备注',
    width: '150',

    sortable: true,
    editRender: {
      name: 'VxeInput',
    },
  },
  {
    field: 'unitPackQty',
    title: '包装定数',
    align: 'right',
    width: '90',
    sortable: true,
  },
  {
    field: 'packageQtyBook',
    title: '账存包数',
    align: 'right',
    width: '90',
    sortable: true,
  },
  {
    field: 'packageQtyCount',
    title: '实盘包数',
    align: 'right',
    width: '90',
    sortable: true,
  },
  {
    field: 'packageQtyDiff',
    title: '差异包数',
    align: 'right',
    width: '90',
    sortable: true,
  },
  {
    field: 'lot',
    title: '批号',
    width: '110',
    sortable: true,
    cellType: 'string',
  },
  {
    field: 'guaranteeDate',
    title: '效期',
    width: '110',
    sortable: true,
  },
  // {
  //   field: 'productionDate',
  //   title: '生产日期',
  //   width: '110',
  //   visible: true,
  //   sortable: true,
  // },
  // {
  //   field: 'productArea',
  //   title: '产地',
  //   width: '110',
  //   visible: true,
  //   sortable: true,
  // },
  {
    field: 'locatorName',
    title: '货位',
    width: '180',
    sortable: true,
  },
  {
    field: 'vendorCode',
    title: '供应商编码',
    width: 120,
    align: 'center',
    sortable: true,
  },
  {
    field: 'vendorName',
    title: '供应商',
    width: 120,
    sortable: true,
  },
  {
    field: 'storageStatusName',
    title: '存货状态',
    width: '100',
    sortable: true,
  },
  {
    field: 'inventoryPlanNo',
    title: '盘点计划号',
    width: '110',
    sortable: true,
  },
  {
    field: 'countUserName',
    title: '盘点人',
    width: '100',
    sortable: true,
  },
  {
    field: 'countTime',
    title: '盘点时间',
    width: '160',
    sortable: true,
  },
];
gridColumns = gridColumns.filter((item) => {
  if (
    item.field === 'checkbox' ||
    item.field === 'action' ||
    item.field === 'radio'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      seqConfig: {
        seqMethod: ({ rowIndex }: { rowIndex: number }) => {
          return rowIndex + 1;
        },
      },
      keepSource: true,
      editConfig: {
        trigger: 'click',
        mode: 'cell',
        // trigger: 'dblclick',
        // mode: 'row',
        beforeEditMethod: ({ row, column }: { column: any; row: any }) => {
          if (
            EDITABLE_FIELDS.has(column.field) &&
            READ_ONLY_FIELDS.has(column.field)
          ) {
            return row.isStoragePackage !== 'Y';
          }
          return true;
        },
      },
      cellStyle: ({ row, column }: { column: any; row: any }) => {
        if (EDITABLE_FIELDS.has(column.field)) {
          if (
            READ_ONLY_FIELDS.has(column.field) &&
            row.isStoragePackage === 'Y'
          ) {
            return {};
          }
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      rowStyle(scope: any) {
        if (scope && scope.row && scope.$table.isEditByRow(scope.row)) {
          return {
            backgroundColor: '#E0FFFC',
            color: '#000',
          };
        } else if (
          scope &&
          scope.row &&
          scope.$table.isInsertByRow(scope.row)
        ) {
          return {
            backgroundColor: '#CEFFE4',
            color: '#000',
          };
        } else if (
          scope &&
          scope.row &&
          scope.$table.isUpdateByRow(scope.row)
        ) {
          return {
            backgroundColor: '#FFE2E2',
            color: '#000',
          };
        }
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      editActivated: (v: any) => {
        console.warn('editActivated', v);

        currentEditRow.value = cloneDeep(v.row);
        currentField.value = v.column.field;
        inventoryReasonParams.value = {
          productId: v.row.productId,
        };
        console.warn('editActivated currentEditRow', currentEditRow.value);
      },
      editClosed: (v: any) => {
        console.warn('editClosed v', v);
        console.warn('editClosed currentEditRow', currentEditRow.value);
        if (!ChcGridApi.grid.isUpdateByRow(v.row)) {
          console.warn('editClosed 不是更新行 不保存', v.row);
          return;
        }
        if (autoSaveController.value === 'onSaving') {
          console.warn('editClosed 自动保存中 不保存', v.row);
          return;
        }
        autoSaveController.value = 'onSaving';
        // 如果值发生变化就保存
        switch (v.column.field) {
          case 'description': {
            if (v.row.description !== currentEditRow.value.description) {
              const saveField = v.column.field;
              autoSave(saveField, cloneDeep(v.row));
            }
            break;
          }
          case 'inventoryReason': {
            if (
              v.row.inventoryReason !== currentEditRow.value.inventoryReason
            ) {
              const saveField = v.column.field;
              autoSave(saveField, cloneDeep(v.row));
            }

            break;
          }
          case 'qtyBaseUomCount': {
            console.warn(
              'editClosed ===',
              v.row.qtyBaseUomCount,
              currentEditRow.value.qtyBaseUomCount,
              v.row.qtyBaseUomCount !== currentEditRow.value.qtyBaseUomCount,
            );
            const saveField = v.column.field;

            if (
              v.row.qtyBaseUomCount !== currentEditRow.value.qtyBaseUomCount
            ) {
              autoSave(saveField, cloneDeep(v.row));
            }

            break;
          }
          case 'qtyUomCount': {
            const saveField = v.column.field;

            if (v.row.qtyUomCount !== currentEditRow.value.qtyUomCount) {
              autoSave(saveField, cloneDeep(v.row));
            }

            break;
          }
          // No default
        }
      },
    },
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: ``,
            defaultValue: '',
          };
        },
      },

      {
        component: 'ChcSelect',
        fieldName: 'isShowZero',
        label: '零库存',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,

            defaultValue: '',
            options: [
              {
                label: '全部',
                value: '',
              },
              {
                label: '是',
                value: 'Y',
              },
              {
                label: '否',
                value: 'N',
              },
            ],
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'hasDiff',
        label: '差异',
        defaultValue: false,
        componentProps: () => {
          return {
            defaultValue: false,
          };
        },
      },
    ],
    gridColumns,
    id: 'countInput_tapone',
    queryUrl: '/inventoryPlanAction/queryLine.do',
    // tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn', params);

      const realParams: Record<string, any> = {
        // limit: 0,
      };
      if (!fatherTableParams.value.inventoryPlanId) {
        return false;
      }
      if (fatherTableParams.value.inventoryPlanId) {
        realParams.inventoryPlanId = fatherTableParams.value.inventoryPlanId;
      }

      return {
        ...params,
        ...realParams,
        hasDiff: params.hasDiff === true || params.hasDiff === 'Y' ? 'Y' : 'N',
      };
    },
    afterFetchFn: (params) => {
      const rows = params.rows.map((item: any) => {
        if (item.inventoryReason === undefined) {
          item.inventoryReason = undefined;
        }
        if (item?.processed == 'Y') {
          // 已盘点
          item.qtyUomCount = isEmpty(item?.qtyUomCount)
            ? isEmpty(item?.qtyMaxBook)
              ? 0
              : item.qtyMaxBook
            : item.qtyUomCount;
          item.qtyBaseUomCount = isEmpty(item?.qtyBaseUomCount)
            ? isEmpty(item?.qtyMinBook)
              ? 0
              : item.qtyMinBook
            : item.qtyBaseUomCount;
          // item.qtyBaseUomCount = item.qtyBaseUomCount || item.qtyMinBook || 0;
        } else {
          item.qtyUomCount = item.qtyMaxBook || 0;
          item.qtyBaseUomCount = item.qtyMinBook || 0;
        }

        // 实盘最小单位数量四舍五入取整0728
        if (item.qtyBaseUomCount != null) {
          item.qtyBaseUomCount = Math.round(Number(item.qtyBaseUomCount));
        }

        return item;
      });
      return {
        ...params,
        records: rows,
      };
    },
  },
);

const autoSave = async (field: string, row: any) => {
  switch (field) {
    case 'description': {
      let description = row.description;
      if (description === '<0>') {
        description = '';
      }
      const params = {
        inventoryPlanLineId: row.inventoryPlanLineId,
        inventoryReason: 'NAN',
        description,
      };

      try {
        // 清除编辑状态
        await ChcGridApi?.grid?.clearEdit();

        await requestFormClient.post(
          '/inventoryPlanAction/inputIsnventoryReason.do',
          params,
        );
        autoSaveController.value = 'wait';
        props.refreshFatherTable();
      } catch (error) {
        console.error(error);
        autoSaveController.value = 'error';
        await ChcGridApi?.grid?.clearEdit();
        const formValues = await ChcGridApi?.formApi?.getValues();
        ChcGridApi.reload({ ...formValues });
      } finally {
        currentEditRow.value = {};
        currentField.value = '';
      }

      break;
    }
    case 'inventoryReason': {
      let inventoryReason = row.inventoryReason;
      if (inventoryReason === '<0>') {
        inventoryReason = '';
      }
      const params = {
        inventoryPlanLineId: row.inventoryPlanLineId,
        inventoryReason,
        description: 'NAN',
      };

      try {
        await ChcGridApi?.grid?.clearEdit();
        await requestFormClient.post(
          '/inventoryPlanAction/inputIsnventoryReason.do',
          params,
        );
        autoSaveController.value = 'wait';
        props.refreshFatherTable();
      } catch (error) {
        console.error(error);
        autoSaveController.value = 'error';
        await ChcGridApi?.grid?.clearEdit();
        const formValues = await ChcGridApi?.formApi?.getValues();
        ChcGridApi.reload({ ...formValues });
      } finally {
        currentEditRow.value = {};
        currentField.value = '';
      }

      break;
    }
    case 'qtyBaseUomCount': {
      const qtyCount =
        Number.parseFloat(row.qtyUomCount) +
        Math.round(Number(row.qtyBaseUomCount)) / row.specBaseUomQty;
      console.warn(
        'row.qtyBaseUomCount',
        row.qtyBaseUomCount,
        Math.round(Number(row.qtyBaseUomCount)),
      );
      const params = {
        inventoryPlanLineId: row.inventoryPlanLineId,
        qtyCount,
      };

      try {
        await ChcGridApi?.grid?.clearEdit();
        await requestFormClient.post(
          '/inventoryPlanAction/inputInventoryQtyCount.do',
          params,
        );
        autoSaveController.value = 'wait';
        props.refreshFatherTable();
      } catch (error) {
        console.error(error);
        autoSaveController.value = 'error';
        await ChcGridApi?.grid?.clearEdit();
        const formValues = await ChcGridApi?.formApi?.getValues();
        ChcGridApi.reload({ ...formValues });
      } finally {
        currentEditRow.value = {};
        currentField.value = '';
      }

      break;
    }
    case 'qtyUomCount': {
      const qtyCount =
        Number.parseFloat(row.qtyUomCount) +
        row.qtyBaseUomCount / row.specBaseUomQty;
      const params = {
        inventoryPlanLineId: row.inventoryPlanLineId,
        qtyCount,
      };
      try {
        await ChcGridApi?.grid?.clearEdit();
        await requestFormClient.post(
          '/inventoryPlanAction/inputInventoryQtyCount.do',
          params,
        );
        autoSaveController.value = 'wait';
        props.refreshFatherTable();
      } catch (error) {
        console.error(error);
        autoSaveController.value = 'error';
        await ChcGridApi?.grid?.clearEdit();
        const formValues = await ChcGridApi?.formApi?.getValues();
        ChcGridApi.reload({ ...formValues });
      } finally {
        currentEditRow.value = {};
        currentField.value = '';
      }

      break;
    }
    // No default
  }
};

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab', val, oldVal);
    if (val === props.thisTab.value) {
      if (fatherTableParams.value.inventoryPlanId) {
        ChcGridApi.reload();
      } else {
        ChcGridApi.grid.loadData([]);
      }
    }
  },
);

// 初始化加载
onMounted(() => {
  console.warn('盘点明细');
  console.warn('urlParams:', urlParams);
  document.addEventListener('keydown', handleEditEnterKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEditEnterKey);
});

// 账实相符
const handleChecking = () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords();
  const unProxyRows = toRaw(checkedRows);
  if (unProxyRows.length <= 0) {
    message.warning('请选择盘点计划行！');
    return;
  }
  const paramRecords: any[] = [];
  unProxyRows.forEach((item: any) => {
    if (item.inventoryPlanLineId) {
      paramRecords.push(item.inventoryPlanLineId);
    }
  });
  const params = {
    inventoryPlanLineId: JSON.stringify(paramRecords),
  };
  requestFormClient
    .post('/inventoryPlanAction/inventoryIdentical.do', params)
    .then(() => {
      message.success('操作成功');
      props.refreshFatherTable();
    })
    .catch((error) => {
      console.error(error);
    });
};
const handleCheckedNoStorage = () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords();
  const unProxyRows = toRaw(checkedRows);
  if (unProxyRows.length <= 0) {
    message.warning('请选择盘点计划行！');
    return;
  }
  const paramRecords: any[] = [];
  unProxyRows.forEach((item: any) => {
    if (item.inventoryPlanLineId) {
      paramRecords.push(item.inventoryPlanLineId);
    }
  });
  const params = {
    inventoryPlanLineId: JSON.stringify(paramRecords),
  };
  requestFormClient
    .post('/inventoryPlanAction/inventoryNoStorage.do', params)
    .then(() => {
      message.success('操作成功');
      props.refreshFatherTable();
    })
    .catch((error) => {
      console.error(error);
    });
};

const handleInventoryReasonChange = (val: any, scope: any) => {
  // scope.row.vendorName = vendorOptions.value.find((item) => {
  //   return item.value === val.value;
  // }).label;
  console.warn('handleInventoryReasonChange', val, scope);
};

// 编辑中按 Enter 键关闭编辑并保存
const handleEditEnterKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && currentEditRow.value && currentField.value) {
    e.preventDefault();
    e.stopPropagation();
    ChcGridApi.grid.clearEdit();
  }
};

// 编辑单元格 Enter 键关闭编辑
const handleEditKeydown = (evnt: KeyboardEvent) => {
  if (evnt.key === 'Enter') {
    evnt.stopPropagation();
    ChcGridApi.grid.clearEdit();
  }
};
defineExpose({
  getData(params: Record<string, any>) {
    // 子表请求
    console.warn('子表盘点明细请求');
    fatherTableParams.value = {};
    fatherTableParams.value = { ...params };
    ChcGridApi.reload();
  },
  clearData() {
    fatherTableParams.value = {};
    ChcGridApi.grid.clearEdit();
    ChcGridApi.grid.remove();
  },
  getCheckedRows() {
    const checkedRows = ChcGridApi.grid.getCheckboxRecords();
    const unProxyRows = deepClone(checkedRows);
    return unProxyRows;
  },
});
const fatherTableCheckedRow = inject<Ref<Record<string, any>>>(
  'fatherTableCheckedRow',
  ref({}),
);

const [ScanModal, ScanModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: scanModalUi,
  draggable: true,
});
const handleScan = () => {
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划！');
    return;
  }
  ScanModalApi.setData({
    inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
    callback() {
      props.refreshFatherTable();
    },
  }).open();
};
</script>
<template>
  <div class="h-full">
    <ScanModal />
    <ChcGrid>
      <template #edit_inventoryReason="scope">
        <VxeSelect
          v-model="scope.row.inventoryReason"
          :options="inventoryReasonOptions"
          @change="handleInventoryReasonChange($event, scope)"
          @keydown="handleEditKeydown($event)"
          :data-testid="`VxeSelect_inventoryReason_${scope.rowIndex}_taponeTable`"
        />
      </template>

      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_taponeTable"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>

        <Button
          type="primary"
          @click="handleChecking"
          class="mr-[0.5rem]"
          data-testid="button_checking_taponeTable"
        >
          账实相符
        </Button>
        <Button
          type="primary"
          @click="handleCheckedNoStorage"
          class="mr-[0.5rem]"
          data-testid="button_checkedNoStorage_taponeTable"
        >
          无实物库存
        </Button>
        <Button
          v-show="scanBtnVisible"
          type="primary"
          @click="handleScan"
          class="mr-[0.5rem]"
          data-testid="button_scan_taponeTable"
        >
          扫码盘点
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

.custom-dropdown {
  padding: 8px;
}

.tableHeader {
  position: absolute;
  top: 0;
  z-index: 99;
  height: 40px;
  margin-top: 10px;
  font-family: 'HiraginoSansGB-W3';
  font-size: 14px;
  font-weight: 600;
  line-height: 40px;
  color: #fff;
  background: rgb(64 158 255);
}

.tableHeader span {
  box-sizing: border-box;
  width: 100px;
  text-align: center;
}
</style>
