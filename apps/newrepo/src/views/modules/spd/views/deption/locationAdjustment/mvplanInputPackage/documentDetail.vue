<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';

import { Button, message, Modal } from 'ant-design-vue';

// import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { $t } from '#/locales';

import actionLogModal from './modals/actionLogModal.vue';
import batchAddModal from './modals/batchAddModal.vue';

const route = useRoute();
const VxeSelect = VxeUI.getComponent('VxeSelect'); // 获取Vxe的select组件
const urlParams: any = route.meta?.urlParams || {}; // 路由中传递的参数
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const selectParams = ref<{ [key: string]: any }>({
  // replenishSource: 'P',
  warehouseId: currentHandleRow.value.warehouseId || undefined,
});
const warehouseName = ref(currentHandleRow.value.warehouseName);
const gridData = ref<any[]>([]); // 表格数据
// 生成表格组件和api
// useVbenVxeGrid
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      showCollapseButton: false,
      showDefaultActions: false,
      wrapperClass:
        'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
      compact: false,

      commonConfig: {
        labelClass: 'w-[40px]',
      },
    },
    gridOptions: {
      stripe: false,
      keyboardConfig: {
        isEdit: true,
      },
      size: 'small',
      editConfig: {
        enabled: detailConfig.value?.type !== 'view',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      checkboxConfig: {
        trigger: 'default',
        // checkMethod: ({ row }: any) => {
        //   return row.orderPlanLineId;
        // },
      },
      keepSource: true,
      height: 'auto',
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
      cellStyle(scope: any) {
        if (
          scope.column.field === 'packagePlaned' ||
          scope.column.field === 'qtyPlaned' ||
          scope.column.field === 'toLocatorId' ||
          scope.column.field === 'description'
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
      // rowStyle(scope: any) {
      //   if (scope && scope.row && scope.$table.isEditByRow(scope.row)) {
      //     return {
      //       backgroundColor: '#E0FFFC',
      //       color: '#000',
      //     };
      //   } else if (
      //     scope &&
      //     scope.row &&
      //     scope.$table.isInsertByRow(scope.row)
      //   ) {
      //     return {
      //       backgroundColor: '#CEFFE4',
      //       color: '#000',
      //     };
      //   } else if (
      //     scope &&
      //     scope.row &&
      //     scope.$table.isUpdateByRow(scope.row)
      //   ) {
      //     return {
      //       backgroundColor: '#FFE2E2',
      //       color: '#000',
      //     };
      //   }
      // },
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
      editActivated: (scope: any) => {
        // console.log('editActivated:', scope.row);
        // 用于获取当前正在操作行和列的赋值
        currentEditRow.value = scope.row;
        currentField.value = scope.column.field;
      },
      editClosed: () => {
        // console.log('editClosed:');
        currentEditRow.value = undefined;
        currentField.value = '';
      },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      {
        title: '序号',
        type: 'seq',
        width: 40,
        align: 'center',
        sortable: true,
      },
      {
        field: 'productCode',
        minWidth: 100,
        title: '药品编码',
        // sortable: true,
      },
      {
        field: 'productName',
        minWidth: 150,
        title: '药品名称',
        sortable: true,
      },
      {
        field: 'productSpec',
        minWidth: 100,
        title: '规格',
        sortable: true,
      },
      {
        field: 'modelNo',
        minWidth: 100,
        title: '型号',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        minWidth: 100,
        title: '厂家',
        sortable: true,
      },
      {
        field: 'uomName',
        minWidth: 70,
        title: '单位',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        minWidth: 100,
        title: '库存数量',
        sortable: true,
      },
      {
        field: 'packagePlaned',
        minWidth: 110,
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange(val: any) {
              if (currentEditRow.value) {
                if (
                  Number(val.value) > Number(currentEditRow.value.packageCount)
                ) {
                  return message.error('指示包数应小于总包数');
                }
                currentEditRow.value.qtyPlaned =
                  val.value * currentEditRow.value.unitPackQty;
              }
            },
          },
        },
        title: '指示包数',
        visible: urlParams.isPackaged !== 'N',
        sortable: false,
        align: 'right',
      },

      {
        field: 'packageCount',
        minWidth: 90,
        title: '总包数',
        // formatter({ row }: any) {
        //   return handlePriceToFixedTwo(row.price);
        // },
        visible: urlParams.isPackaged !== 'N',
        sortable: false,
        align: 'right',
      },
      {
        field: 'unitPackQty',
        minWidth: 80,
        title: '定数',
        sortable: true,
        // visible: urlParams.isPackaged !== 'N',
        // formatter({ row }: any) {
        //   return handlePriceToFixedTwo(row.lineAmt);
        // },
        align: 'right',
        visible: false,
      },
      {
        field: 'qtyPlaned',
        minWidth: 90,
        title: '指示数量',
        sortable: false,
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange(val: any) {
              if (
                currentEditRow.value &&
                Number(val.value) > Number(currentEditRow.value.qtyOnHand)
              ) {
                return message.error('指示数量应小于库存数量');
              }
            },
          },
        },
      },
      {
        field: 'locatorName',
        minWidth: 90,
        title: '货位',
        sortable: true,
      },
      {
        field: 'toLocatorId',
        title: '目标货位',
        minWidth: 100,
        sortable: true,
        editRender: {},
        slots: { edit: 'edit_toLocatorId' },
        formatter({ row }: any) {
          return row.toLocatorName;
        },
      },
      // {
      //   field: 'toLocatorName',
      //   title: '目标货位',
      //   width: '90',
      //   visible: false,
      //   // "edit" : "ProductPopWin",
      //   sortable: true,
      // },
      {
        field: 'locatorId',
        title: '货位ID',
        visible: false,
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'toStorageStatusName',
        minWidth: 130,
        title: '目标状态',
        sortable: true,
        formatter({ row }: any) {
          return row.toStorageStatusName || row.storageStatusName;
        },
      },
      {
        field: 'toStorageStatus',
        minWidth: 110,
        title: '目标状态编码',
        formatter({ row }: any) {
          return row.toStorageStatus || row.storageStatus;
        },
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: 110,
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: 110,
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: 200,
        editRender: {
          name: 'VxeInput',
        },
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: detailConfig.value?.type === 'view' ? 90 : 85,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: undefined,
        formItemClass: 'pb-2',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: detailConfig.value?.type === 'add',
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            triggerFields: ['departmentId', 'regionId'],
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            showChooseAll: false,
            onChange(val: any, option: any) {
              selectParams.value.warehouseId = val;
              warehouseName.value = option.label;
            },
            disabled: false,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue:
          detailConfig.value?.type === 'add'
            ? undefined
            : currentHandleRow.value.warehouseId,
        formItemClass: 'pb-2',
        fieldName: 'warehouseId',
        label: '仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              chcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'description',
        componentProps: {
          disabled: detailConfig.value?.type === 'view',
        },
        label: $t('purchasePlan.buyPlan.description'),
        defaultValue:
          detailConfig.value?.type === 'add'
            ? undefined
            : currentHandleRow.value.description,
        formItemClass: 'pb-2 col-span-2',
      },
    ],
  },
);
const originRows = ref<any[]>([]);
const removedRows = ref<any[]>([]);
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});

