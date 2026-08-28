<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import { onMounted, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Button, message } from 'ant-design-vue';
import { ChcSelect } from '@vben/chc-ui';
import dayjs from 'dayjs';
import { EditableTable } from '#/components/editableTable';
import { handlePriceToFixedTwo } from '#/utils/util';
import {
  dataCommit,
  getOrderPlanStorage,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
} from './api';
import { useVbenModal } from '@vben/common-ui';
import codeModal from './modals/codeModal.vue';

const route = useRoute();
const urlParams: any = route.meta?.urlParams || {};
const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', { required: true });
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const currentWarehouseInfo = ref<any>({});
const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: undefined,
  vendor: undefined,
  // vendorId: undefined,
});

const receiptTypeState = ref<string | undefined>(
  parentData.value!.receiptType || undefined,
);
const disabledNo = ref(parentData.value!.invoiceMethod === '2');
const warehouseIdExtraParams = ref<{ regionId?: number | string | undefined }>({
  regionId: '',
});
const warehouseIdDep = ref({ departmentId: undefined });

const handlePrice = (priceActual: any) => {
  if (typeof priceActual === 'string') {
    return Number.parseFloat(priceActual);
  } else if (typeof priceActual === 'number') {
    return priceActual;
  } else {
    return 0;
  }
};

const roundAmount = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const disabledBeforeToday = (date: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dayjs(date).isBefore(dayjs(today));
};

const disabledAfterToday = (date: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !dayjs(date).isBefore(dayjs(today));
};

/**
 * 表格列配置
 */
const gridColumns = ref<VxeGridProps['columns']>([
  { type: 'checkbox', title: '', width: 40, align: 'center', fixed: 'left' },
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
    minWidth: 120,
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
    minWidth: 60,
    title: '单位',
    sortable: true,
  },
  {
    field: 'minUomName',
    minWidth: 90,
    title: '最小单位',
    sortable: true,
  },
  {
    field: 'qtyArrived',
    minWidth: 120,
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          const typeVal = receiptTypeState.value;
          if (currentRow.isGift === 'Y' || typeVal === 'G') {
            currentRow.priceActual = 0;
            currentRow.lineAmt = 0;
          } else {
            currentRow.lineAmt = roundAmount(
              handlePrice(currentRow.qtyArrived) *
                handlePrice(currentRow.priceActual),
            );
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
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          const typeVal = receiptTypeState.value;
          if (currentRow.isGift === 'Y' || typeVal === 'G') {
            currentRow.priceActual = 0;
            currentRow.lineAmt = 0;
          } else {
            currentRow.lineAmt = roundAmount(
              handlePrice(currentRow.qtyArrived) *
                handlePrice(currentRow.priceActual),
            );
          }
        },
      },
    },
    sortable: true,
    align: 'right',
  },
  {
    field: 'lot',
    minWidth: 100,
    title: '批号',
    sortable: true,
    editRender: {
      name: 'ChcInput',
      props: {
        disabled: (scope: any) => scope.row.isLot === 'N',
      },
    },
  },
  {
    field: 'productionDate',
    minWidth: 100,
    title: '生产日期',
    sortable: true,
    editRender: {
      name: 'ChcDatePicker',
      props: {
        format: ['YYYY-MM-DD', 'YYYYMMDD'],
        valueFormat: 'YYYY-MM-DD',
        disabledDate: disabledAfterToday,
        disabled: (scope: any) => scope.row?.isProductionDateMandatory === 'N',
        onChange: (val: any, scope: any) => {
          if (val && disabledAfterToday(val)) {
            message.warning('生产日期不能晚于当前日期');
            scope.row.productionDate = '';
          }
        },
      },
      // autofocus: '.ant-picker-input input',
    },
  },
  {
    field: 'guaranteeDate',
    minWidth: 100,
    title: '效期',
    sortable: true,
    editRender: {
      name: 'ChcDatePicker',
      props: {
        format: ['YYYY-MM-DD', 'YYYYMMDD'],
        valueFormat: 'YYYY-MM-DD',
        disabledDate: disabledBeforeToday,
        disabled: (scope: any) => scope.row?.isGuaranteeDateMandatory === 'N',
        onChange: (val: any, scope: any) => {
          if (val && disabledBeforeToday(val)) {
            message.warning('效期不能早于当前日期');
            scope.row.guaranteeDate = '';
          }
        },
      },
    },
  },
  {
    field: 'serNo',
    minWidth: 80,
    title: '序列号',
    sortable: true,
    editRender: {
      name: 'ChcInput',
    },
  },
  {
    field: 'taxInvoiceNo',
    minWidth: 100,
    title: '发票号',
    sortable: true,
    editRender: {
      name: 'ChcInput',
      props: {
        disabled: disabledNo,
      },
    },
  },
  {
    field: 'taxInvoiceDate',
    minWidth: 100,
    title: '发票日期',
    sortable: true,
    editRender: {
      name: 'ChcDatePicker',
      props: {
        format: ['YYYY-MM-DD', 'YYYYMMDD'],
        valueFormat: 'YYYY-MM-DD',
        disabled: disabledNo,
        // getPopupContainer: () =>
        //   document.querySelector(
        //     '.manualCheckEditable .vxe-table--layout-wrapper',
        //   ),
        // onFocus: () => {
        //   setTimeout(() => {
        //     const el = document.querySelector(
        //       `.ChcDatePicker-taxInvoiceDate input`,
        //     );
        //     triggerArrowDown(el);
        //   });
        // },
      },
      autofocus: '.ant-picker-input input',
    },
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
  {
    field: 'lPackageQty',
    title: '大包装数',
    align: 'right',
    minWidth: 90,
    sortable: true,
  },
  {
    field: 'mPackageQty',
    title: '中包装数',
    align: 'right',
    minWidth: 90,
    sortable: true,
  },
  {
    field: 'qtyOnhand',
    minWidth: 145,
    title: '需求库房库存数量',
    align: 'right',
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
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    width: detailInfo.value?.type === 'view' ? '135' : '135',
  },
]);

