<script setup lang="ts">
import type { Ref } from 'vue';

import { nextTick, onMounted, onUnmounted, ref, toRaw } from 'vue';
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

import { Button, Input, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { handlePriceToFixedTwo } from '#/utils/util';

import {
  dataCommit,
  getOrderPlanStorage,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
} from './api';
import actionLogModal from './modals/actionLogModal.vue';
import batchAddModal from './modals/batchAddModal.vue';
import codeModal from './modals/codeModal.vue';

const VxeInput = VxeUI.getComponent('VxeInput');
const VxeDatePicker = VxeUI.getComponent('VxeDatePicker');

const route = useRoute();

const urlParams: any = route.meta?.urlParams || {};
const ROWKEYFIELD = 'productCode';
const currentTab = defineModel<number>('currentTab', { required: true });
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
});
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const currentWarehouseInfo = ref<any>({});
const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: undefined,
});
const gridData = ref<any[]>([]);
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
const [ChcGrid, chcGridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    showCollapseButton: false,
    showDefaultActions: false,
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
    compact: false,
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000650',
            defaultValue: currentHandleRow.value!.receiptType || undefined,
            disabled:
              !!currentHandleRow.value!.receiptType ||
              blackList.value.length > 0,
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择入库类型',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'receiptType',
        label: '入库类型',
        formItemClass: 'pb-2',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            defaultValue: currentHandleRow.value!.bpartnerId || undefined,
            disabled:
              !!currentHandleRow.value!.bpartnerId ||
              blackList.value.length > 0,
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '供应商',
        formItemClass: 'pb-2',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: '请选择',
            onChange(val: any, option: any) {
              currentWarehouseInfo.value = option;
              selectParams.value.warehouseId = val;
              if (
                chcSelectRef.value &&
                chcSelectRef.value.fetchApi &&
                typeof chcSelectRef.value.fetchApi === 'function'
              ) {
                chcSelectRef.value.params.size = 25;
                chcSelectRef.value.params.limit = 25;
                chcSelectRef.value.fetchApi();
              }
            },
            showSearch: true,
            defaultValue: currentHandleRow.value!.warehouseId || undefined,
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
        formItemClass: 'pb-2',
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            placeholder: '请选择',
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            defaultValue: currentHandleRow.value!.applyBPartnerId || undefined,
            valueField: 'id',
            // showChooseAll: 'undefined',
            disabled:
              !!currentHandleRow.value!.applyBPartnerId ||
              blackList.value.length > 0,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        formItemClass: 'pb-2',
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000480',
            defaultValue: currentHandleRow.value!.invoiceMethod || undefined,
            disabled: blackList.value.length > 0,
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择开票方式',
            onChange(val: any) {
              disabledNo.value = val === '2';
            },
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'invoiceMethod',
        label: '开票方式',
        formItemClass: 'pb-2',
      },
      {
        component: 'Input',
        fieldName: 'description',
        componentProps: {
          disabled: detailConfig.value?.type !== 'edit',
          defaultValue: currentHandleRow.value!.description || undefined,
        },
        label: '备注',
        formItemClass: 'pb-2',
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
      checkMethod: () => {
        return true;
        // return row.orderPlanLineId;
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
        title: '药品编码',
        align: 'center',
        sortable: true,
      },
      {
        field: 'productName',
        minWidth: 100,
        title: '药品名称',
        sortable: true,
      },
      {
        field: 'productSpec',
        minWidth: 60,
        title: '规格',
        sortable: true,
      },
      {
        field: 'modelNo',
        minWidth: 80,
        title: '型号',
        sortable: true,
        visible: false,
      },
      {
        field: 'uomName',
        minWidth: 100,
        title: '单位',
        sortable: true,
      },
      {
        field: 'qtyArrived',
        minWidth: 110,
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange() {
              const currentRow = chcGridApi.grid.getEditCell()!.row;
              if (!currentRow) return null;
              if (currentRow.isGift === 'Y') {
                currentRow.lineAmt = 0;
                currentRow.priceActual = 0;
              } else {
                currentRow.priceActual =
                  currentRow.pricePo || currentRow.pricePO;
                const priceObj = handlePrice(currentRow.priceActual);
                currentRow.lineAmt =
                  priceObj.numberCountAfterDot > 0
                    ? (priceObj.val *
                        10 ** priceObj.numberCountAfterDot *
                        handlePrice(currentRow.qtyArrived).val) /
                      10 ** priceObj.numberCountAfterDot
                    : handlePrice(currentRow.qtyArrived).val * priceObj.val;
              }
            },
          },
        },
        title: '入库数量',
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceActual',
        minWidth: 90,
        title: '入库单价',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceActual);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 120,
        title: '批号',
        sortable: true,
        editRender: {},
        slots: { edit: 'edit_lot' },
      },
      {
        field: 'guaranteeDate',
        minWidth: 120,
        title: '效期',
        sortable: true,
        editRender: {},
        slots: { edit: 'edit_guaranteeDate' },
      },
      {
        field: 'serNo',
        minWidth: 120,
        title: '序列号',
        sortable: true,
        editRender: {},
        slots: { edit: 'edit_serNo' },
      },
      {
        field: 'taxInvoiceNo',
        minWidth: 120,
        title: '发票号',
        sortable: true,
        // editRender: { name: 'VxeInput' },
        editRender: {},
        slots: { edit: 'edit_taxInvoiceNo' },
      },
      {
        field: 'taxInvoiceDate',
        minWidth: 120,
        title: '发票日期',
        sortable: true,
        // editRender: {
        //   name: 'VxeDatePicker',
        // },
        editRender: {},
        slots: { edit: 'edit_taxInvoiceDate' },
      },
      {
        field: 'lineAmt',
        minWidth: 80,
        title: '金额',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
        align: 'right',
      },
      {
        field: 'manufacturer',
        minWidth: 120,
        title: '生产厂家',
        sortable: true,
      },
      { field: 'lPackageQty', title: '大包装数', minWidth: 90, sortable: true },
      { field: 'mPackageQty', title: '中包装数', minWidth: 90, sortable: true },
      {
        field: 'qtyOnhand',
        minWidth: 200,
        title: '需求库房库存数量',
        sortable: true,
      },
      {
        field: 'insurance',
        minWidth: 140,
        title: '医保药品编码',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        // visible: detailConfig.value?.type === 'edit',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: detailConfig.value?.type === 'view' ? 90 : 140,
      },
    ],
    cellStyle(scope: any) {
      if (
        (scope.column.field === 'qtyArrived' ||
          scope.column.field === 'vendorId' ||
          scope.column.field === 'isGift' ||
          scope.column.field === 'taxInvoiceNo' ||
          scope.column.field === 'taxInvoiceDate' ||
          scope.column.field === 'lot' ||
          scope.column.field === 'guaranteeDate' ||
          scope.column.field === 'serNo') &&
        detailConfig.value?.type !== 'view'
      ) {
        return {
          backgroundColor: '#D7FFF5',
        };
      }
      if (
        scope.column.field === 'priceActual' &&
        scope.row.priceActual !== scope.row.priceList
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
        column.field === 'qtyArrived' ||
        column.field === 'vendorId' ||
        column.field === 'isGift' ||
        column.field === 'taxInvoiceNo' ||
        column.field === 'taxInvoiceDate' ||
        column.field === 'lot' ||
        column.field === 'guaranteeDate' ||
        column.field === 'serNo'
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
      currentEditRow.value = scope.row;
      currentField.value = scope.column.field;
    },
    editClosed: ({ row }: any) => {
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
      // currentEditRow.value = undefined;
      // currentField.value = '';
    },
  },
  // separator: false,
});
const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存保存了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
const currentEditRow = ref<any>();
const currentField = ref('');
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});
// 获取保存 删除 提交的基础params数据
const queryparams = (
  type: 'delete' | 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  // 深度过滤每个行对象中的null和undefined属性
  const filteredRows = rows.map((row) => {
    if (!row) return row;
    return Object.fromEntries(
      Object.entries(row).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );
  });
  console.warn('paramsNewData', filteredRows);
  lineData = JSON.stringify({
    created: type === 'saveLine' ? filteredRows : [],
    updated: type === 'saveDo' ? filteredRows : [],
    removed: type === 'delete' ? filteredRows : [],
  });
  return {
    orderPlanId: currentHandleRow.value.orderPlanId || 0,
    asnId: currentHandleRow.value.asnId || 0,
    warehouseId: formValues.warehouseId,
    priorityRule: formValues.priorityRule,
    deliveryPlanDate: formValues.deliveryPlanDate,
    applyBPartnerId: formValues.applyBPartnerId,
    invoiceMethod: formValues.invoiceMethod,
    description: formValues.description,
    isCrossDocking: urlParams.isCrossDocking,
    isPackaged: urlParams.isPackaged,
    receiptType: urlParams.receiptType,
    isShortPo: urlParams.isShortPo,
    type: urlParams.type,
    asnType: 'PO',
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
    (async () => {
      const formValue = await chcGridApi.formApi.getValues();
      const invoiceMethodLine =
        formValue.invoiceMethod || currentHandleRow.value.invoiceMethod;
      if (!(scope.row.qtyArrived > 0)) {
        message.error('入库数量必须大于零!');
        reject(new Error('入库数量必须大于零!'));
      }
      if (invoiceMethodLine === '1' && !scope.row.taxInvoiceNo) {
        message.error('请输入发票号!');
        reject(new Error('请输入发票号!'));
      }
      if (invoiceMethodLine === '1' && !scope.row.taxInvoiceDate) {
        message.error('请输入发票日期!');
        reject(new Error('请输入发票日期!'));
      }
      if (!scope.row.lot) {
        message.error('请输入批号!');
        reject(new Error('请输入批号!'));
      }
      if (!scope.row.guaranteeDate) {
        message.error('请输入效期!');
        reject(new Error('请输入效期!'));
      }
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
          scope.row.loading = false;
          await scope.$grid.setEditRow(scope.row, true);
          // 继续编辑当前行
          reject(error);
        });
    })();
  });
};
// 保存行数据接口调用
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    chcGridApi.formApi
      .getValues()
      .then(async (res) => {
        if (row.asnLineId) {
          const params = queryparams('saveDo', res, [row]);
          const paramsNew = {
            ...params,
            receiptType: res.receiptType || currentHandleRow.value.receiptType,
            description: res.description || currentHandleRow.value.description,
            warehouseId: res.warehouseId || currentHandleRow.value.warehouseId,
            applyBPartnerId:
              res.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
            invoiceMethod:
              res.invoiceMethod || currentHandleRow.value.invoiceMethod,
            bpartnerId: res.bpartnerId || currentHandleRow.value.bpartnerId,
            asnType: 'PO',
            asnLineId: row.asnLineId,
          };
          // 过滤掉paramsNew中的null和undefined值
          const paramsNewFiltered = Object.fromEntries(
            Object.entries(paramsNew).filter(
              ([_, value]) => value !== null && value !== undefined,
            ),
          );
          // temAsnLineId
          console.warn('params', paramsNewFiltered);
          saveLine(paramsNewFiltered)
            .then((res) => {
              if (res && res.success) {
                // 如果原先的 currentHandleRow.value.orderPlanId/asnId没值，说明是新增进来的
                // 此时需要更新 currentHandleRow.value.orderPlanId/asnId
                if (!currentHandleRow.value.asnId) {
                  currentHandleRow.value = { asnId: res.data.header.asnId };
                  chcGridApi.formApi.setFieldValue(
                    'asnId',
                    res.data.header.asnId,
                  );
                }
                // asnId: currentHandleRow.value.asnId,
                queryOrderPlanLineInfo({ asnId: res.data.header.asnId })
                  .then(async (resIn) => {
                    const newRow = resIn.rows.find(
                      (item: any) => item.asnLineId === res.data.lines[0],
                      // (item: any) => item.orderPlanLineId === res.lineId,
                    );
                    resolve(newRow);
                  })
                  .catch((error) => {
                    row.loading = false;
                    reject(error);
                  });
              }
            })
            .catch((error) => {
              row.loading = false;
              reject(error);
            });
        } else {
          const params = queryparams('saveLine', res, [row]);
          const formValue = await chcGridApi.formApi.getValues();
          const paramsNew = {
            ...params,
            receiptType:
              formValue.receiptType || currentHandleRow.value.receiptType,
            description:
              formValue.description || currentHandleRow.value.description,
            warehouseId:
              formValue.warehouseId || currentHandleRow.value.warehouseId,
            applyBPartnerId:
              formValue.applyBPartnerId ||
              currentHandleRow.value.applyBPartnerId,
            invoiceMethod:
              formValue.invoiceMethod || currentHandleRow.value.invoiceMethod,
            bpartnerId:
              formValue.bpartnerId || currentHandleRow.value.bpartnerId,
            asnType: 'PO',
          };
          // 过滤掉paramsNew中的null和undefined值
          const paramsNewFiltered = Object.fromEntries(
            Object.entries(paramsNew).filter(
              ([_, value]) => value !== null && value !== undefined,
            ),
          );
          // temAsnLineId
          console.warn('params', paramsNewFiltered);

          saveLine(paramsNewFiltered)
            .then((res) => {
              // 如果原先的 currentHandleRow.value.orderPlanId/asnId没值，说明是新增进来的
              // 此时需要更新 currentHandleRow.value.orderPlanId/asnId
              if (!currentHandleRow.value.asnId) {
                currentHandleRow.value = { asnId: res.data.header.asnId };
                chcGridApi.formApi.setFieldValue(
                  'asnId',
                  res.data.header.asnId,
                );
              }
              // asnId: currentHandleRow.value.asnId,
              queryOrderPlanLineInfo({ asnId: res.data.header.asnId })
                .then(async (resIn) => {
                  const newRow = resIn.rows.find(
                    (item: any) => item.asnLineId === res.data.lines[0],
                    // (item: any) => item.orderPlanLineId === res.lineId,
                  );
                  resolve(newRow);
                })
                .catch((error) => {
                  row.loading = false;
                  reject(error);
                });
            })
            .catch((error) => {
              row.loading = false;
              reject(error);
            });
        }
      })
      .catch((error) => {
        row.loading = false;
        reject(error);
      });
  });
};
const deleteRow = (row: any) => {
  return new Promise((resolve) => {
    chcGridApi.formApi.getValues().then(async (res) => {
      const params = queryparams('delete', res, [row]);
      const formValue = await chcGridApi.formApi.getValues();
      const paramsNew = {
        ...params,
        receiptType:
          formValue.receiptType || currentHandleRow.value.receiptType,
        description:
          formValue.description || currentHandleRow.value.description,
        warehouseId:
          formValue.warehouseId || currentHandleRow.value.warehouseId,
        applyBPartnerId:
          formValue.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
        invoiceMethod:
          formValue.invoiceMethod || currentHandleRow.value.invoiceMethod,
        bpartnerId: formValue.bpartnerId || currentHandleRow.value.bpartnerId,
        asnType: 'PO',
      };
      // 过滤掉paramsNew中的null和undefined值
      const paramsNewFiltered = Object.fromEntries(
        Object.entries(paramsNew).filter(
          ([_, value]) => value !== null && value !== undefined,
        ),
      );
      saveDo(paramsNewFiltered)
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

const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelectRef = ref();
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
    // 验证必填字段
    const temFormData = await chcGridApi.formApi.getValues();
    const formValues: { [key: string]: any } = {
      warehouseId:
        temFormData.warehouseId || currentHandleRow.value.warehouseId,
      applyBPartnerId:
        temFormData.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
      bpartnerId: temFormData.bpartnerId || currentHandleRow.value.bpartnerId,
      receiptType:
        temFormData.receiptType || currentHandleRow.value.receiptType,
      invoiceMethod:
        temFormData.invoiceMethod || currentHandleRow.value.invoiceMethod,
      invoiceType:
        temFormData.invoiceType || currentHandleRow.value.invoiceType,
    };
    console.warn('验证必填字段:', formValues);
    const requiredFields = [
      { field: 'receiptType', label: '入库类型' },
      { field: 'bpartnerId', label: '供应商' },
      { field: 'warehouseId', label: '采购仓库' },
      { field: 'applyBPartnerId', label: '需求仓库' },
      { field: 'invoiceMethod', label: '开票方式' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formValues[field]) {
        await nextTick();
        chcSelectRef.value.modelValue = undefined;
        message.warning(`请先选择${label}`);
        return;
      }
    }

    // 验证通过后执行添加逻辑
    // 先往黑名单里加数据，放后面会造成表格新增数据异常
    blackList.value.push(val);
    await nextTick();
    chcSelectRef.value.modelValue = undefined; // 清空下拉组件
    const response = await getOrderPlanStorage({
      warehouseId: formValues.warehouseId || currentHandleRow.value.warehouseId,
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
const handleBatchChoose = async (records: any[]) => {
  const temFormData = await chcGridApi.formApi.getValues();
  const formValues: { [key: string]: any } = {
    warehouseId: temFormData.warehouseId || currentHandleRow.value.warehouseId,
    applyBPartnerId:
      temFormData.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
    bpartnerId: temFormData.bpartnerId || currentHandleRow.value.bpartnerId,
    receiptType: temFormData.receiptType || currentHandleRow.value.receiptType,
    invoiceMethod:
      temFormData.invoiceMethod || currentHandleRow.value.invoiceMethod,
    invoiceType: temFormData.invoiceType || currentHandleRow.value.invoiceType,
  };
  console.warn('验证必填字段:', formValues);
  const requiredFields = [
    { field: 'receiptType', label: '入库类型' },
    { field: 'bpartnerId', label: '供应商' },
    { field: 'warehouseId', label: '采购仓库' },
    { field: 'applyBPartnerId', label: '需求仓库' },
    { field: 'invoiceMethod', label: '开票方式' },
  ];

  for (const { field, label } of requiredFields) {
    if (!formValues[field]) {
      await nextTick();
      chcSelectRef.value.modelValue = undefined;
      message.warning(`请先选择${label}`);
      return;
    }
  }

  blackList.value = [
    ...blackList.value,
    ...records.map((item) => item[ROWKEYFIELD]),
  ];
  const formValue = await chcGridApi.formApi.getValues();
  let newRow = null;
  for (const [i, record__] of records.entries()) {
    const response = await getOrderPlanStorage({
      warehouseId: formValue.warehouseId || currentHandleRow.value.warehouseId,
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
const hasEditStatus = (row: any) => {
  return chcGridApi.grid?.isEditByRow(row);
};
const disabledNo = ref(false);
onMounted(() => {
  console.warn('currentHandleRow.value:', currentHandleRow.value);
  disabledNo.value = currentHandleRow.value.invoiceMethod === '2';
  if (currentHandleRow.value.asnId) {
    queryOrderPlanLineInfo({
      asnId: currentHandleRow.value.asnId,
      // isActive: 'Y',
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
  selectParams.value.warehouseId = currentHandleRow.value!.warehouseId;
  window.addEventListener('keydown', handleKeyBoard);
});
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  // 在下拉框打开时验证表单字段

  selectOpen.value = !!open;
};
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
const totalHandleLoading = ref(false);
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
const handleTotalSave = async () => {
  function totalSave() {
    totalHandleLoading.value = true;
    const tableData = chcGridApi.grid.getData();
    chcGridApi.formApi.getValues().then(async (res) => {
      const params = queryparams('saveDo', res, tableData);
      const formValue = await chcGridApi.formApi.getValues();
      const paramsNew = {
        ...params,
        receiptType:
          formValue.receiptType || currentHandleRow.value.receiptType,
        warehouseId:
          formValue.warehouseId || currentHandleRow.value.warehouseId,
        applyBPartnerId:
          formValue.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
        invoiceMethod:
          formValue.invoiceMethod || currentHandleRow.value.invoiceMethod,
        bpartnerId: formValue.bpartnerId || currentHandleRow.value.bpartnerId,
        description:
          formValue.description || currentHandleRow.value.description,
        asnType: 'PO',
      };
      console.warn('params', paramsNew);
      saveDo(paramsNew)
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
const handleTotalSubmit = async () => {
  function totalSubmit() {
    totalHandleLoading.value = true;
    dataCommit({ asnId: currentHandleRow.value.asnId })
      .then(() => {
        totalHandleLoading.value = false;
        currentTab.value = 1;
      })
      .catch(() => {
        totalHandleLoading.value = false;
      });
  }
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    return message.error('当前表格存在未保存信息，请保存后再操作！');
  }
  if (gridData.value.length === 0) {
    return message.error('请添加数据后再提交！');
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
const searchFocus = ref(false);
const serachInputVal = ref(undefined);
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
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});
const handleDetail = (scope: any) => {
  console.warn('scope', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.asnLineId,
    })
    .open();
};
const handleCodeChoose = async (records: any[]) => {
  console.warn('records', records);
};
const [CodeModal, codeModalApi] = useVbenModal({
  connectedComponent: codeModal,
});
const handleCode = (scope: any) => {
  console.warn('scope', scope);
  codeModalApi!
    .setData({
      warehouseId: scope.row.warehouseId,
      productCode: scope.row.productCode,
      productName: scope.row.productName,
      asnLineId: scope.row.asnLineId,
      lot: scope.row.lot,
      guaranteeDate: scope.row.guaranteeDate,
      replenishSource: 'P',
      type: detailConfig.value?.type,
      handleCodeChoose,
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
      const params = queryparams('delete', res, delRows);
      const paramsNew = {
        ...params,
        receiptType: res.receiptType || currentHandleRow.value.receiptType,
        description: res.description || currentHandleRow.value.description,
        warehouseId: res.warehouseId || currentHandleRow.value.warehouseId,
        applyBPartnerId:
          res.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
        invoiceMethod:
          res.invoiceMethod || currentHandleRow.value.invoiceMethod,
        bpartnerId: res.bpartnerId || currentHandleRow.value.bpartnerId,
        asnType: 'PO',
      };
      // 过滤掉paramsNew中的null和undefined值
      const paramsNewFiltered = Object.fromEntries(
        Object.entries(paramsNew).filter(
          ([_, value]) => value !== null && value !== undefined,
        ),
      );
      saveDo(paramsNewFiltered)
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
    <CodeModal />
    <ChcGrid>
      <template #edit_taxInvoiceNo="scope">
        <VxeInput v-model="scope.row.taxInvoiceNo" :disabled="disabledNo" />
      </template>
      <template #edit_lot="scope">
        <VxeInput v-model="scope.row.lot" />
      </template>
      <template #edit_serNo="scope">
        <VxeInput v-model="scope.row.serNo" />
      </template>
      <template #edit_taxInvoiceDate="scope">
        <VxeDatePicker
          v-model="scope.row.taxInvoiceDate"
          :disabled="disabledNo"
        />
      </template>
      <template #edit_guaranteeDate="scope">
        <VxeDatePicker v-model="scope.row.guaranteeDate" />
      </template>
      <template #toolbar-actions v-if="detailConfig?.type === 'edit'">
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
              name: 'priceActual',
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
        <Button type="primary" @click="handleSearch">搜索</Button>
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
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailConfig?.type === 'edit'"
        >
          删行
        </Button>
        <!--   v-if="detailConfig?.type === 'edit'" -->
        <Button
          type="primary"
          v-if="!hasEditStatus(scope.row)"
          style="background-color: #b17a33d4"
          @click="handleCode(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
        >
          追溯码
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