// 点击删除按钮
const handleDeleteRow = async (scope: any) => {
  const handleDelete = () => {
    return new Promise((resolve) => {
      (async () => {
        if (scope.row.movementPlanLineId) {
          // 标记 remove 列表
        }
        // 当前删除的不是临时行
        if (scope.row.movementPlanLineId) {
          removedRows.value.push(scope.row);
        }
        gridData.value.splice(scope.$rowIndex, 1);

        resolve(true);
      })();
    });
  };
  // 删除的就是当前操作行 或者 在非编辑状态点击删除，直接删
  await handleDelete();
};
const chcSelectRef = ref(); // 商品选择下拉组件
const getAddRowByChoosedRow = (record: any) => {
  if (urlParams.isPackaged === 'N') {
    const editRow = { ...record };
    editRow.qtyPlaned = record.qtyOnHand;
    return { ...editRow };
  } else {
    const editRow = { ...record };
    editRow.qtyPlaned = record.qtyOnHand;
    editRow.packagePlaned = record.packageCount;
    return { ...editRow };
  }
};
// 批量删除方法
const handleBatchDel = async () => {
  if (chcGridApi.grid.getCheckboxRecords().length === 0) {
    return message.error('请选中行数据');
  }
  function batchDel() {
    const delRows: any[] = chcGridApi.grid
      .getCheckboxRecords()
      .map((item: any) => {
        return toRaw(item);
      });
    delRows.forEach((item) => {
      const index = gridData.value.findIndex((itemIn) => {
        return itemIn._X_ROW_KEY === item._X_ROW_KEY;
      });
      if (item.movementPlanLineId) {
        removedRows.value.push(item);
      }
      gridData.value.splice(index, 1);
    });
  }
  batchDel();
};
// 选择一个商品
const handleChoose = async (_: any, option: any) => {
  await nextTick();
  chcSelectRef.value.modelValue = undefined; // 清空下拉组件
  const record = getAddRowByChoosedRow(option);
  const newRow = await chcGridApi.grid.createRow(record);
  gridData.value.push(newRow);
};
// 点击批量添加按钮
const handleBatchAdd = async () => {
  function handleOpenAddModal() {
    chcGridApi.formApi.getValues().then((res: any) => {
      batchAddModalApi!
        .setData({
          warehouseId: res.warehouseId,
          handleBatchChoose,
        })
        .open();
    });
  }
  handleOpenAddModal();
};
// 处理批量添加事件
const handleBatchChoose = async (records: any[]) => {
  for (const [, record__] of records.entries()) {
    const record = getAddRowByChoosedRow(record__);
    const newRow = await chcGridApi.grid.createRow(record);
    gridData.value.push(newRow);
  }
};