/**
 * 表头表单配置
 */
const formSchema: VbenFormProps['schema'] = [
  {
    component: 'ChcSelect',
    defaultValue: parentData.value!.receiptType || undefined,
    componentProps: {
      dictUrl: '/baseHandleAction/refList.do?id=1000650',
      disabled: !!parentData.value.asnId,
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      placeholder: '请选择入库类型',
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      allowClear: false,
      showChooseAll: false,
      onChange: (val: any) => {
        receiptTypeState.value = val;
        const rows = editableTableRef.value?.gridApi.getData();
        rows?.forEach((r: any) => {
          if (val === 'G') {
            r.priceActual = 0;
            r.lineAmt = handlePrice(r.qtyArrived) * 0;
          } else {
            r.priceActual = handlePrice(r.pricePo || r.pricePO);
            r.lineAmt = roundAmount(
              handlePrice(r.qtyArrived) * handlePrice(r.priceActual),
            );
          }
        });
      },
      afterFetch: (res: any) => {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    fieldName: 'receiptType',
    label: '入库类型',
    formItemClass: 'pb-2',
  },

  {
    component: 'ChcSelect',
    fieldName: 'departmentId',
    formItemClass: 'pb-2',
    label: '院区',
    componentProps: {
      dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
      placeholder: '请选择院区',
      paginate: false,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      showChooseAll: false,
      disabled: !!parentData.value.asnId,
      onChange: (val: any, option: any) => {
        warehouseIdExtraParams.value.regionId = val || '-1';
      },
      afterFetch: (res: any) => {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
      placeholder: '请选择',
      onChange: async (val: any, option: any) => {
        currentWarehouseInfo.value = option;
        if (currentWarehouseInfo.value?.isNoProtocolPo === 'Y') {
          selectParams.value.vendor = undefined;
        } else {
          const values: any = await editableTableRef.value?.formApi.getValues();
          selectParams.value.vendor = values.bpartnerId || undefined;
        }

        selectParams.value.warehouseId = val;
      },
      paginate: false,
      disabled: !!parentData.value.asnId,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      triggerFields: ['departmentId'],
      triggerFieldKeys: {
        departmentId: 'regionId',
      },
      allowClear: false,
      showChooseAll: false,
      afterFetch: (res: any) => {
        console.log('采购仓库afterFetch:', res);
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['departmentId'],
      trigger: async (values) => {
        console.log('values:', values);
        const chcSelectRef =
          editableTableRef.value?.formApi.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('warehouseId');
        if (chcSelectRef) {
          if (detailInfo.value?.type === 'add') {
            // 新建时，只需要跟随上级变化
            await chcSelectRef?.fetchApi((params) => {
              console.log('setHandleParams:', params);
              params.dependencies = {
                departmentId: values.departmentId,
              };
              return params;
            });
            chcSelectRef.selectFirstOption();
          } else {
            // 编辑查看时，需要回显数据
            await chcSelectRef?.fetchApi((params) => {
              params.dependencies = {
                departmentId: values.departmentId,
              };
              return { ...params };
            });
            chcSelectRef.setModelValue(parentData.value.warehouseId);
            // editableTableRef.value?.formApi.setFieldValue(
            //   'warehouseId',
            //   parentData.value.warehouseId,
            // );
          }
        }
      },
    },
    defaultValue: parentData.value!.warehouseId || undefined,
    formItemClass: 'pb-2',
    fieldName: 'warehouseId',
    label: '采购仓库',
  },
  {
    component: 'ChcSelect',
    defaultValue: parentData.value!.applyBPartnerId || undefined,
    componentProps: {
      dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
      placeholder: '请选择',
      showSearch: true,
      paginate: false,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      allowClear: false,
      showChooseAll: false,
      disabled: !!parentData.value.asnId,
      afterFetch: (res: any) => {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    formItemClass: 'pb-2',
    fieldName: 'applyBPartnerId',
    label: '需求仓库',
  },
  {
    component: 'ChcSelect',
    defaultValue: parentData.value!.bpartnerId || undefined,
    componentProps: {
      dictUrl: '/baseHandleAction/vendor.do',
      disabled: !!parentData.value.asnId,
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      onChange: (val: any) => {
        // selectParams.value.vendorId = val;
        console.warn('供应商:', val);
        if (currentWarehouseInfo.value?.isNoProtocolPo === 'Y') {
          selectParams.value.vendor = undefined;
        } else {
          selectParams.value.vendor = val;
        }
      },
      showSearch: true,
      placeholder: '请选择供应商',
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      allowClear: false,
      showChooseAll: false,
      afterFetch: (res: any) => {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    fieldName: 'bpartnerId',
    label: '供应商',
    formItemClass: 'pb-2',
  },
  {
    component: 'ChcSelect',
    defaultValue: parentData.value!.invoiceMethod || undefined,
    componentProps: {
      dictUrl: '/baseHandleAction/refList.do?id=1000480',
      disabled: !!parentData.value.asnId,
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      placeholder: '请选择开票方式',
      onChange: (val: any) => {
        disabledNo.value = val === '2';
      },
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      allowClear: false,
      showChooseAll: false,
      afterFetch: (res: any) => {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    fieldName: 'invoiceMethod',
    label: '开票方式',
    formItemClass: 'pb-2',
  },
  {
    component: 'Input',
    fieldName: 'description',
    defaultValue: parentData.value!.description || undefined,
    componentProps: {
      disabled: detailInfo.value?.type === 'view',
    },
    label: '备注',
    formItemClass: 'pb-2',
  },
];

/**
 * 初始化表格数据
 */
onMounted(async () => {
  if (parentData.value.asnId) {
    editableTableRef.value!.showLoading = true;

    queryOrderPlanLineInfo({
      asnId: parentData.value.asnId,
    }).then(async (res) => {
      if (res.success) {
        editableTableRef.value?.initRows(res.rows);
        editableTableRef.value!.showLoading = false;
      } else {
        message.error(res.msg);
      }
    });
  }
  selectParams.value.warehouseId = parentData.value!.warehouseId;
  // selectParams.value.vendorId = parentData.value!.vendorId;

  await nextTick();
  const departmentRef =
    editableTableRef.value?.formApi.getFieldComponentRef<
      InstanceType<typeof ChcSelect>
    >('departmentId');
  if (detailInfo.value?.type === 'add') {
    // 新增初始化时，先查询院区数据，再赋值，parentData中的院区
    await departmentRef?.fetchApi();
    console.log('getSelectOptions:', departmentRef?.getSelectOptions());
    departmentRef?.selectFirstOption();
  } else {
    await departmentRef?.fetchApi();

    await editableTableRef.value?.formApi.setFieldValue(
      'departmentId',
      parentData.value!.departmentId,
    );
  }
});

/**
 * 校验是否可以添加行
 */
const validateIfCanAddRow = () => {
  return new Promise<boolean>((resolve) => {
    editableTableRef.value?.formApi.getValues().then((temFormData) => {
      const formValues: { [key: string]: any } = {
        warehouseId: temFormData.warehouseId || parentData.value.warehouseId,
        applyBPartnerId:
          temFormData.applyBPartnerId || parentData.value.applyBPartnerId,
        bpartnerId: temFormData.bpartnerId || parentData.value.bpartnerId,
        receiptType: temFormData.receiptType || parentData.value.receiptType,
        invoiceMethod:
          temFormData.invoiceMethod || parentData.value.invoiceMethod,
      };
      const requiredFields = [
        { field: 'receiptType', label: '入库类型' },
        { field: 'bpartnerId', label: '供应商' },
        { field: 'warehouseId', label: '采购仓库' },
        { field: 'applyBPartnerId', label: '需求仓库' },
        { field: 'invoiceMethod', label: '开票方式' },
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
      warehouseId: formValue.warehouseId || parentData.value.warehouseId,
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
    const formValue = editableTableRef.value?.formApi.getValues();
    formValue?.then((res: any) => {
      const invoiceMethodLine =
        res.invoiceMethod || parentData.value.invoiceMethod;

      if (!(row.qtyArrived > 0)) {
        message.error('入库数量必须大于零!');
        reject(new Error('入库数量必须大于零!'));
        return;
      }
      if (invoiceMethodLine === '1' && !row.taxInvoiceNo) {
        message.error('请输入发票号!');
        reject(new Error('请输入发票号!'));
        return;
      }
      if (invoiceMethodLine === '1' && !row.taxInvoiceDate) {
        message.error('请输入发票日期!');
        reject(new Error('请输入发票日期!'));
        return;
      }
      if (row.isLot === 'Y' && !row.lot) {
        message.error('请输入批号!');
        reject(new Error('请输入批号!'));
        return;
      }
      if (!row.guaranteeDate && row?.isGuaranteeDateMandatory === 'Y') {
        message.error('请输入效期!');
        reject(new Error('请输入效期!'));
        return;
      }
      if (!row.productionDate && row.isProductionDateMandatory === 'Y') {
        message.error('请输入生产日期!');
        reject(new Error('请输入生产日期!'));
        return;
      }
      // 校验同一药品编码+批号+效期不能重复
      const gridData = editableTableRef.value?.gridApi.getData() || [];
      const duplicateRow = gridData.find((item: any) => {
        // 有 asnLineId 用 asnLineId 判断，没有则用 $uuid
        return (
          item.asnLineId !== row.asnLineId &&
          item.productCode === row.productCode &&
          item.lot === row.lot &&
          item.guaranteeDate === row.guaranteeDate
        );
      });
      if (duplicateRow) {
        message.error(
          '当前药品编码、批号、效期已存在相同数据，请检查后再保存！',
        );
        reject(new Error('当前药品编码、批号、效期已存在相同数据'));
        return;
      }
      resolve(true);
    });
  });
}

/**
 * 构建查询参数
 */
const queryparams = (
  type: 'delete' | 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
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
    orderPlanId: parentData.value.orderPlanId || 0,
    asnId: parentData.value.asnId || 0,
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

/**
 * 单行保存方法（区分新增和已保存行）
 */
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi
      .getValues()
      .then((res: any) => {
        const receiptTypeVal = res.receiptType || parentData.value.receiptType;
        if (receiptTypeVal === 'G') {
          row.priceActual = 0;
          row.lineAmt = handlePrice(row.qtyArrived) * 0;
        } else {
          row.priceActual = handlePrice(row.priceActual ||row.pricePo || row.pricePO);
          row.lineAmt = roundAmount(
            handlePrice(row.qtyArrived) * handlePrice(row.priceActual),
          );
        }

        if (row.asnLineId) {
          const params = queryparams('saveDo', res, [row]);
          const paramsNew = {
            ...params,
            receiptType: res.receiptType || parentData.value.receiptType,
            description: res.description || parentData.value.description,
            warehouseId: res.warehouseId || parentData.value.warehouseId,
            applyBPartnerId:
              res.applyBPartnerId || parentData.value.applyBPartnerId,
            invoiceMethod: res.invoiceMethod || parentData.value.invoiceMethod,
            bpartnerId: res.bpartnerId || parentData.value.bpartnerId,
            asnType: 'PO',
            asnLineId: row.asnLineId,
          };
          const paramsNewFiltered = Object.fromEntries(
            Object.entries(paramsNew).filter(
              ([_, value]) => value !== null && value !== undefined,
            ),
          );
          saveLine(paramsNewFiltered)
            .then((response) => {
              if (response && response.success) {
                if (!parentData.value.asnId) {
                  parentData.value = { asnId: response.data.header.asnId };
                }
                queryOrderPlanLineInfo({
                  asnId: response.data.header.asnId,
                }).then((resIn) => {
                  const newRow = resIn.rows.find(
                    (item: any) => item.asnLineId === response.data.lines[0],
                  );
                  resolve(newRow);
                });
              }
            })
            .catch((error) => {
              row.loading = false;
              reject(error);
            });
        } else {
          const params = queryparams('saveLine', res, [row]);
          const paramsNew = {
            ...params,
            receiptType: res.receiptType || parentData.value.receiptType,
            description: res.description || parentData.value.description,
            warehouseId: res.warehouseId || parentData.value.warehouseId,
            applyBPartnerId:
              res.applyBPartnerId || parentData.value.applyBPartnerId,
            invoiceMethod: res.invoiceMethod || parentData.value.invoiceMethod,
            bpartnerId: res.bpartnerId || parentData.value.bpartnerId,
            asnType: 'PO',
          };
          const paramsNewFiltered = Object.fromEntries(
            Object.entries(paramsNew).filter(
              ([_, value]) => value !== null && value !== undefined,
            ),
          );
          saveLine(paramsNewFiltered)
            .then((response) => {
              if (!parentData.value.asnId) {
                parentData.value = { asnId: response.data.header.asnId };
              }
              queryOrderPlanLineInfo({
                asnId: response.data.header.asnId,
              }).then((resIn) => {
                const newRow = resIn.rows.find(
                  (item: any) => item.asnLineId === response.data.lines[0],
                );
                resolve(newRow);
              });
            })
            .catch((error) => {
              row.loading = false;
              reject(error);
            });
        }
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
      const params = queryparams('delete', res, rows);
      const paramsNew = {
        ...params,
        receiptType: res.receiptType || parentData.value.receiptType,
        description: res.description || parentData.value.description,
        warehouseId: res.warehouseId || parentData.value.warehouseId,
        applyBPartnerId:
          res.applyBPartnerId || parentData.value.applyBPartnerId,
        invoiceMethod: res.invoiceMethod || parentData.value.invoiceMethod,
        bpartnerId: res.bpartnerId || parentData.value.bpartnerId,
        asnType: 'PO',
      };
      const paramsNewFiltered = Object.fromEntries(
        Object.entries(paramsNew).filter(
          ([_, value]) => value !== null && value !== undefined,
        ),
      );
      saveDo(paramsNewFiltered).then((response) => {
        resolve(response);
      });
    });
  });
};

/**
 * 表格额外配置
 */
const gridOptions: VxeGridProps = {
  virtualYConfig: {
    enabled: true,
    gt: 25,
  },
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
  cellStyle: (scope: any) => {
    const finalStyle: { [key: string]: number | string } = {
      color: '',
      backgroundColor: '',
    };
    const editFields = [
      'qtyArrived',
      'priceActual',
      'lot',
      'guaranteeDate',
      'productionDate',
      'serNo',
      'taxInvoiceNo',
      'taxInvoiceDate',
    ];
    if (editFields.includes(scope.column.field)) {
      finalStyle.backgroundColor = '#D7FFF5';
    }
    if (
      scope.column.field === 'priceActual' &&
      scope.row.priceActual !== scope.row.priceList
    ) {
      finalStyle.color = 'red';
    }
    return finalStyle;
  },
};

/**
 * 校验表格中是否有 药品编码+批号+效期 重复的数据
 */
const checkDuplicateLot = (gridData: any[]) => {
  for (let i = 0; i < gridData.length; i++) {
    for (let j = i + 1; j < gridData.length; j++) {
      const a = gridData[i];
      const b = gridData[j];
      if (
        a.productCode === b.productCode &&
        a.lot === b.lot &&
        a.guaranteeDate === b.guaranteeDate
      ) {
        return false;
      }
    }
  }
  return true;
};

/**
 * 整体保存方法
 */
const totalSave = () => {
  return new Promise((resolve, reject) => {
    const requiredFields = [
      { field: 'receiptType', label: '入库类型' },
      { field: 'bpartnerId', label: '供应商' },
      { field: 'warehouseId', label: '采购仓库' },
      { field: 'applyBPartnerId', label: '需求仓库' },
      { field: 'invoiceMethod', label: '开票方式' },
    ];

    let tableData = editableTableRef.value?.gridApi.getData();
    editableTableRef.value?.formApi.getValues().then(async (res: any) => {
      for (const { field, label } of requiredFields) {
        if (!(parentData.value[field] || res[field])) {
          message.error(`请选择${label}`);
          reject(new Error(`请选择${label}`));
          return;
        }
      }

      // 校验药品编码+批号+效期不能重复
      if (!checkDuplicateLot(tableData || [])) {
        message.error('存在药品编码、批号、效期重复的数据，请检查后再保存！');
        reject(new Error('药品编码+批号+效期重复'));
        return;
      }

      const typeVal = res.receiptType || parentData.value?.receiptType;
      if (typeVal === 'G') {
        tableData = tableData?.map((r: any) => ({
          ...r,
          priceActual: 0,
          lineAmt: handlePrice(r.qtyArrived) * 0,
        }));
      }

      const params = queryparams('saveDo', res, tableData || []);
      const paramsNew = {
        ...params,
        receiptType: res.receiptType || parentData.value.receiptType,
        warehouseId: res.warehouseId || parentData.value.warehouseId,
        applyBPartnerId:
          res.applyBPartnerId || parentData.value.applyBPartnerId,
        invoiceMethod: res.invoiceMethod || parentData.value.invoiceMethod,
        bpartnerId: res.bpartnerId || parentData.value.bpartnerId,
        description: res.description || parentData.value.description,
        asnType: 'PO',
      };
      saveDo(paramsNew)
        .then(() => {
          currentTab.value = 0;
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

/**
 * 整体提交方法
 */
const totalSubmit = () => {
  return new Promise((resolve, reject) => {
    const gridData = editableTableRef.value?.gridApi.getData();
    if (!gridData || gridData.length === 0) {
      message.error('请添加数据后再提交！');
      reject(new Error('请添加数据后再提交！'));
      return;
    }

    // 校验药品编码+批号+效期不能重复
    if (!checkDuplicateLot(gridData)) {
      message.error('存在药品编码、批号、效期重复的数据，请检查后再提交！');
      reject(new Error('药品编码+批号+效期重复'));
      return;
    }

    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const typeVal = res.receiptType || parentData.value?.receiptType;
      if (typeVal === 'G') {
        const invalid = gridData.some(
          (r: any) => handlePrice(r.priceActual) > 0,
        );
        if (invalid) {
          message.error('入库类型为赠品时，入库单价必须为0');
          reject(new Error('入库类型为赠品时，入库单价必须为0'));
          return;
        }
      }

      dataCommit({ asnId: parentData.value.asnId })
        .then(() => {
          currentTab.value = 1;
          resolve(true);
        })
        .catch((error) => {
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
      field: 'priceActual',
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
    AD_Table_ID: 1_000_292,
    Record_ID: row.asnLineId,
  };
};

/**
 * 表格数据变化回调
 */
const handleGridDataChange = (gridData: any[]) => {
  if (detailInfo.value?.type === 'add') {
    const isDisabled = !!parentData.value!.asnId || gridData.length > 0;
    editableTableRef.value?.formApi.updateSchema([
      {
        fieldName: 'receiptType',
        componentProps: {
          disabled: isDisabled,
        },
      },
      {
        fieldName: 'bpartnerId',
        componentProps: {
          disabled: isDisabled,
        },
      },
      {
        fieldName: 'departmentId',
        componentProps: {
          disabled: isDisabled,
        },
      },
      {
        fieldName: 'warehouseId',
        componentProps: {
          disabled: isDisabled,
        },
      },
      {
        fieldName: 'applyBPartnerId',
        componentProps: {
          disabled: isDisabled,
        },
      },
      {
        fieldName: 'invoiceMethod',
        componentProps: {
          disabled: isDisabled,
        },
      },
    ]);
  }
};

/**
 * 追溯码弹窗（保留原业务逻辑）
 */
const [CodeModal, codeModalApi] = useVbenModal({
  connectedComponent: codeModal,
});
const handleCodeChoose = async (records: any[]) => {
  console.warn('records', records);
};
const handleCode = (scope: any) => {
  codeModalApi!
    .setData({
      warehouseId: scope.row.warehouseId,
      productCode: scope.row.productCode,
      productName: scope.row.productName,
      asnLineId: scope.row.asnLineId,
      lot: scope.row.lot,
      guaranteeDate: scope.row.guaranteeDate,
      replenishSource: 'P',
      type: detailInfo.value?.type,
      handleCodeChoose,
    })
    .open();
};

/**
 * 添加批号 - 复制选中行，置空 asnLineId，并进入编辑状态
 */
const handleAddLot = () => {
  const checkedRows =
    editableTableRef.value?.gridApi.getCheckboxRecords() || [];
  if (checkedRows.length === 0) {
    message.warning('请先选择一条数据');
    return;
  }
  if (checkedRows.length > 1) {
    message.warning('只能选择一条数据进行添加批号');
    return;
  }

  const selectedRow = checkedRows[0];
  if (!selectedRow.asnLineId) {
    message.warning('该数据还未保存请先保存');
    return;
  }
  const gridData = editableTableRef.value?.gridApi.getData() || [];
  const rowIndex = gridData.findIndex(
    (item: any) => item.$uuid === selectedRow.$uuid,
  );

  // 深拷贝行数据，彻底切断引用关联，避免删除时影响原行
  const newRowData = JSON.parse(JSON.stringify(selectedRow));
  newRowData._X_ROW_KEY = undefined;
  newRowData.$uuid = undefined;
  newRowData.asnLineId = undefined;
  newRowData.$status = 'insert';
  newRowData.$checked = false;
  editableTableRef.value?.insertRow(newRowData, rowIndex + 1);
  // newRowData.productName = '333';
  // console.log('newRowData', newRowData);
  // insertAt 是插入到指定行的前面，要插入到下一行需要传下一行的对象
  // const nextRow = gridData[rowIndex + 1] || -1;
  // console.warn('nextRow', nextRow);
  // if (nextRow) {
  //   editableTableRef.value?.gridApi.insertAt(newRowData, nextRow).then((res: any) => {
  //     if (res && res.row) {
  //       editableTableRef.value?.gridApi.setEditRow(res.row, true);
  //     }
  //   });
  // } else {
  //   // 最后一行则直接用 insert 追加到末尾
  //   editableTableRef.value?.gridApi.insert(newRowData).then((res: any) => {
  //     if (res && res.row) {
  //       editableTableRef.value?.gridApi.setEditRow(res.row, true);
  //     }
  //   });
  // }
};
</script>

<template>
  <div class="h-full">
    <CodeModal></CodeModal>
    <EditableTable
      class="manualCheckEditable"
      ref="editableTableRef"
      id="manualCheckEditableTable"
      :row-data-validate="rowDataValidate"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailInfo?.type"
      :form-schema="formSchema"
      :form-options="{
        commonConfig: {
          labelWidth: 70,
        },
      }"
      :single-select-props="{
        extraParams: selectParams,
        filterField: 'productName',
        queryModelValueField: 'model',
        refreshOptionsWhenOpenDropdown: true,
        blackList: [],
      }"
      :validateIfCanAddRow="validateIfCanAddRow"
      :get-final-add-row-data="getAddRowData"
      :save-row="saveRow"
      :delete-rows="deleteRows"
      :totalSave="totalSave"
      :totalSubmit="totalSubmit"
      :batchAddModalGridOptions="batchAddModalGridOptions"
      :batchAddModalFormOptions="batchAddModalFormOptions"
      :queryActionLogParams="queryActionLogParams"
      @gridDataChange="handleGridDataChange"
      :slotsConfig="{
        toolbarActionsRight: 'toolbar-actions-right',
        showBatchDelBtn: false
      }"
    >
      <template #toolbar-actions-right>
        <Button
          type="primary"
          @click="handleAddLot"
          class="mr-[0.5rem]"
          data-testid="button_add_lot"
        >
          添加批号
          <template #icon>
            <i class="anticon anticon-plus"></i>
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          v-if="detailInfo?.type === 'view'"
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="editableTableRef?.viewLog(scope)"
          :data-testid="`button_action_log_${scope.rowIndex}_documentDetail`"
        >
          操作记录
        </Button>
        <Button
          type="primary"
          danger
          ghost
          @click="editableTableRef?.handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailInfo?.type !== 'view'"
          :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
        >
          删行
        </Button>
        <!--           v-if="!scope.$grid.isEditByRow(scope.row)" -->
        <Button
          type="primary"
          style="background-color: #b17a33d4"
          @click="handleCode(scope)"
          :loading="scope.row.loading"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_code_${scope.rowIndex}_documentDetail`"
        >
          追溯码
        </Button>
      </template>
    </EditableTable>
  </div>
</template>

<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}
</style>
