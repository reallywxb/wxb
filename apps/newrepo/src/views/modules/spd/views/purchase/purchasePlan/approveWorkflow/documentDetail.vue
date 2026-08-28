<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { EditableTable } from '#/components/editableTable';
import { handlePriceToFixedTwo, handlePrice } from '#/utils/util';
import {
  getOrderPlanStorage,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
} from './api';

const route = useRoute();
const urlParams: any = route.meta?.urlParams || {};
const currentTab = defineModel<number>('currentTab', { required: true });
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
});
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig');
const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const currentWarehouseInfo = ref<any>({});
const vendorParams = ref({
  productId: '',
  isNoProtocolPo: currentWarehouseInfo.value.isNoProtocolPo,
  isBPartnerProductControl: currentWarehouseInfo.value.isBPartnerProductControl,
  noProtocolPricePoSource: 'M',
});

const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: currentHandleRow.value.warehouseId || undefined,
  bpartnerId: currentHandleRow.value.applyBPartnerId || undefined,
});

/**
 * 表格列配置
 */
const gridColumns = ref<VxeGridProps['columns']>([
  { type: 'checkbox', title: '', width: 40, align: 'center' },
  { title: '序号', type: 'seq', width: 40, align: 'center', sortable: true },
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
    field: 'uomName',
    minWidth: 100,
    title: '单位',
    sortable: true,
  },
  {
    field: 'minUnit',
    minWidth: 120,
    title: '最小单位',
    sortable: true,
  },
  {
    field: 'qtyPlaned',
    minWidth: 110,
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
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
        },
      },
    },
    title: '采购数量',
    sortable: true,
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 90,
    title: '采购单价',
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.price);
    },
    sortable: true,
    align: 'right',
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
    field: 'vendorId',
    minWidth: 180,
    title: '供应商',
    sortable: true,
    formatter: ({ row }: any) => {
      return row.vendorName;
    },
    editRender: {
      name: 'ChcSelect',
      props: {
        dictUrl: '/orderPlanAction/productVendor.do',
        extraParams: vendorParams.value,
        onChange(val: any, option: any, scope: any) {
          scope.row.vendorId = val;
          scope.row.vendorName = option.label;
        },
        getPopupContainer: () =>
          document.querySelector(
            '.approveWorkflowEditable .vxe-table--main-wrapper',
          ),
        labelField: 'name',
        valueField: 'id',
        afterFetch(data: any) {
          return data.rows;
        },
      },
    },
  },
  {
    field: 'isGift',
    minWidth: 110,
    title: '是否赠品',
    sortable: true,
    editRender: {
      name: 'ChcSelect',
      props: {
        getPopupContainer: () =>
          document.querySelector(
            '.approveWorkflowEditable .vxe-table--main-wrapper',
          ),
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
        onChange(val: any, _: any, scope: any) {
          scope.row.isGift = val;
          const currentRow = scope.row;
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
        },
      },
    },
    formatter: ({ row }: any) => {
      return row.isGift === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'manufacturer',
    minWidth: 120,
    title: '生产厂家',
    sortable: true,
  },
  {
    field: 'lPackageQty',
    title: '大包装数',
    minWidth: 90,
    align: 'right',
    sortable: true,
  },
  {
    field: 'mPackageQty',
    title: '中包装数',
    minWidth: 90,
    align: 'right',
    sortable: true,
  },
  {
    field: 'qtyOnHand',
    minWidth: 200,
    title: '需求库房库存数量',
    align: 'right',
    sortable: true,
  },
  {
    field: 'ybhcCode',
    minWidth: 140,
    title: '医保药品编码',
    sortable: true,
  },
  {
    field: 'level_Day',
    title: '全院日均消耗',
    minWidth: 140,
    align: 'right',
    sortable: true,
  },
  {
    field: 'level_Max',
    title: '中心库库存上限',
    align: 'right',
    minWidth: 140,
    sortable: true,
  },
  {
    field: 'level_Min',
    title: '中心库库存下限',
    minWidth: 140,
    align: 'right',
    sortable: true,
  },
  {
    field: 'kf_Day',
    title: '需求库房日均消耗',
    minWidth: 140,
    align: 'right',
    sortable: true,
  },
  {
    field: 'kf_Max',
    title: '需求库房库存上限',
    minWidth: 140,
    align: 'right',
    sortable: true,
  },
  {
    field: 'kf_Min',
    title: '需求库房库存下限',
    minWidth: 140,
    align: 'right',
    sortable: true,
  },
  {
    field: 'priceList',
    title: '零售价',
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
]);

/**
 * 表头表单配置
 */