// 右下角全部 保存 提交 返回功能
const totalHandleLoading = ref(false); // 整体操作loading控制
// 整体保存
const handleTotalSave = async (doCommit: boolean) => {
  const formValues = await chcGridApi.formApi.getValues();
  if (!formValues.warehouseId || formValues.warehouseId === '') {
    return message.error('仓库不可为空!');
  }
  const params = formValues;
  let msg;
  let flag = true;
  const created: any[] = [];
  const updated: any[] = [];
  const records = chcGridApi.grid.getFullData();
  records.forEach((record: any, index: number) => {
    if (!record.toLocatorId) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `没有目标货位`;
      flag = false;
      return;
    }
    if (
      record.toLocatorId === record.locatorId ||
      record.locatorId === String(record.toLocatorId) ||
      String(record.locatorId) === record.toLocatorId
    ) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `原货位与目标货位一样`;
      flag = false;
    }
    if (record.movementPlanLineId > 0) {
      updated.push(record);
    } else {
      created.push(record);
    }
  });
  if (!flag) {
    return message.error(msg);
  }
  if (
    created.length === 0 &&
    updated.length === 0 &&
    removedRows.value.length === 0
  ) {
    return message.error('请输入商品明细！');
  }
  const lineData = {
    created,
    updated,
    removed: removedRows.value,
  };
  params.movementPlanId = currentHandleRow.value.movementPlanId;
  params.lineData = JSON.stringify(lineData);
  if (doCommit) {
    params.doCommit = 'Y';
    Modal.confirm({
      title: '提示',
      content: `仓库：${warehouseName.value}`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        totalHandleLoading.value = true;
        requestFormClient
          .post('movementPlanAction/save.do', params)
          .then(() => {
            message.success('提交成功');
            totalHandleLoading.value = false;
            currentTab.value = 0;
          })
          .catch(() => {
            totalHandleLoading.value = false;
          });
      },
      onCancel() {},
    });
  } else {
    totalHandleLoading.value = true;
    requestFormClient
      .post('movementPlanAction/save.do', params)
      .then(() => {
        message.success('保存成功');
        totalHandleLoading.value = false;
        currentTab.value = 0;
      })
      .catch(() => {
        totalHandleLoading.value = false;
      });
  }
};
// 供应商下拉数据源
const vendorOptions = ref<any[]>([]);
// 监控供应商下拉值改变 同时改变该行数据的 vendorName 字段
const handleVendorChange = (val: any, scope: any) => {
  const option = vendorOptions.value.find((item) => {
    return item.value === val.value;
  });
  scope.row.toLocatorId = option.value;
  scope.row.toLocatorName = option.label;
  scope.row.toStorageStatus = option.locatorUseType;
  scope.row.toStorageStatusName = option.locatorUseTypeName;
};
// 监听当前编辑行的变化，只要当前编辑行发生改变，就重新查询供应商下拉数据
watch(
  () => currentEditRow.value,
  async (val) => {
    if (val) {
      const formValues = await chcGridApi.formApi.getValues();
      requestFormClient
        .post('/warehouseAction/locatorList.do', {
          warehouseId: formValues.warehouseId,
          isScatter: urlParams.isPackaged === 'N' ? 'Y' : 'N',
          limit: 0,
        })
        .then((res) => {
          vendorOptions.value = res.rows.map((item: any) => {
            return {
              ...item,
              label: item.name,
              value: item.id,
            };
          });
        });
    }
  },
);
// actionLogModalApi
const [ActionLogModal] = useVbenModal({
  connectedComponent: actionLogModal,
});
// const handleDetail = (scope: any) => {
//   actionLogModalApi!
//     .setData({
//       warehouseId: scope.row?.warehouseId,
//       orderPlanLineId: scope.row?.orderPlanLineId,
//     })
//     .open();
// };

