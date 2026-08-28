<script setup lang="ts">
import type { Ref } from 'vue';

import { nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
  UploadCloudIcon,
  viewActionIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';

import { Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { requestFormClient } from '#/api/request';
import { $t } from '#/locales';
import { handlePriceToFixedTwo } from '#/utils/util';

import {
  getOrderPlanStorage,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
} from './api';
import actionLogModal from './modals/actionLogModal.vue';
import batchAddModal from './modals/batchAddModal.vue';

const route = useRoute();
const VxeSelect = VxeUI.getComponent('VxeSelect'); // 获取Vxe的select组件
const urlParams: any = route.meta?.urlParams || {}; // 路由中传递的参数
const ROWKEYFIELD = 'productCode'; // 表格行的唯一Id
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const currentWarehouseInfo = ref<any>({}); // 当前所在仓库信息
const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: currentHandleRow.value.warehouseId || undefined,
});
const gridData = ref<any[]>([]); // 表格数据
const vendorParams = ref<any>(); // 用于查询供应商下拉列表的入参
const handlePrice = (price: any) => {
  // 处理数字或者字符串，返回 val：数字   numberCountAfterDot：小数点后的位数
  let numberCountAfterDot = 0;
  if (typeof price === 'string') {
    numberCountAfterDot = price.includes('.') ? price.split('.')[1]!.length : 0;
    return { val: Number.parseFloat(price), numberCountAfterDot };
  } else if (typeof price === 'number') {
    numberCountAfterDot = String(price).includes('.')
      ? String(price).split('.')[1]!.length
      : 0;
    return { val: price, numberCountAfterDot };
  } else {
    return { val: 0, numberCountAfterDot: 0 };
  }
};
// 生成表格组件和api
const [ChcGrid, chcGridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    submitButtonOptions: {
      show: false,
    },
    resetButtonOptions: {
      show: false,
    },
    showDefaultActions: true,
    showCollapseButton: true,
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
    compact: false,
    schema: [
      {
        component: 'Input',
        fieldName: 'orderPlanNo',
        componentProps: () => {
          return {
            disabled: true,
          };
        },
        defaultValue: currentHandleRow.value!.orderPlanNo || undefined,
        label: $t('purchasePlan.buyPlan.orderNo'),
        formItemClass: 'pb-2',
      },
      {
        component: 'DatePicker',
        fieldName: 'deliveryPlanDate',
        label: $t('purchasePlan.buyPlan.deliveryPlanDate'),
        componentProps: () => {
          return {
            showTime: true,
            format: 'YYYY-MM-DD HH:mm',
            valueFormat: 'YYYY-MM-DD HH:mm',
            disabled: detailConfig.value?.type === 'view',
          };
        },
        defaultValue:
          detailConfig.value?.type === 'add'
            ? dayjs(dayjs().format('YYYY-MM-DD'))
                .add(1, 'day')
                .add(10, 'hour')
                .format('YYYY-MM-DD HH:mm')
            : currentHandleRow.value.deliveryPlanDate,
        formItemClass: 'pb-2',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: detailConfig.value?.type === 'add', // 只有新增场景，才会自动选择第一个
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: `请选择${$t('purchasePlan.buyPlan.warehouseName')}`,
            onChange(val: any, option: any) {
              currentWarehouseInfo.value = option;
              selectParams.value.warehouseId = val;
              if (
                chcSelectRef.value &&
                chcSelectRef.value.fetchApi &&
                typeof chcSelectRef.value.fetchApi === 'function'
              ) {
                chcSelectRef.value.fetchApi();
              }
            },
            showSearch: true,
            paginate: false,
            disabled:
              !!currentHandleRow.value!.warehouseId ||
              blackList.value.length > 0,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
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
        label: $t('purchasePlan.buyPlan.warehouseName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: currentHandleRow.value?.type === 'add',
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            placeholder: `请选择${$t('purchasePlan.buyPlan.applyBPartnerName')}`,
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            // showChooseAll: 'undefined',
            disabled: detailConfig.value?.type === 'view',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue:
          detailConfig.value?.type === 'add'
            ? undefined
            : currentHandleRow.value.applyBPartnerId,
        formItemClass: 'pb-2',
        fieldName: 'applyBPartnerId',
        label: $t('purchasePlan.buyPlan.applyBPartnerName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.priorityRuleName')}`,
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            disabled: detailConfig.value?.type === 'view',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        formItemClass: 'pb-2',
        fieldName: 'priorityRule',
        defaultValue:
          detailConfig.value?.type === 'add'
            ? '5'
            : currentHandleRow.value.priorityRule,
        label: $t('purchasePlan.buyPlan.priorityRuleName'),
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
  gridOptions: {
    keyboardConfig: {
      isEdit: true,
    },
    size: 'small',
    editConfig: {
      enabled: detailConfig.value?.type !== 'view',
      mode: 'row',
      trigger: 'dblclick',
      showStatus: false,
      showIcon: false,
      autoClear: true,
    },
    checkboxConfig: {
      trigger: 'default',
      checkMethod: ({ row }: any) => {
        return row.orderPlanLineId;
      },
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
    columns: [
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
        title: $t('purchasePlan.buyPlan.productCode'),
        align: 'center',
        sortable: true,
      },
      {
        field: 'productName',
        minWidth: 100,
        title: $t('purchasePlan.buyPlan.productName1'),
        sortable: true,
      },
      {
        field: 'productSpec',
        minWidth: 60,
        title: $t('purchasePlan.buyPlan.productSpec'),
        sortable: true,
      },
      {
        field: 'modelNo',
        minWidth: 80,
        title: $t('purchasePlan.buyPlan.modelNo'),
        sortable: true,
      },
      {
        field: 'uomName',
        minWidth: 100,
        title: $t('purchasePlan.buyPlan.uomName'),
        sortable: true,
      },
      {
        field: 'qtyPlaned',
        minWidth: 110,
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange() {
              if (
                chcGridApi.grid.getEditCell() &&
                chcGridApi.grid.getEditCell()!.row
              ) {
                const currentRow = chcGridApi.grid.getEditCell()!.row;
                if (!currentRow) return null;
                if (currentRow.isGift === 'Y') {
                  currentRow.lineAmt = 0;
                  currentRow.price = 0;
                } else {
                  currentRow.price = currentRow.pricePo || currentRow.pricePO;
                  const priceObj = handlePrice(currentRow.price);
                  currentRow.lineAmt =
                    priceObj.numberCountAfterDot > 0
                      ? (priceObj.val *
                          10 ** priceObj.numberCountAfterDot *
                          handlePrice(currentRow.qtyPlaned).val) /
                        10 ** priceObj.numberCountAfterDot
                      : handlePrice(currentRow.qtyPlaned).val * priceObj.val;
                }
              }
            },
          },
        },
        title: $t('purchasePlan.buyPlan.qtyPlaned'),
        sortable: true,
        align: 'right',
      },

      {
        field: 'price',
        minWidth: 90,
        title: $t('purchasePlan.buyPlan.price'),
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'lineAmt',
        minWidth: 80,
        title: $t('purchasePlan.buyPlan.lineAmt'),
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
        align: 'right',
      },
      {
        field: 'vendorId',
        minWidth: 180,
        title: $t('purchasePlan.buyPlan.vendorId'),
        sortable: true,
        formatter: ({ row }: any) => {
          return row.vendorName;
        },
        editRender: {},
        slots: { edit: 'edit_vendorId' },
      },
      {
        field: 'isGift',
        minWidth: 110,
        title: `是否${$t('purchasePlan.buyPlan.isGift')}`,
        sortable: true,
        editRender: {
          name: 'VxeSelect',
          options: [
            { label: '是', value: 'Y' },
            { label: '否', value: 'N' },
          ],
          props: {
            onVisibleChange({ visible }: any) {
              if (!visible) {
                // 获取当前行的isGift字段
                const currentRow = chcGridApi.grid.getEditCell()!.row;
                if (!currentRow) return null;
                if (currentRow && currentRow.isGift === 'Y') {
                  currentRow.lineAmt = 0;
                  currentRow.price = 0;
                } else {
                  currentRow.price = currentRow.pricePo || currentRow.pricePO;
                  const priceObj = handlePrice(currentRow.price);
                  currentRow.lineAmt =
                    priceObj.numberCountAfterDot > 0
                      ? (priceObj.val *
                          10 ** priceObj.numberCountAfterDot *
                          handlePrice(currentRow.qtyPlaned).val) /
                        10 ** priceObj.numberCountAfterDot
                      : handlePrice(currentRow.qtyPlaned).val * priceObj.val;
                }
              }
            },
          },
        },
      },
      {
        field: 'manufacturer',
        minWidth: 120,
        title: $t('purchasePlan.buyPlan.manufacturer'),
        sortable: true,
      },
      {
        field: 'lPackageQty',
        title: $t('purchasePlan.buyPlan.lPackageQty'),
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'mPackageQty',
        title: $t('purchasePlan.buyPlan.mPackageQty'),
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        minWidth: 200,
        title: $t('purchasePlan.buyPlan.qtyOnHand'),
        sortable: true,
      },
      {
        field: 'insurance',
        minWidth: 140,
        title: $t('purchasePlan.buyPlan.ybhcCode'),
        sortable: true,
      },
      {
        field: 'allWarehouseLevelDay',
        title: $t('purchasePlan.buyPlan.level_Day'),
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'level_Max',
        title: $t('purchasePlan.buyPlan.level_Max'),
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'level_Min',
        title: $t('purchasePlan.buyPlan.level_Min'),
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'kf_Day',
        title: $t('purchasePlan.buyPlan.kf_Day'),
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'kf_Max',
        title: $t('purchasePlan.buyPlan.kf_Max'),
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'kf_Min',
        title: $t('purchasePlan.buyPlan.kf_Min'),
        minWidth: 140,
        sortable: true,
      },
      {
        field: 'priceList',
        title: $t('purchasePlan.buyPlan.priceList'),
        minWidth: 90,
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
        align: 'right',
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
    cellStyle(scope: any) {
      if (
        (scope.column.field === 'qtyPlaned' ||
          scope.column.field === 'vendorId' ||
          scope.column.field === 'isGift') &&
        detailConfig.value?.type !== 'view'
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
    editActivated: (scope: any) => {
      vendorParams.value = {
        productId: scope.row.productId,
        isNoProtocolPo: currentWarehouseInfo.value.isNoProtocolPo,
        isBPartnerProductControl:
          currentWarehouseInfo.value.isBPartnerProductControl,
        noProtocolPricePoSource: 'M', // 本字段写死为M
      };
      // 用于获取当前正在操作行和列的赋值
      currentEditRow.value = scope.row;
      currentField.value = scope.column.field;
    },
    editClosed: async ({ row }: any) => {
      currentInsertRows.value = chcGridApi.grid.getInsertRecords();
      currentUpdateRows.value = chcGridApi.grid.getUpdateRecords();
      if (autoSaveController.value === 'onSaving') {
        currentEditRow.value = undefined;
        currentField.value = '';
      } else {
        autoSaveController.value = 'onSaving';
        if (
          chcGridApi.grid.isInsertByRow(row) ||
          chcGridApi.grid.isUpdateByRow(row)
        ) {
          currentEditRow.value = undefined;
          currentField.value = '';
          // 对该行数据进行保存
          handleSaveRow({
            $grid: chcGridApi.grid,
            row,
          })
            .then(() => {
              autoSaveController.value = 'wait';
              currentInsertRows.value = [];
              currentUpdateRows.value = [];
            })
            .catch(() => {
              autoSaveController.value = 'error';
              currentInsertRows.value = [];
              currentUpdateRows.value = [];
            });
        } else {
          autoSaveController.value = 'wait';
        }
      }
    },
  },
});
const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存保存了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});
// 获取保存 删除 提交的基础params数据
const queryparams = (
  type: 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  lineData =
    type === 'saveDo'
      ? JSON.stringify({ created: [], updated: [], removed: [...rows] })
      : JSON.stringify(rows[0]);
  return {
    orderPlanId: currentHandleRow.value.orderPlanId || 0,
    warehouseId: formValues.warehouseId,
    priorityRule: formValues.priorityRule,
    deliveryPlanDate: formValues.deliveryPlanDate,
    applyBPartnerId: formValues.applyBPartnerId,
    description: formValues.description,
    isCrossDocking: urlParams.isCrossDocking,
    isPackaged: urlParams.isPackaged,
    receiptType: urlParams.receiptType,
    isShortPo: urlParams.isShortPo,
    type: urlParams.type,
    lineData,
  };
};
// 通过promise控制临时数据行重新插入
const handleInsertRowsPromise = (row: any) => {
  return new Promise((resolve) => {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    const insertRows = chcGridApi.grid.getInsertRecords();
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD],
      );

      for (const [i, midRow_] of midRows.entries()) {
        const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
        if (i === 0) {
          newRow = midRow.row;
        }
      }
      resolve(newRow);
    }, 0);
  });
};
// 保存行
const handleSaveRow = (scope: any) => {
  return new Promise((resolve, reject) => {
    if (scope.row.qtyPlaned <= 0) {
      chcGridApi.grid.setEditRow(scope.row, true).then(() => {
        // console.log(
        //   'scope.row.qtyPlaned <= 0',
        //   `${scope.row.productCode}---${scope.row.productName}`,
        // );
        message.error('采购数量必须大于零!');
        reject(new Error('采购数量必须大于零!'));
      });
    } else if (scope.row.vendorId) {
      scope.row.loading = true;
      saveRow(scope.row)
        .then(async (res: any) => {
          // console.log('结束保存接口');
          scope.row.loading = false;
          for (const key in res) {
            scope.row[key] = res[key];
          }
          const insertRows = chcGridApi.grid.getInsertRecords();
          await scope.$grid.clearEdit();
          if (insertRows.length === 0) {
            // 当前表格没有插入的临时数据
            const index = gridData.value.findIndex(
              (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
            );
            gridData.value[index] = scope.row;
            chcSelectRef.value.focus();
          } else if (insertRows.length === 1) {
            // 当前表格新插入的临时数据只有一条
            if (scope.$grid.isInsertByRow(scope.row)) {
              // 操作的正是这条临时数据
              const newRow = await scope.$grid.createRow(scope.row);
              gridData.value.push(newRow);
            } else {
              // 操作的不是这条临时数据
              const index = gridData.value.findIndex(
                (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
              );
              gridData.value[index] = scope.row;
              // 再将临时数据插回去
              const insertRow = await handleInsertRowsPromise(scope.row);
              scope.$grid.setEditRow(insertRow, true);
            }
          } else {
            // 当前表格有多条插入的临时数据
            if (scope.$grid.isInsertByRow(scope.row)) {
              // 操作的正是这些临时数据中的一条
              const newRow = await scope.$grid.createRow(scope.row);
              gridData.value.push(newRow);
              // 再将其余临时数据插回去
              const insertRow = await handleInsertRowsPromise(scope.row);
              scope.$grid.setEditRow(insertRow, true);
            } else {
              // 操作的不是临时数据
              const index = gridData.value.findIndex(
                (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
              );
              gridData.value[index] = scope.row;
              // 再将其余临时数据插回去
              const insertRow = await handleInsertRowsPromise(scope.row);
              scope.$grid.setEditRow(insertRow, true);
            }
          }
          resolve(res);
        })
        .catch(async (error) => {
          // console.log('validateRow---error');
          scope.row.loading = false;
          await scope.$grid.setEditRow(scope.row, true);
          // 继续编辑当前行
          reject(error);
        });
    } else {
      chcGridApi.grid.setEditRow(scope.row, true).then(() => {
        message.error('请选择供应商！!');
        reject(new Error('请选择供应商！!'));
      });
    }
  });
};
// 保存行数据接口调用
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    chcGridApi.formApi
      .getValues()
      .then((res) => {
        const params = queryparams('saveLine', res, [row]);
        saveLine(params)
          .then((res) => {
            // 如果原先的 currentHandleRow.value.orderPlanId 没值，说明是新增进来的
            // 此时需要更新 currentHandleRow.value.orderPlanId
            if (!currentHandleRow.value.orderPlanId) {
              currentHandleRow.value = { orderPlanId: res.id };
              chcGridApi.formApi.setFieldValue('orderNo', res.id);
            }
            queryOrderPlanLineInfo({ orderPlanId: res.id, isActive: 'Y' })
              .then(async (resIn) => {
                const newRow = resIn.rows.find(
                  (item: any) => item.orderPlanLineId === res.lineId,
                );
                resolve(newRow);
              })
              .catch((error) => {
                row.loading = false;
                reject(error);
              });
          })
          .catch((error) => {
            // console.log('saveLine:', error);
            row.loading = false;
            reject(error);
          });
      })
      .catch((error) => {
        row.loading = false;
        reject(error);
      });
  });
};
// 点击删除按钮
const handleDeleteRow = async (scope: any) => {
  const handleDelete = () => {
    return new Promise((resolve) => {
      (async () => {
        const insertRows = chcGridApi.grid.getInsertRecords();
        if (scope.row.orderPlanLineId) {
          scope.row.loading = true;
          // 先调接口删行
          await deleteRow(scope.row);
          scope.row.loading = false;
        }
        function handleInsertRows() {
          // 将非当前操作行数据，重新插入表格，并开启新的行编辑
          return new Promise((resolve) => {
            let newRow: any = null;
            setTimeout(async () => {
              const midRows = insertRows.filter(
                (item) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
              );
              if (midRows.length > 0) {
                for (const [i, midRow_] of midRows.entries()) {
                  const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
                  if (i === 0) {
                    newRow = midRow.row;
                  }
                }
                // 聚焦到新插入的数据继续编辑
                chcGridApi.grid.setEditRow(newRow, true);
              } else {
                chcSelectRef.value.focus();
              }
              resolve(true);
            }, 200);
          });
        }

        if (scope.$grid.isInsertByRow(scope.row)) {
          // 当前删除的是插入的临时行
          blackList.value = blackList.value.filter(
            (item) => item !== scope.row[ROWKEYFIELD],
          );
          scope.$grid.remove(scope.row);
          // scope.$grid.remove(scope.row);
          await handleInsertRows();
        } else {
          // 当前删除的不是临时行
          blackList.value = blackList.value.filter(
            (item) => item !== scope.row[ROWKEYFIELD],
          );
          gridData.value.splice(scope.$rowIndex, 1);
          await handleInsertRows();
        }
        resolve(true);
      })();
    });
  };
  // 删除的就是当前操作行 或者 在非编辑状态点击删除，直接删
  autoSaveController.value = 'onSaving';
  await scope.$grid.clearEdit();
  await handleDelete();
  autoSaveController.value = 'wait';
  return null;
};
// 删除接口调用
const deleteRow = (row: any) => {
  return new Promise((resolve) => {
    chcGridApi.formApi.getValues().then((res) => {
      const params = queryparams('saveDo', res, [row]);
      saveDo(params)
        .then((res) => {
          // 如果原先的 currentHandleRow.value.orderPlanId 没值，说明是新增进来的
          // 此时需要更新 currentHandleRow.value.orderPlanId
          resolve(res);
        })
        .catch(() => {
          row.loading = false;
        });
    });
  });
};
// 控制添加商品以及黑名单逻辑
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelectRef = ref(); // 商品选择下拉组件
// 选择一个商品
const handleChoose = async (val: any, option: any) => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelectRef.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelectRef.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    // 先往黑名单里加数据，放后面会造成表格新增数据异常
    blackList.value.push(val);
    await nextTick();
    chcSelectRef.value.modelValue = undefined; // 清空下拉组件
    const formValue = await chcGridApi.formApi.getValues();
    const response = await getOrderPlanStorage({
      warehouseId: formValue.warehouseId,
      productId: option.productId,
    });
    const record = {
      ...option,
      ...response,
      isGift: 'N',
    };
    const { row: newRow } = await chcGridApi.grid.insertAt(record, -1);
    chcGridApi.grid.setEditRow(newRow, true);
  }
};
// 点击批量添加按钮
const handleBatchAdd = async () => {
  function handleOpenAddModal() {
    chcGridApi.formApi.getValues().then((res: any) => {
      batchAddModalApi!
        .setData({
          warehouseId: res.warehouseId,
          replenishSource: 'P',
          handleBatchChoose,
          blackList: blackList.value,
        })
        .open();
    });
  }
  if (
    chcGridApi.grid.getInsertRecords().length === 1 ||
    currentInsertRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体保存');
    handleOpenAddModal();
  } else if (
    chcGridApi.grid.getUpdateRecords().length === 1 ||
    currentUpdateRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体保存');
    handleOpenAddModal();
  } else {
    if (
      chcGridApi.grid.getInsertRecords().length > 0 ||
      currentInsertRows.value.length > 0
    ) {
      await nextTick();
      chcSelectRef.value.modelValue = undefined;
      message.warn('当前表格存在未保存行，请保存后再添加！');
    } else if (
      chcGridApi.grid.getUpdateRecords().length > 0 ||
      currentUpdateRows.value.length > 0
    ) {
      await nextTick();
      chcSelectRef.value.modelValue = undefined;
      message.warn('当前表格存在未保存数据，请保存后再添加！');
    } else {
      handleOpenAddModal();
    }
  }
};
// 处理批量添加事件
const handleBatchChoose = async (records: any[]) => {
  blackList.value = [
    ...blackList.value,
    ...records.map((item) => item[ROWKEYFIELD]),
  ];
  const formValue = await chcGridApi.formApi.getValues();
  let newRow = null;
  for (const [i, record__] of records.entries()) {
    const response = await getOrderPlanStorage({
      warehouseId: formValue.warehouseId,
      productId: record__.productId,
    });
    const record = {
      ...record__,
      ...response,
      isGift: 'N',
    };
    if (i === 0) {
      const midRow = await chcGridApi.grid.insertAt(record, -1);
      newRow = midRow.row;
    } else {
      await chcGridApi.grid.insertAt(record, -1);
    }
  }
  chcGridApi.grid.setEditRow(newRow, true);
};
// 页面初始化加载行数据以及黑名单数据
onMounted(() => {
  if (currentHandleRow.value.orderPlanId) {
    queryOrderPlanLineInfo({
      orderPlanId: currentHandleRow.value.orderPlanId,
      isActive: 'Y',
    }).then(async (res) => {
      if (res.success) {
        let newRow = null;
        for (let i = 0; i < res.rows.length; i++) {
          blackList.value.push(res.rows[i]![ROWKEYFIELD]);
          if (i === 0) {
            newRow = await chcGridApi.grid.createRow(res.rows[i]);
            gridData.value.push(newRow);
          } else {
            const midRow = await chcGridApi.grid.createRow(res.rows[i]);
            gridData.value.push(midRow);
          }
        }
      } else {
        message.error(res.msg);
      }
    });
  }
  window.addEventListener('keydown', handleKeyBoard);
});
// 用于标记产品下拉是否打开，用来自定义下拉开启时的键盘左右箭头操作
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;
};
// 组件销毁
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
// 添加自定义的键盘事件
const handleKeyBoard = async (e: KeyboardEvent) => {
  if (e.ctrlKey && e.code === 'KeyE') {
    e.preventDefault();
    if (chcGridApi.grid.getInsertRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getInsertRecords()[0], true);
    } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getUpdateRecords()[0], true);
    } else {
      return chcSelectRef.value.focus();
    }
  }
  // 当前有正在编辑行，然后点击delete按钮，删除该行
  if (
    e.code === 'Delete' &&
    currentEditRow.value &&
    chcGridApi.grid.isEditByRow(currentEditRow.value)
  ) {
    e.preventDefault();
    handleDeleteRow({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  // 当前有正在编辑行，然后点击enter按钮，退出编辑
  if (
    e.key === 'Enter' &&
    currentEditRow.value &&
    chcGridApi.grid.isEditByRow(currentEditRow.value)
  ) {
    e.preventDefault();
    await chcGridApi.grid.clearEdit();
  }
  // 当前没在做编辑操作
  // if (e.key === 'Enter' && !currentEditRow.value && !searchFocus.value) {
  //   e.preventDefault();
  //   chcSelectRef.value.focus();
  // }
  // 物资下拉打开时点击右箭头
  if (e.code === 'ArrowRight' && selectOpen.value) {
    e.preventDefault();
    chcSelectRef.value.pageChange(chcSelectRef.value.params.current + 1);
  }
  // 物资下拉打开时点击左箭头
  if (e.code === 'ArrowLeft' && selectOpen.value) {
    e.preventDefault();
    chcSelectRef.value.pageChange(chcSelectRef.value.params.current - 1);
  }
};
// 右下角全部 保存 提交 返回功能
const totalHandleLoading = ref(false); // 整体操作loading控制
// 监听一个简单ref数据值的变化，变化后才能继续往下走
const listenDataChangePromise = (
  listenData: Ref, // 监听的数据
  timeout: number = 2000, // 超时时间
  interval: number = 33, // 轮询间隔
) => {
  return new Promise((resolve, reject) => {
    // console.log('初始值：', listenData.value);
    const originData = listenData.value;
    if (originData === 'onSaving') {
      let nowUseTime = 0;
      // 轮询监控某个响应数据是否改变，改变了就resolve(true)，2s钟内未改变，resolve(false)
      const timer = setInterval(() => {
        if (originData !== listenData.value && listenData.value === 'wait') {
          clearInterval(timer);
          // console.log('值变了-wait', originData, listenData.value, nowUseTime);
          resolve(true);
        } else if (
          originData !== listenData.value &&
          listenData.value === 'error'
        ) {
          clearInterval(timer);
          // console.log('值变了-error', originData, listenData.value, nowUseTime);
          reject(new Error('保存失败'));
        }
        nowUseTime += interval;
        if (nowUseTime > timeout) {
          clearInterval(timer);
          resolve(false);
          // reject(new Error('超时'));
        }
      }, interval);
    } else {
      resolve(true);
    }
  });
};
// 整体保存
const handleTotalSave = async () => {
  function totalSave() {
    totalHandleLoading.value = true;
    chcGridApi.formApi.getValues().then((res) => {
      const params = queryparams('saveDo', res, []);
      saveDo(params)
        .then(() => {
          totalHandleLoading.value = false;
          currentTab.value = 0;
        })
        .catch(() => {
          totalHandleLoading.value = false;
        });
    });
  }
  if (
    chcGridApi.grid.getInsertRecords().length === 1 ||
    currentInsertRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体保存');
    totalSave();
  } else if (
    chcGridApi.grid.getUpdateRecords().length === 1 ||
    currentUpdateRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体保存');
    totalSave();
  } else {
    chcGridApi.grid.clearEdit();
    if (
      chcGridApi.grid.getInsertRecords().length > 0 ||
      currentInsertRows.value.length > 0
    ) {
      return message.error('当前表格存在新增行未保存，请保存后再操作！');
    } else if (
      chcGridApi.grid.getUpdateRecords().length > 0 ||
      currentUpdateRows.value.length > 0
    ) {
      return message.error('当前表格存在未保存信息，请保存后再操作！');
    }
    totalSave();
  }
};
// 整体提交
const handleTotalSubmit = async () => {
  function totalSubmit() {
    totalHandleLoading.value = true;
    chcGridApi.formApi.getValues().then((res) => {
      const params = queryparams('saveDo', res, []);
      saveDo({ ...params, doCommit: 'Y' })
        .then(() => {
          totalHandleLoading.value = false;
          currentTab.value = 1;
        })
        .catch(() => {
          totalHandleLoading.value = false;
        });
    });
  }

  if (
    chcGridApi.grid.getInsertRecords().length === 1 ||
    currentInsertRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体提交');
    totalSubmit();
  } else if (
    chcGridApi.grid.getUpdateRecords().length === 1 ||
    currentUpdateRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体提交');
    totalSubmit();
  } else {
    chcGridApi.grid.clearEdit();
    if (
      chcGridApi.grid.getInsertRecords().length > 0 ||
      currentInsertRows.value.length > 0
    ) {
      return message.error('当前表格存在新增行未保存，请保存后再操作！');
    } else if (
      chcGridApi.grid.getUpdateRecords().length > 0 ||
      currentUpdateRows.value.length > 0
    ) {
      return message.error('当前表格存在未保存信息，请保存后再操作！');
    }
    if (gridData.value.length === 0) {
      return message.error('请添加数据后再提交！');
    }
    totalSubmit();
  }
};
// 右上角搜索功能
const searchFocus = ref(false);
const serachInputVal = ref(undefined); // 输入框值
const handleSearch = () => {
  if (serachInputVal.value) {
    // 将所有匹配输入值的项check状态改为选中
    for (let i = 0; i < gridData.value.length; i++) {
      const item = gridData.value[i];
      if (
        (item.productCode && item.productCode.includes(serachInputVal.value)) ||
        (item.productName && item.productName.includes(serachInputVal.value)) ||
        (item.productValue && item.productValue.includes(serachInputVal.value))
      ) {
        chcGridApi.grid.setCheckboxRow(item, true);
        chcGridApi.grid.scrollToRow(item);
      }
    }
  }
};
const handleSearchIpt = (e: any) => {
  serachInputVal.value = e.target.value;
};
const toggleSearchFocus = (val: boolean) => {
  searchFocus.value = val;
};
// 供应商下拉数据源
const vendorOptions = ref<any[]>([]);
// 监控供应商下拉值改变 同时改变该行数据的 vendorName 字段
const handleVendorChange = (val: any, scope: any) => {
  scope.row.vendorName = vendorOptions.value.find((item) => {
    return item.value === val.value;
  }).label;
};
// 监听当前编辑行的变化，只要当前编辑行发生改变，就重新查询供应商下拉数据
watch(
  () => currentEditRow.value,
  (val) => {
    if (val) {
      requestFormClient
        .post('/orderPlanAction/productVendor.do', vendorParams.value)
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
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});
const handleDetail = (scope: any) => {
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
    })
    .open();
};
// 批量删除方法
const handleBatchDel = async () => {
  if (chcGridApi.grid.getCheckboxRecords().length === 0) {
    return message.error('请选中行数据');
  }
  function batchDel() {
    chcGridApi.formApi.getValues().then((res) => {
      const delRows = chcGridApi.grid.getCheckboxRecords().map((item) => {
        return toRaw(item);
      });
      const params = queryparams('saveDo', res, delRows);
      saveDo(params)
        .then(() => {
          blackList.value = blackList.value.filter((item) => {
            return !delRows.some((itemIn) => {
              return itemIn[ROWKEYFIELD] === item;
            });
          });
          gridData.value = gridData.value.filter((item) => {
            if (
              delRows.some((itemIn) => {
                return itemIn[ROWKEYFIELD] === item[ROWKEYFIELD];
              })
            ) {
              chcGridApi.grid.remove(item);
              return false;
            } else {
              return true;
            }
          });
          chcGridApi.grid.reloadData(gridData.value);
        })
        .catch((error) => {
          message.error(error);
        });
    });
  }
  if (
    chcGridApi.grid.getInsertRecords().length === 1 ||
    currentInsertRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体提交');
    batchDel();
  } else if (
    chcGridApi.grid.getUpdateRecords().length === 1 ||
    currentUpdateRows.value.length === 1
  ) {
    // 此时在保存后直接整个保存
    chcGridApi.grid.clearEdit();
    await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
    // console.log('开始整体提交');
    batchDel();
  } else {
    chcGridApi.grid.clearEdit();
    if (
      chcGridApi.grid.getInsertRecords().length > 0 ||
      currentInsertRows.value.length > 0
    ) {
      return message.error('当前表格存在新增行未保存，请保存后再操作！');
    } else if (
      chcGridApi.grid.getUpdateRecords().length > 0 ||
      currentUpdateRows.value.length > 0
    ) {
      return message.error('当前表格存在未保存信息，请保存后再操作！');
    }
    if (gridData.value.length === 0) {
      return message.error('请添加数据后再提交！');
    }
    batchDel();
  }
};
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <BatchAddModal />
    <ChcGrid>
      <template #edit_vendorId="scope">
        <VxeSelect
          v-model="scope.row.vendorId"
          :options="vendorOptions"
          @change="handleVendorChange($event, scope)"
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
          dict-url="/productAction/query.do"
          popup-class-name="productSelection"
          @dropdown-visible-change="handleDropdownVisibleChange"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
          :page-size="25"
          :immediate="false"
          :extra-params="selectParams"
          :black-list="blackList"
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
              width: 160,
            },
            {
              header: '规格',
              name: 'productSpec',
              width: 80,
            },
            {
              header: '型号',
              name: 'modelNo',
              width: 100,
              visible: false,
            },
            {
              header: '单位',
              name: 'uomName',
              width: 80,
            },
            {
              header: '采购价',
              name: 'price',
              width: 80,
            },
            {
              header: '库存',
              name: 'storageQty',
              width: 80,
            },
          ]"
        />
        <Button type="primary" @click="handleBatchAdd" class="mr-[0.5rem]">
          批量添加
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button type="primary" @click="handleBatchDel" class="mr-[0.5rem]">
          批量删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <Input
          @input="handleSearchIpt"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入药品关键词"
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
      </template>
      <template #action="scope">
        <Button
          v-if="detailConfig?.type === 'view'"
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
        >
          操作记录
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          ghost
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailConfig?.type !== 'view'"
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
              @click="handleTotalSave"
              :loading="totalHandleLoading"
              v-if="detailConfig?.type !== 'view'"
            >
              保存
              <template #icon>
                <SvgSaveIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleTotalSubmit"
              :loading="totalHandleLoading"
              v-if="detailConfig?.type !== 'view'"
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
