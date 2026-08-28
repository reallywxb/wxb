<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
  SvgBackIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';

import { Button, Input, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { handlePriceToFixedTwo } from '#/utils/util';

import {
  getOrderPlanStorage,
  queryOrderLineInfo,
  saveDo,
  saveLine,
} from './api';
import actionLogModal from './modals/actionLogModal.vue';
import batchAddModal from './modals/batchAddModal.vue';

const ROWKEYFIELD = 'productCode'; // 表格行的唯一Id
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  showStorage: urlParamsObj?.showStorage || 'N',
  isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
  showPrice: urlParamsObj?.showPrice || 'Y',
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  specShowType: urlParamsObj?.specShowType || '',
};
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); //

const currentWarehouseInfo = ref<any>({});
const selectParams = ref<{ [key: string]: any }>({
  // replenishSource: 'P',
  isReplenish: 'Y',
  showVendorName: 'N',
  productControlLevel: undefined,
  // warehouseId: currentHandleRow.value.warehouseId || undefined,
});
const gridData = ref<any[]>([]);
const vendorParams = ref<any>();
const departmentId = ref<number | string>('');

const handlePrice = (price: any) => {
  if (typeof price === 'string') {
    return Number.parseFloat(price);
  } else if (typeof price === 'number') {
    return price;
  } else {
    return 0;
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
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            disabled:
              !!currentHandleRow.value!.toWarehouseId ||
              blackList.value.length > 0,
            defaultValue: currentHandleRow.value!.toWarehouseId || undefined,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              // selectController.sign();
            },
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'toWarehouseId',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            disabled:
              !!currentHandleRow.value!.departmentId ||
              blackList.value.length > 0,
            defaultValue: currentHandleRow.value!.departmentName || undefined,

            placeholder: '请选择院区',
            paginate: false,
            allowClear: true,
            showChooseAll: '',
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('departmentId', val, option);
              departmentId.value = val;
              // selectController.sign();
            },
            // mode: 'multiple',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // if (!departmentId.value) {
              //   chcGridApi.formApi.getFieldComponentRef(
              //     'warehouseId',
              //   ).params.dependencies = {
              //     regionId: -1,
              //     departmentId: -1,
              //   };
              //   chcGridApi.formApi
              //     ?.getFieldComponentRef('warehouseId')
              //     ?.fetchApi();
              // }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择采购仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            disabled:
              !!currentHandleRow.value!.warehouseId ||
              blackList.value.length > 0,
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: currentHandleRow.value!.warehouseId
              ? currentHandleRow.value.targetWarehouse
              : undefined,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            console.warn(values);
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              chcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // fieldName: 'warehouseId',
        fieldName: 'warehouseId',
        label: '上级仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // defaultValue: '',
            options: [
              { value: 'SZ', label: '有库存或直配品种' },
              { value: 'S', label: '有库存' },
              { value: 'Z', label: '直配品种' },
            ],

            showChooseAll: '',
            placeholder: '请选择自定义条件',
            paginate: false,
            filterByFrontEnd: true,
            labelField: 'name',
            valueField: 'value',
            immediate: true,
            allowClear: true,
          };
        },

        fieldName: 'isPrecious',
        label: '自定义条件',
      },

      {
        component: 'ChcSelect',
        // componentProps: () => {
        //   return {
        //     dictUrl: `/productAction/productControlLevelList.do`,
        // apiType: 'post',
        // requestContentType: 'application/x-www-form-urlencoded',
        //     // showSearch: true,
        //     triggerFields: ['warehouseId'],
        //     //  disabled:
        //     //   !!currentHandleRow.value!.warehouseId ||
        //     //   blackList.value.length > 0,
        //     placeholder: '请选择商品组',
        //     paginate: false,
        //     allowClear: true,
        //     // filterByFrontEnd: true,
        //     immediate: true,
        //     labelField: 'name',
        //     valueField: 'id',
        //     afterFetch(res: any) {
        //       return { ...res, rows: undefined, records: res.rows };
        //     },
        //   };
        // },
        // dependencies: {
        //   triggerFields: ['warehouseId'],
        //   trigger(values) {
        //     console.warn(values);
        //     if (
        //       chcGridApi.formApi?.getFieldComponentRef &&
        //       typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
        //       chcGridApi.formApi?.getFieldComponentRef('productControlLevel') &&
        //       chcGridApi.formApi?.getFieldComponentRef('productControlLevel')
        //         .params
        //     ) {
        //       chcGridApi.formApi.getFieldComponentRef(
        //         'productControlLevel',
        //       ).params.dependencies = {
        //         departmentId: values.departmentId,
        //       };
        //       console.log(99999);

        //       chcGridApi.formApi
        //         ?.getFieldComponentRef('productControlLevel')
        //         ?.fetchApi();
        //       chcGridApi.formApi?.setFieldValue(
        //         'productControlLevel',
        //         undefined,
        //       );
        //     }
        //   },
        // },
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/productAction/productControlLevelList.do',
            // showSearch: true,
            placeholder: '请选择商品组',
            triggerFields: ['warehouseId'],
            paginate: false,
            allowClear: true,
            disabled:
              !!currentHandleRow.value!.productControlLevel ||
              blackList.value.length > 0,
            defaultValue: currentHandleRow.value!.productControlLevelName
              ? currentHandleRow.value.productControlLevelName
              : undefined,
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values) {
            console.warn(values);
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('productControlLevel') &&
              chcGridApi.formApi?.getFieldComponentRef('productControlLevel')
                .params
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'productControlLevel',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
              };

              chcGridApi.formApi
                ?.getFieldComponentRef('productControlLevel')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue(
                'productControlLevel',
                undefined,
              );
            }
          },
        },
        fieldName: 'productControlLevel',
        label: '商品组',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            disabled:
              !!currentHandleRow.value!.priorityRule ||
              blackList.value.length > 0,
            defaultValue: currentHandleRow.value!.priorityRule || undefined,
            placeholder: '请选择优先级',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',

            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'vendorId',
        label: '优先级',
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '备注',
        componentProps: {
          defaultValue: currentHandleRow.value!.description || undefined,
          placeholder: '请输入备注',
        },
      },
    ],
  },
  gridOptions: {
    id: 'detailTbale',
    keyboardConfig: {
      // isTab: true,
      // isEdit: true,
      // isArrow: true,
      // isEnter: true,
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
      trigger: 'row',
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
        minWidth: 120,
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
        field: 'medicineName',
        minWidth: 180,
        title: '通用名',
        sortable: true,
      },
      {
        field: 'productSpec',
        minWidth: 100,
        title: '规格',
        sortable: true,
        visible: false,
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
        minWidth: 130,
        title: '厂家',
        sortable: true,
      },
      {
        field: 'uomName',
        minWidth: 80,
        title: '单位',
        sortable: true,
      },
      {
        field: 'currentPricePo',
        title: '价格',
        width: 80,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentPricePo);
        },
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        minWidth: 110,
        align: 'right',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange() {
              const currentRow = chcGridApi.grid.getEditCell()!.row;
              if (!currentRow) return null;
              if (currentRow.isGift === 'Y') {
                currentRow.lineAmt = handlePrice(currentRow.qtyOrdered) * 0;
                currentRow.currentPriceAmt = 0;
              } else {
                currentRow.currentPriceAmt = handlePrice(
                  currentRow.currentPricePo || currentRow.pricePO,
                );
                currentRow.lineAmt =
                  handlePrice(currentRow.qtyOrdered) *
                  handlePrice(currentRow.price);
              }
            },
          },
        },
        title: '申请数量',
        sortable: true,
      },

      {
        field: 'currentPriceAmt',
        minWidth: 80,
        title: '金额',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentPriceAmt);
        },
        sortable: true,
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        width: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'mPackageQty',
        title: '中包装数',
        align: 'right',
        width: 80,
      },
      {
        field: 'qtyOnHand',
        title: '库存数量',
        align: 'right',
        width: 90,
      },
      {
        field: 'qtyShipment',
        title: '流水数量',
        align: 'right',
        width: 90,
      },
      {
        field: 'qtyOnHandFrom',
        title: '上级库库存',
        align: 'right',
        // hidden : showStorage=='N',
        visible: urlParams.showStorage !== 'N',
        width: 90,
      },
      {
        field: 'qtyApplied',
        title: '月度计划数量',
        align: 'right',
        // hidden : isUseMonthlyWO=='N',
        visible: urlParams.isUseMonthlyWO !== 'N',
        width: '120',
      },
      {
        field: 'monthQtyOrdered',
        title: '本月请领数量',
        align: 'right',
        // hidden : isUseMonthlyWO=='N',
        visible: urlParams.isUseMonthlyWO !== 'N',
        width: '120',
      },
      {
        field: 'qtyLeft',
        title: '剩余数量',
        align: 'right',
        // hidden : isUseMonthlyWO=='N',
        visible: urlParams.isUseMonthlyWO !== 'N',
        width: '120',
      },
      {
        field: 'description',
        title: '备注',
        editRender: {
          name: 'VxeInput',
        },
        width: '150px',

        // edit: 'text'
      },
      //   {
      // field: "productValue",
      // width: "150",
      // hidden: true
      // }

      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: detailConfig.value?.type === 'view' ? '' : '操作',
        width: detailConfig.value?.type === 'view' ? 10 : 230,
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
      currentEditRow.value = scope.row;
      currentField.value = scope.column.field;
    },
    editClosed: () => {
      currentEditRow.value = undefined;
      currentField.value = '';
    },
  },
  // separator: false,
});
const currentEditRow = ref<any>();
const currentField = ref('');
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});
// const handleClose = () => {
//   currentTab.value = 0;
// };
// 获取保存 删除 提交的基础params数据
const queryparams = (
  type: 'delete' | 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  rows.forEach((item) => {
    item.toWarehouseId = formValues.toWarehouseId;
  });
  const filteredRows = rows.map((row) => {
    if (!row) return row;
    return Object.fromEntries(
      Object.entries(row).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );
  });

  lineData = JSON.stringify({
    created: type === 'saveLine' ? filteredRows : [],
    updated: type === 'saveDo' ? filteredRows : [],
    removed: type === 'delete' ? filteredRows : [],
  });

  return {
    orderId: currentHandleRow.value.orderId || 0,
    asnId: currentHandleRow.value.asnId || 0,
    warehouseId: formValues.warehouseId || currentHandleRow.value.warehouseId,
    toWarehouseId:
      formValues.toWarehouseId || currentHandleRow.value.toWarehouseId,
    specWarehouseId:
      formValues.toWarehouseId || currentHandleRow.value.toWarehouseId,
    departmentId:
      formValues.departmentId || currentHandleRow.value.departmentId,
    isPrecious: formValues.isPrecious || currentHandleRow.value.isPrecious,
    vendorId: formValues.vendorId || currentHandleRow.value.vendorId,
    productControlLevel:
      formValues.productControlLevel ||
      currentHandleRow.value.productControlLevel,
    orderType: 'WO',
    returnDoc: 'N',
    isReplenish: 'Y',
    description: formValues.description || currentHandleRow.value.description,
    isPackaged: 'N',
    lineData,
  };
};
const deleteRow = (row: any) => {
  return new Promise((resolve) => {
    chcGridApi.formApi.getValues().then((res) => {
      const params = queryparams('delete', res, [row]);
      saveDo(params)
        .then((res) => {
          // 如果原先的 currentHandleRow.value.orderId 没值，说明是新增进来的
          // 此时需要更新 currentHandleRow.value.orderId
          resolve(res);
        })
        .catch(() => {
          row.loading = false;
        });
    });
  });
};
const handleDeleteRow = async (scope: any) => {
  const insertRows = chcGridApi.grid.getInsertRecords();
  const updateRows = chcGridApi.grid.getUpdateRecords();
  // 由于删行会造成编辑信息丢失，因此未保存行编辑信息的情况下，不允许删行
  if (updateRows.length > 1) {
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }
  if (scope.row.orderLineId) {
    scope.row.loading = true;
    // 先调接口删行
    await deleteRow(scope.row);
    scope.row.loading = false;
  } else {
    // 此时还没与任何保存数据
  }
  await scope.$grid.clearEdit();

  function handleInsertRows() {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
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
        continuEdit(scope.row);
      }
    }, 0);
  }

  if (scope.$grid.isInsertByRow(scope.row)) {
    // 当前删除的是插入的临时行
    scope.$grid.remove(scope.row);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  } else {
    // 当前删除的不是临时行
    gridData.value.splice(scope.$rowIndex, 1);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  }
};
const handleEdit = (scope: any) => {
  chcGridApi.grid.setEditRow(scope.row, true);
};
const handleSave = async (scope: any) => {
  if (!(scope.row.qtyOrdered > 0)) {
    return message.error('申请数量必须大于零!');
  }
  // 此处需要获取所有的临时行，在保存后，将未保存的临时行，重新添加到表格
  const insertRows = chcGridApi.grid.getInsertRecords();
  // 由于保存行会造成编辑信息丢失，因此未保存行编辑信息的情况下，不允许删行
  const updateRows = chcGridApi.grid.getUpdateRecords();
  console.warn(updateRows, insertRows, '333');

  if (updateRows.length > 1) {
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }
  scope.row.loading = true;
  // 先调接口
  const newRow: any = await validateRow(scope.row);
  scope.row.loading = false;
  for (const key in newRow) {
    scope.row[key] = newRow[key];
  }
  await scope.$grid.clearEdit();
  function handleInsertRows() {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
      );
      for (const [i, midRow_] of midRows.entries()) {
        const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
        if (i === 0) {
          newRow = midRow.row;
        }
      }
      // 聚焦到新插入的数据继续编辑
      chcGridApi.grid.setEditRow(newRow, true);
    }, 0);
  }

  if (insertRows.length === 0) {
    // 当前表格没有插入的临时数据
    const index = gridData.value.findIndex(
      (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
    );
    gridData.value[index] = scope.row;
    // 此时要回到选择物资下拉框
    continuEdit(scope.row);
  } else if (insertRows.length === 1) {
    // 当前表格新插入的临时数据只有一条
    if (scope.$grid.isInsertByRow(scope.row)) {
      // 操作的正是这条临时数据
      const newRow = await scope.$grid.createRow(scope.row);
      gridData.value.push(newRow);
      continuEdit(scope.row);
    } else if (scope.$grid.isUpdateByRow(scope.row)) {
      // 操作的不是这条临时数据
      const index = gridData.value.findIndex(
        (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
      );
      gridData.value[index] = scope.row;
      handleInsertRows();
    }
  } else {
    // 当前表格有多条插入的临时数据
    if (scope.$grid.isInsertByRow(scope.row)) {
      // 操作的正是这些临时数据中的一条
      const newRow = await scope.$grid.createRow(scope.row);
      gridData.value.push(newRow);
      handleInsertRows();
    } else if (scope.$grid.isUpdateByRow(scope.row)) {
      // 操作的不是临时数据
      const index = gridData.value.findIndex(
        (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
      );
      gridData.value[index] = scope.row;
      handleInsertRows();
    }
  }
};
const validateRow = (row: any) => {
  return new Promise((resolve) => {
    chcGridApi.formApi
      .getValues()
      .then((res) => {
        console.warn(res, 'res');
        console.warn('validateRow-validateRow:', currentEditRow.value, res);

        const params = queryparams(
          row.orderLineId ? 'saveDo' : 'saveLine',
          res,
          [row],
        );
        saveLine(params)
          .then((res) => {
            // 如果原先的 currentHandleRow.value.orderId 没值，说明是新增进来的
            // 此时需要更新 currentHandleRow.value.orderId
            if (!currentHandleRow.value.orderId) {
              currentHandleRow.value.orderId = res.data.header.id;
              chcGridApi.formApi.setFieldValue('orderId', res.id);
            }
            console.warn(res, 'res');

            queryOrderLineInfo({ orderId: res.data.header.id }).then(
              async (resIn) => {
                const newRow = resIn.rows.find(
                  (item: any) => item.orderLineId === res.orderLineId,
                );
                resolve(newRow);
              },
            );
          })
          .catch(() => {
            row.loading = false;
          });
      })
      .catch(() => {
        row.loading = false;
      });
  });
};
const handleCalcel = async (scope: any) => {
  await scope.$grid.clearEdit();
  scope.$grid.revertData(scope.row);
};
const handleBatchAdd = async () => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    chcGridApi.formApi.getValues().then((res: any) => {
      batchAddModalApi!
        .setData({
          warehouseId: res.toWarehouseId,
          productControlLevel: res.productControlLevel,
          replenishSource: 'P',
          showStorage: urlParams.showStorage,
          showPrice: urlParams.showPrice,
          fromWarehouseId: res.warehouseId,
          specWarehouseId:
            urlParams.specShowType === 'from'
              ? res.warehouseId
              : res.toWarehouseId,
          otherValue: res.isPrecious,
          handleBatchChoose,
          blackList: blackList.value,
        })
        .open();
    });
  }
};
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelect = ref();
const handleChoose = async (val: any, option: any) => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    // 验证必填字段
    const temFormData = await chcGridApi.formApi.getValues();
    const formValues = {
      toWarehouseId:
        temFormData.toWarehouseId || currentHandleRow.value.toWarehouseId,
      departmentId:
        temFormData.departmentId || currentHandleRow.value.departmentId,
      warehouseId:
        temFormData.warehouseId || currentHandleRow.value.warehouseId,
      isPrecious: temFormData.isPrecious || currentHandleRow.value.isPrecious,
      vendorId: temFormData.vendorId || currentHandleRow.value.vendorId,
    };
    console.warn('验证必填字段:', formValues);
    const requiredFields = [
      { field: 'toWarehouseId', label: '申请仓库' },
      { field: 'departmentId', label: '院区' },
      { field: 'warehouseId', label: '上级仓库' },
      { field: 'vendorId', label: '优先级' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formValues[field]) {
        await nextTick();
        chcSelect.value.modelValue = undefined;
        message.warning(`请先选择${label}`);
        return;
      }
    }
    // 先往黑名单里加数据，放后面会造成表格新增数据异常
    blackList.value.push(val);
    await nextTick();
    chcSelect.value.modelValue = undefined; // 清空下拉组件
    // const formValue = await chcGridApi.formApi.getValues();

    const response = await getOrderPlanStorage({
      warehouseId: formValues.toWarehouseId,
      specWarehouseId:
        urlParams.specShowType === 'from'
          ? formValues.warehouseId
          : formValues.toWarehouseId,
      fromWarehouseId: formValues.warehouseId,
      productId: option.productId,
    });
    const record = {
      ...option,
      ...response,
      currentPricePo: option.pricePO,
      currentPriceAmt: 0,
      qtyOnHand: response.storageQty,
      qtyOnHandFrom: response.storageQtyFrom,
      isGift: 'N',
    };
    const { row: newRow } = await chcGridApi.grid.insertAt(record, -1);
    chcGridApi.grid.setEditRow(newRow, true);
  }
};

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
      currentPricePo: record__.pricePO,
      currentPriceAmt: record__.pricePO,
      qtyOnHand: response.storageQty,
      qtyOnHandFrom: response.lackingQty,
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
onMounted(() => {
  console.warn('currentHandleRow.value', currentHandleRow.value);

  if (currentHandleRow.value.orderId) {
    queryOrderLineInfo({
      orderId: currentHandleRow.value.orderId,
      isActive: 'Y',
    }).then(async (res) => {
      if (res.success) {
        let newRow = null;
        for (let i = 0; i < res.rows.length; i++) {
          blackList.value.push(res.rows[i]![ROWKEYFIELD]);
          if (i === 0) {
            newRow = await chcGridApi.grid.createRow(res.rows[i]);
            console.warn(666);

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
  // selectParams.value.warehouseId = currentHandleRow.value!.warehouseId
  window.addEventListener('keydown', handleKeyBoard);
});
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;

  if (
    chcSelect.value &&
    chcSelect.value.fetchApi &&
    typeof chcSelect.value.fetchApi === 'function'
  ) {
    chcGridApi.formApi.getValues().then((res) => {
      chcSelect.value.params.productControlLevel =
        res.productControlLevel || currentHandleRow.value.productControlLevel;
      selectParams.value.productControlLevel =
        res.productControlLevel || currentHandleRow.value.productControlLevel;
      // chcSelect.value.params.productControlLevel = res.productControlLevel || currentHandleRow.value.productControlLevel;
      const newParams = {
        showStorage: urlParams.showStorage,
        showPrice: urlParams.showPrice,
        warehouseId: res.toWarehouseId,
        fromWarehouseId: res.warehouseId,
        specWarehouseId:
          urlParams.specShowType === 'from'
            ? res.warehouseId
            : res.toWarehouseId,
        otherValue: res.isPrecious,
      };
      Object.assign(selectParams.value, newParams);
      // console.log('selectParams.value', selectParams.value);
      chcSelect.value.fetchApi();
    });
  }
};
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
const EditFields = ['qtyPlaned', 'vendorId', 'isGift'];
const continuEdit = (row: any) => {
  if (
    chcGridApi.grid
      .getInsertRecords()
      .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    chcGridApi.grid.setEditRow(
      chcGridApi.grid
        .getInsertRecords()
        .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else if (
    chcGridApi.grid
      .getUpdateRecords()
      .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    chcGridApi.grid.setEditRow(
      chcGridApi.grid
        .getUpdateRecords()
        .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else {
    return chcSelect.value.focus();
  }
};
const handleKeyBoard = async (e: KeyboardEvent) => {
  if (e.ctrlKey && e.code === 'KeyE') {
    e.preventDefault();
    if (chcGridApi.grid.getInsertRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getInsertRecords()[0], true);
    } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getUpdateRecords()[0], true);
    } else {
      return chcSelect.value.focus();
    }
  }
  if (
    e.code === 'ArrowRight' &&
    currentEditRow.value && // await chcGridApi.grid.clearEdit();
    EditFields.indexOf(currentField.value) + 1 < EditFields.length
  ) {
    e.preventDefault();
    chcGridApi.grid.setEditCell(
      currentEditRow.value,
      EditFields[EditFields.indexOf(currentField.value) + 1] as string,
    );
    currentField.value = EditFields[
      EditFields.indexOf(currentField.value) + 1
    ] as string;
  }
  if (
    e.code === 'ArrowLeft' &&
    currentEditRow.value &&
    EditFields.indexOf(currentField.value) - 1 > -1
  ) {
    e.preventDefault();
    chcGridApi.grid.setEditCell(
      currentEditRow.value,
      EditFields[EditFields.indexOf(currentField.value) - 1] as string,
    );
    currentField.value = EditFields[
      EditFields.indexOf(currentField.value) - 1
    ] as string;
  }
  if (e.code === 'Delete' && currentEditRow.value) {
    e.preventDefault();
    handleDeleteRow({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  if (e.key === 'Enter' && currentEditRow.value) {
    e.preventDefault();
    handleSave({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  if (e.code === 'ArrowRight' && selectOpen.value) {
    e.preventDefault();
    chcSelect.value.pageChange(chcSelect.value.params.current + 1);
  }

  if (e.code === 'ArrowLeft' && selectOpen.value) {
    e.preventDefault();
    chcSelect.value.pageChange(chcSelect.value.params.current - 1);
  }
};
const totalHandleLoading = ref(false);
const handleTotalSave = () => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    return message.error('当前表格存在未保存信息，请保存后再操作！');
  }
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
};
const handleTotalSubmit = () => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    return message.error('当前表格存在未保存信息，请保存后再操作！');
  }
  if (gridData.value.length === 0) {
    return message.error('请添加数据后再提交！');
  }
  totalHandleLoading.value = true;
  chcGridApi.formApi.getValues().then((res) => {
    const params = queryparams('saveDo', res, []);
    saveDo({ ...params, doCommit: 'Y' })
      .then(() => {
        totalHandleLoading.value = false;
        message.success('单据提交成功');
        currentTab.value = 0;
      })
      .catch(() => {
        totalHandleLoading.value = false;
      });
  });
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
const [ActionLogModal] = useVbenModal({
  connectedComponent: actionLogModal,
});
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <BatchAddModal />
    <ChcGrid>
      <template #toolbar-actions v-if="detailConfig?.type !== 'view'">
        <ChcSelect
          data-testid="ChcSelect_search_productr_name_documentDetail"
          :autofocus="true"
          :paginate="true"
          :allow-clear="false"
          ref="chcSelect"
          placeholder="请输入药品编码、药品名称、规格"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/productAction/query.do"
          popup-class-name="productSelection"
          @dropdown-visible-change="handleDropdownVisibleChange"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
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
        <Button
          type="primary"
          @click="handleBatchAdd"
          class="mr-[0.5rem]"
          data-testid="button_batch_add_documentDetail"
        >
          批量添加
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <!-- <Button type="primary" @click="handleDel" class="mr-[0.5rem]">
          删除
        </Button> -->
      </template>
      <template #toolbar-tools>
        <Input
          @input="handleSearchIpt"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入药品关键词"
          @keyup.enter="handleSearch"
          @focus="toggleSearchFocus(true)"
          @blur="toggleSearchFocus(false)"
          data-testid="input_search_keyword_documentDetail"
        />
        <Button
          type="primary"
          @click="handleSearch"
          data-testid="button_search_documentDetail"
        >
          搜索
          <template #icon>
            <SearchActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          v-if="!hasEditStatus(scope.row) && detailConfig?.type !== 'view'"
          type="primary"
          ghost
          @click="handleEdit(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_edit_row_${scope.rowIndex}_documentDetail`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>

        <Button
          v-if="
            (hasEditStatus(scope.row) ||
              scope.$grid.isUpdateByRow(scope.row) ||
              scope.$grid.isInsertByRow(scope.row)) &&
            detailConfig?.type !== 'view'
          "
          :loading="scope.row.loading"
          type="primary"
          ghost
          @click="handleSave(scope)"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_save_row_${scope.rowIndex}_documentDetail`"
        >
          保存
          <template #icon>
            <SvgSaveIcon />
          </template>
        </Button>
        <Button
          v-if="
            hasEditStatus(scope.row) &&
            !scope.$grid.isInsertByRow(scope.row) &&
            detailConfig?.type !== 'view'
          "
          type="primary"
          ghost
          @click="handleCalcel(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_cancel_row_${scope.rowIndex}_documentDetail`"
        >
          取消
          <template #icon>
            <SvgBackIcon />
          </template>
        </Button>
        <Button
          type="primary"
          ghost
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailConfig?.type !== 'view'"
          :data-testid="`button_delete_row_${scope.rowIndex}_documentDetail`"
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
              data-testid="button_save_all_documentDetail"
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
              data-testid="button_submit_all_documentDetail"
            >
              提交
              <template #icon>
                <UploadCloudIcon />
              </template>
            </Button>
            <!-- <Button
              type="primary"
              ghost
              danger
              @click="handleClose"
              :bordered="false"
              :loading="totalHandleLoading"
            >
              返回
            </Button> -->
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