// 页面初始化加载行数据以及黑名单数据
onMounted(() => {
  if (currentHandleRow.value.movementPlanId) {
    requestFormClient
      .post(
        `/movementPlanAction/queryDetail.do?specShowType=from&page=Input&movementPlanId=${currentHandleRow.value.movementPlanId}`,
        {},
      )
      .then((res) => {
        originRows.value = res.rows;
        gridData.value.push(...res.rows);
      });
  }
});
// 组件销毁
onUnmounted(() => {});
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <BatchAddModal />
    <ChcGrid>
      <template #edit_toLocatorId="scope">
        <VxeSelect
          v-model="scope.row.toLocatorId"
          :options="vendorOptions"
          @change="handleVendorChange($event, scope)"
          :data-testid="`VxeSelect_toLocatorId_${scope.rowIndex}_documentDetail`"
        />
      </template>
      <template #toolbar-actions v-if="detailConfig?.type !== 'view'">
        <ChcSelect
          :autofocus="true"
          :paginate="true"
          :allow-clear="false"
          ref="chcSelectRef"
          placeholder="请输入药品编码、药品名称、规格"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/storageAction/queryPackageStorageLot.do"
          popup-class-name="productSelection"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
          :page-size="10"
          :immediate="false"
          :extra-params="selectParams"
          :filter-by-front-end="false"
          :show-search="true"
          @change="handleChoose"
          filter-field="productName"
          :handle-params="
            (params: any) => {
              return {
                ...params,
                current: undefined,
                pageNum: params.current,
                pageSize: params.size,
                size: undefined,
              };
            }
          "
          label-field="productName"
          value-field="productCode"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :option-columns="[
            {
              header: '药品编码',
              name: 'productCode',
              width: 80,
            },
            {
              header: '药品名称',
              name: 'productName',
              width: 140,
            },
            {
              header: '规格',
              name: 'productSpec',
              width: 60,
            },
            {
              header: '型号',
              name: 'modelNo',
              width: 80,
              visible: false,
            },
            {
              header: '厂家',
              name: 'manufacturer',
              width: 100,
            },
            {
              header: '单位',
              name: 'uomName',
              width: 60,
            },
            {
              header: '定数',
              name: 'unitPackQty',
              width: 60,
              visible: false,
            },
            {
              header: '包数',
              name: 'packageCount',
              width: 60,
            },
            {
              header: '库存',
              name: 'qtyOnHand',
              width: 60,
            },
            {
              header: '货位',
              name: 'locatorName',
              width: 100,
            },
            {
              header: '批号',
              name: 'lot',
              width: 110,
            },
            {
              header: '效期',
              name: 'guaranteeDate',
              width: 110,
            },
          ]"
          data-testid="ChcSelect_productName_documentDetail"
        />
        <Button
          type="primary"
          @click="handleBatchAdd"
          class="mr-[0.5rem]"
          data-testid="Button_batchadd_documentDetail"
        >
          批量添加
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleBatchDel"
          class="mr-[0.5rem]"
          data-testid="Button_batch_delete_documentDetail"
        >
          批量删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <!-- <template #toolbar-tools>
        <Input
          @input="handleSearchIpt"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入物资关键词"
          @keyup.enter="handleSearch"
          @focus="toggleSearchFocus(true)"
          @blur="toggleSearchFocus(false)"
        />
        <Button type="primary" @click="handleSearch">
          搜索
          <template #icon>
            <SearchActionIcon />
          </template>
        </Button>
      </template> -->
      <template #action="scope">
        <!-- <Button
          v-if="detailConfig?.type === 'view'"
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
        >
          操作记录
        </Button> -->
        <Button
          type="primary"
          ghost
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailConfig?.type !== 'view'"
          :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
        >
          删行
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-center pt-[10px]">
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              @click="handleTotalSave(false)"
              :loading="totalHandleLoading"
              v-if="detailConfig?.type !== 'view'"
              data-testid="button_save_documentDetail"
            >
              保存
              <template #icon>
                <SvgSaveIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleTotalSave(true)"
              :loading="totalHandleLoading"
              v-if="detailConfig?.type !== 'view'"
              data-testid="button_submit_documentDetail"
            >
              提交
              <template #icon>
                <UploadCloudIcon />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}

::v-deep(.vxe-tools--wrapper .ant-input) {
  padding: 2px 7px;
}
</style>