const formSchema: VbenFormProps['schema'] = [
  {
    component: 'Input',
    fieldName: 'orderPlanNo',
    componentProps: { disabled: true },
    defaultValue: currentHandleRow.value?.orderPlanNo || undefined,
    label: '采购计划单号',
    formItemClass: 'pb-2',
  },
  {
    component: 'DatePicker',
    fieldName: 'deliveryPlanDate',
    label: '要求送达时间',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      disabled: detailConfig.value?.type === 'view',
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
    componentProps: {
      autoChooseFirstOption: detailConfig.value?.type === 'add',
      dictUrl: `/baseHandleAction/warehouse.do?level1=Y&readWrite=Y&hospitalId=${currentHandleRow.value.hospitalId}`,
      placeholder: '请选择',
      onChange(val: any, option: any) {
        currentWarehouseInfo.value = option;
        selectParams.value.warehouseId = val;
      },
      showSearch: true,
      paginate: false,
      disabled: !!currentHandleRow.value!.warehouseId,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
      showChooseAll: false,
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.warehouseId,
    formItemClass: 'pb-2',
    fieldName: 'warehouseId',
    label: '采购仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      autoChooseFirstOption: detailConfig.value?.type === 'add',
      dictUrl: `/baseHandleAction/bpartner.do?type=4&readWrite=Y&hosptialId=${currentHandleRow.value.hospitalId}`,
      placeholder: '请选择',
      showSearch: true,
      paginate: false,
      immediate: true,
      showChooseAll: false,
      labelField: 'name',
      valueField: 'id',
      disabled:
        detailConfig.value?.type === 'edit' ||
        detailConfig.value?.type === 'view',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.applyBPartnerId,
    formItemClass: 'pb-2',
    fieldName: 'applyBPartnerId',
    label: '需求仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/refList.do?id=154',
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      showChooseAll: false,
      placeholder: '请选择',
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      disabled: detailConfig.value?.type === 'view',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    formItemClass: 'pb-2',
    fieldName: 'priorityRule',
    defaultValue:
      detailConfig.value?.type === 'add'
        ? '5'
        : currentHandleRow.value.priorityRule,
    label: '优先级',
  },
  {
    component: 'Input',
    fieldName: 'description',
    componentProps: {
      disabled: detailConfig.value?.type === 'view',
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.description,
    label: '备注',
    formItemClass: 'pb-2 col-span-2',
  },
];

/**
 * 行进入编辑时的回调
 */
const handleEditActivated = (scope: any) => {
  vendorParams.value.productId = scope.row.productId;
};

/**
 * 初始化表格数据
 */
onMounted(() => {
  if (currentHandleRow.value.orderPlanId) {
    editableTableRef.value!.showLoading = true;
    queryOrderPlanLineInfo({
      orderPlanId: currentHandleRow.value.orderPlanId,
      hospitalId: currentHandleRow.value.hospitalId,
      isActive: 'Y',
    }).then(async (res) => {
      if (res.success) {
        editableTableRef.value?.initRows(res.rows);
        editableTableRef.value!.showLoading = false;
      } else {
        message.error(res.msg);
      }
    });
  }
});

/**
 * 校验是否可以添加行
 */
const validateIfCanAddRow = () => {
  return new Promise<boolean>((resolve) => {
    editableTableRef.value?.formApi.getValues().then((temFormData) => {
      const formValues: { [key: string]: any } = {
        applyBPartnerId:
          temFormData.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
        warehouseId:
          temFormData.warehouseId || currentHandleRow.value.warehouseId,
      };
      const requiredFields = [
        { field: 'applyBPartnerId', label: '需求仓库' },
        { field: 'warehouseId', label: '采购仓库' },
      ];
      let errorMsg: string = '';
      for (const { field, label } of requiredFields) {
        if (!formValues[field]) {
          errorMsg = label;
          break;
        }
      }
      if (errorMsg) {
        message.warning(`请先选择${errorMsg}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 根据用户选择获取新增行数据
 */
const getAddRowData = (option: any, formValue: any) => {
  return new Promise((resolve) => {
    getOrderPlanStorage({
      warehouseId: formValue.warehouseId,
      productId: option.productId,
    }).then((response) => {
      resolve({
        ...option,
        ...response,
        isGift: 'N',
      });
    });
  });
};

/**
 * 行数据前端校验
 */
function rowDataValidate(row: any) {
  return new Promise<boolean>((resolve, reject) => {
    if (row.qtyPlaned <= 0) {
      message.error('采购数量必须大于零!');
      reject(new Error('采购数量必须大于零!'));
    } else if (row.vendorId) {
      resolve(true);
    } else {
      message.error('请选择供应商！');
      reject(new Error('请选择供应商！'));
    }
  });
}

/**
 * 构建查询参数
 */
const queryparams = (
  type: 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  rows.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (item[key] === undefined || item[key] === null) {
        delete item[key];
      }
    });
  });
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
    receiptType: currentHandleRow.value.receiptType,
    isShortPo: urlParams.isShortPo,
    type: 'warehouse',
    lineData,
  };
};

/**
 * 单行保存方法
 */
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi
      .getValues()
      .then((res: any) => {
        const params = queryparams('saveLine', res, [row]);
        saveLine(params)
          .then((res) => {
            if (!currentHandleRow.value.orderPlanId) {
              currentHandleRow.value = { orderPlanId: res.id };
              editableTableRef.value?.formApi.setFieldValue(
                'orderPlanNo',
                res.orderPlanNo,
              );
            }
            queryOrderPlanLineInfo({
              orderPlanId: res.id,
              hospitalId: currentHandleRow.value.hospitalId,
              isActive: 'Y',
            })
              .then((resIn) => {
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
            row.loading = false;
            reject(error);
          });
      })
      .catch((error: any) => {
        row.loading = false;
        reject(error);
      });
  });
};

/**
 * 批量删除行方法
 */
const deleteRows = (rows: any[]) => {
  return new Promise((resolve) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, rows);
      saveDo(params).then((res) => {
        resolve(res);
      });
    });
  });
};

/**
 * 表格额外配置
 */
const gridOptions: VxeGridProps = {
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
  cellStyle: (scope: any) => {
    const finalStyle: { [key: string]: number | string } = {
      color: '',
    };
    if (
      scope.column.field === 'price' &&
      scope.row.price !== scope.row.priceList
    ) {
      finalStyle.color = 'red';
    }
    return finalStyle;
  },
};

/**
 * 整体保存方法
 */
const totalSave = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo(params)
        .then(() => {
          currentTab.value = 0;
          resolve(true);
        })
        .catch((error) => {
          console.error(error.msg);
          reject(error);
        });
    });
  });
};

/**
 * 批量添加弹窗表格配置
 */
const batchAddModalGridOptions: SchemaColumnAndOptions = {
  gridColumns: [
    { type: 'checkbox', title: '', width: 50, align: 'center' },
    { field: 'productCode', minWidth: 110, sortable: true, title: '药品编码' },
    { field: 'productName', minWidth: 135, sortable: true, title: '药品名称' },
    { field: 'productSpec', minWidth: 80, sortable: true, title: '规格' },
    { field: 'manufacturer', minWidth: 120, sortable: true, title: '厂家' },
    { field: 'uomName', minWidth: 60, sortable: true, title: '单位' },
    {
      field: 'price',
      minWidth: 100,
      sortable: true,
      align: 'right',
      title: '采购价',
    },
    {
      field: 'storageQty',
      minWidth: 70,
      sortable: true,
      align: 'right',
      title: '库存',
    },
  ],
  dataTableId: '/productAction/query.do',
};

/**
 * 批量添加弹窗表单配置
 */
const batchAddModalFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '编码、名称、拼首码、规格',
        allowClear: true,
      },
      fieldName: 'productName',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '生产厂家',
        allowClear: true,
      },
      fieldName: 'manufacturer',
    },
  ],
};

/**
 * 操作日志查询参数
 */
const queryActionLogParams = (row: any) => {
  return {
    AD_Table_ID: 1_000_359,
    Record_ID: row.orderPlanLineId,
  };
};

/**
 * 黑名单变化回调
 */
const handleBlackListChange = (blackList: string[]) => {
  editableTableRef.value?.formApi.updateSchema([
    {
      fieldName: 'warehouseId',
      componentProps: {
        disabled: !!currentHandleRow.value!.warehouseId || blackList.length > 0,
      },
    },
  ]);
};
</script>

<template>
  <div class="h-full">
    <EditableTable
      class="approveWorkflowEditable"
      ref="editableTableRef"
      id="approveWorkflowEditableTable"
      :row-data-validate="rowDataValidate"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailConfig?.type"
      :form-schema="formSchema"
      @edit-activated="handleEditActivated"
      :single-select-props="{
        extraParams: selectParams,
        filterField: 'productCode',
        queryModelValueField: 'model',
        refreshOptionsWhenOpenDropdown: true,
      }"
      :validateIfCanAddRow="validateIfCanAddRow"
      :get-final-add-row-data="getAddRowData"
      :save-row="saveRow"
      :delete-rows="deleteRows"
      :totalSave="totalSave"
      :batchAddModalGridOptions="batchAddModalGridOptions"
      :batchAddModalFormOptions="batchAddModalFormOptions"
      :queryActionLogParams="queryActionLogParams"
      @blackListChange="handleBlackListChange"
    >
    </EditableTable>
  </div>
</template>

<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}
</style>
