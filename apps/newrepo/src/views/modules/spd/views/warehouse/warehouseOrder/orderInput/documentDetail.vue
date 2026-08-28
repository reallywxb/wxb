<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import {
  dataCommit,
  getOrderPlanStorage,
  getWarehousePolicyByWarehouse,
  queryOrderLineInfo,
  saveDo,
  saveLine,
} from './api';
import { isEmpty } from '@vben/utils';
import { ref, onMounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import { EditableTable } from '#/components/editableTable';
import { cloneDeep } from 'lodash-es';
import { ChcSelect } from '@vben/chc-ui';
import {
  handleAllPrice,
  handlePriceToFixedTwo,
  handlePrice,
} from '#/utils/util';
import dayjs from 'dayjs';
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;

const urlParams: any = {
  showStorage: urlParamsObj?.showStorage || 'N',
  isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
  showPrice: urlParamsObj?.showPrice || 'Y',
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  specShowType: urlParamsObj?.specShowType || '',
};
const selectParams = ref<{ [key: string]: any }>({
  isReplenish: 'Y',
  showVendorName: 'N',
  productControlLevel: currentHandleRow.value.productControlLevel || undefined,
  // warehouseId: currentHandleRow.value.warehouseId || undefined,
  showStorage: urlParams.showStorage,
  showPrice: urlParams.showPrice,
  warehouseId: currentHandleRow.value.toWarehouseId || undefined,
  fromWarehouseId: currentHandleRow.value.fromWarehouseId || undefined,
  specWarehouseId:
    urlParams.specShowType === 'from'
      ? currentHandleRow.value.warehouseId
      : currentHandleRow.value.toWarehouseId,
  otherValue: currentHandleRow.value.warehouseId || undefined,
});
const warehouseParams = ref({
  regionId: 0,
});
const toWarehouseParams = ref<any>({
  level2: currentHandleRow.value?.toWarehouseId ? 'Y' : '',
  level3: currentHandleRow.value?.toWarehouseId ? 'Y' : '',
  level4: currentHandleRow.value?.toWarehouseId ? 'Y' : '',
  toWarehouseId: currentHandleRow.value?.toWarehouseId || '',
});
const orderIds = ref<(number | string)[]>([]);
const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const rowDataValidate = (row: any) => {
  return new Promise<boolean>((resolve, reject) => {
    if (row.qtyOrdered > 0) {
      resolve(true);
    } else {
      message.error('申请数量必须大于零!');
      reject(new Error('申请数量必须大于零!'));
    }
  });
};
/**
 * 表格列配置
 */
const gridColumns = ref<VxeGridProps['columns']>([
  {
    type: 'checkbox',
    title: '',
    width: 40,
    align: 'center',
    fixed: 'left',
  },
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
    // showOverflow: true,
  },
  {
    field: 'productName',
    minWidth: 130,
    title: '药品',
    sortable: true,
  },
  {
    field: 'medicineName',
    minWidth: 130,
    title: '通用名',
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
    field: 'manufacturer',
    minWidth: 130,
    title: '厂家',
    sortable: true,
  },
  {
    field: 'uomName',
    minWidth: 60,
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
    minWidth: 90,
    align: 'right',
    editRender: {
      name: 'ChcInputNumber',
      props: {
        // ...getVxeNumIptProps('qtyOrdered', (currentRow: any) => {
        //   currentRow.currentPriceAmt =
        //     currentRow.isGift === 'Y'
        //       ? 0
        //       : (
        //           handlePrice(currentRow.qtyOrdered) *
        //           handlePrice(currentRow.price)
        //         ).toFixed(2);
        // }),
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          if (currentRow.isGift === 'Y') {
            currentRow.currentPriceAmt = 0;
          } else {
            currentRow.currentPriceAmt = handleAllPrice(
              currentRow.price,
              currentRow.qtyOrdered,
            );
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
    minWidth: 100,
    align: 'right',
    sortable: true,
  },
  {
    field: 'mPackageQty',
    title: '中包装数',
    align: 'right',
    minWidth: 80,
  },
  {
    field: 'qtyOnHand',
    title: '库存数量',
    align: 'right',
    minWidth: 80,
  },
  {
    field: 'qtyShipment',
    title: '流水数量',
    align: 'right',
    minWidth: 80,
  },
  {
    field: 'qtyOnHandFrom',
    title: '上级库库存',
    align: 'right',
    visible: urlParams.showStorage !== 'N',
    minWidth: 90,
  },
  {
    field: 'qtyApplied',
    title: '月度计划数量',
    align: 'right',
    visible: urlParams.isUseMonthlyWO !== 'N',
    minWidth: '120',
  },
  {
    field: 'monthQtyOrdered',
    title: '本月请领数量',
    align: 'right',
    visible: urlParams.isUseMonthlyWO !== 'N',
    minWidth: '120',
  },
  {
    field: 'qtyLeft',
    title: '剩余数量',
    align: 'right',
    visible: urlParams.isUseMonthlyWO !== 'N',
    minWidth: '90',
  },
  {
    field: 'qtyMoving',
    title: '院内在途',
    align: 'right',
    minWidth: '90',
  },
  {
    field: 'description',
    title: '备注',
    editRender: {
      name: 'ChcInput',
    },
    width: '150px',
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: detailConfig.value?.type === 'view' ? '' : '操作',
    width: detailConfig.value?.type === 'view' ? 10 : 85,
  },
]);
/**
 * 表格额外的配置项
 */
const gridOptions: VxeGridProps = {
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
  cellStyle: (scope: any) => {
    const finalStyle: { [key: string]: number | string } = {
      color: '',
      backgroundColor: '',
    };
    if (
      editableTableRef.value?.editFieldArr?.includes(scope.column.field) &&
      detailConfig.value?.type !== 'view'
    ) {
      finalStyle.backgroundColor = '#D7FFF5';
      // Object.defineProperty(finalStyle, 'backgroundColor', '#D7FFF5');
    }
    if (
      scope.column.field === 'price' &&
      scope.row.price !== scope.row.priceList
    ) {
      finalStyle.color = 'red';
      // Object.defineProperty(finalStyle, 'color', 'red');
    }
    return finalStyle;
  },
};
const toWarehouseParentId = ref('');
// 是否开启上级仓库目录
const isUseParentWarehouseCatalog = ref<boolean>(false);
/**
 * 表格表单配置
 */
const formSchema: VbenFormProps['schema'] = [
  {
    fieldName: 'departmentId',
    label: '院区',
    component: 'ChcSelect',
    formItemClass: 'pb-2',
    componentProps: {
      dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      disabled: !!currentHandleRow.value.orderId,
      placeholder: '请选择院区',
      paginate: false,
      allowClear: true,
      showChooseAll: false,
      filterByFrontEnd: true,
      async onChange(val: any) {
        warehouseParams.value.regionId = val;
      },
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'deliveryPlanDate',
    label: '要求送达时间',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      disabled: !!currentHandleRow.value.orderId,
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? dayjs(dayjs().format('YYYY-MM-DD'))
            .add(1, 'day')
            .add(10, 'hour')
            .format('YYYY-MM-DD HH:mm')
        : currentHandleRow.value?.deliveryPlanDate || undefined,
    formItemClass: 'pb-2',
  },
  {
    fieldName: 'toWarehouseId',
    label: '申请仓库',
    component: 'ChcSelect',
    formItemClass: 'pb-2',
    componentProps: {
      dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
      placeholder: '请选择申请仓库',
      triggerFields: ['departmentId'],
      requestContentType: 'application/x-www-form-urlencoded',
      extraParams: warehouseParams.value,
      apiType: 'post',
      disabled: !!currentHandleRow.value.orderId,
      paginate: false,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      showChooseAll: false,
      async onChange(val: any) {
        // 调用接口获取仓库策略
        if (val) {
          const res = await getWarehousePolicyByWarehouse({ warehouseId: val });
          if (res && res.success) {
            isUseParentWarehouseCatalog.value =
              res.isUseParentWarehouseCatalog || false;
          }
        } else {
          isUseParentWarehouseCatalog.value = false;
        }
        await updateSingleSelectParams();
      },
      afterFetch(res: any) {
        const rows = res.rows;
        return { ...res, rows: undefined, records: rows };
      },
    },
    dependencies: {
      triggerFields: ['departmentId'],
      async trigger(values: any) {
        const chcSelectRef: InstanceType<typeof ChcSelect> | undefined =
          editableTableRef.value?.formApi?.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('toWarehouseId');
        if (chcSelectRef) {
          if (values.departmentId) {
            if (detailConfig.value?.type === 'add') {
              chcSelectRef.params.dependencies = {
                departmentId: values.departmentId,
              };
              await chcSelectRef.fetchApi();
              const res = chcSelectRef.selectFirstOption();
              toWarehouseParentId.value = res?.parentId;
            } else {
              chcSelectRef.params.dependencies = {
                departmentId: values.departmentId,
              };
              await chcSelectRef.fetchApi();
              chcSelectRef.setModelValue(currentHandleRow.value.toWarehouseId);
            }
          } else {
            chcSelectRef.clearOptions();
            chcSelectRef.setModelValue(undefined);
          }
        }
      },
    },
  },
  {
    fieldName: 'warehouseId',
    label: '上级仓库',
    component: 'ChcSelect',
    formItemClass: 'pb-2',
    componentProps: {
      dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
      placeholder: '请选择上级仓库',
      triggerFields: ['toWarehouseId'],
      extraParams: toWarehouseParams.value,
      paginate: false,
      allowClear: true,
      disabled: !!currentHandleRow.value.orderId,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      showChooseAll: false,
      async onChange() {
        await updateSingleSelectParams();
      },
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['toWarehouseId'],
      async trigger(values: any) {
        const chcSelectRef: InstanceType<typeof ChcSelect> | undefined =
          editableTableRef.value?.formApi?.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('warehouseId');
        if (chcSelectRef) {
          if (values.toWarehouseId) {
            if (detailConfig.value?.type === 'add') {
              chcSelectRef.params.dependencies = {
                toWarehouseId: values.toWarehouseId,
              };
              await chcSelectRef.fetchApi();
              if (toWarehouseParentId.value) {
                chcSelectRef.setModelValue(toWarehouseParentId.value);
                toWarehouseParentId.value = '';
              } else {
                chcSelectRef.selectFirstOption();
              }
            } else {
              chcSelectRef.params.dependencies = {
                toWarehouseId: values.toWarehouseId,
              };
              await chcSelectRef.fetchApi();
              chcSelectRef.setModelValue(currentHandleRow.value.warehouseId);
            }
          } else {
            chcSelectRef.clearOptions();
            chcSelectRef.setModelValue(undefined);
          }
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/productAction/productControlLevelList.do',
      placeholder: '请选择商品组',
      triggerFields: ['warehouseId'],
      paginate: false,
      allowClear: true,
      disabled: !!currentHandleRow.value.orderId,
      immediate: false,
      showChooseAll: false,
      labelField: 'name',
      valueField: 'id',
      async onChange() {
        await updateSingleSelectParams();
      },
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['warehouseId'],
      async trigger(values) {
        const chcSelectRef: InstanceType<typeof ChcSelect> | undefined =
          editableTableRef.value?.formApi?.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('productControlLevel');
        if (chcSelectRef) {
          if (values.warehouseId) {
            if (detailConfig.value?.type === 'add') {
              // 上级仓库修改
              chcSelectRef.params.dependencies = {
                warehouseId: values.warehouseId,
              };
              await chcSelectRef.fetchApi();
              chcSelectRef.setModelValue(undefined);
            } else {
              // 编辑和查看时回显
              chcSelectRef.params.dependencies = {
                warehouseId: values.warehouseId,
              };
              await chcSelectRef.fetchApi();
              chcSelectRef.setModelValue(
                currentHandleRow.value.productControlLevel,
              );
            }
          } else {
            chcSelectRef.clearOptions();
            chcSelectRef.setModelValue(undefined);
          }
          // 更新单选下拉参数，并且更新下拉数据
          await updateSingleSelectParams();
        }
      },
    },
    fieldName: 'productControlLevel',
    label: '商品组',
    formItemClass: 'pb-2',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/refList.do?id=154',
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      disabled: !!currentHandleRow.value.orderId,
      placeholder: '请选择优先级',
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      afterFetch(res: any) {
        if (detailConfig.value?.type === 'add') {
          nextTick(() => {
            const item = res.rows.find((item: any) => item.name === '普通');

            if (!isEmpty(item)) {
              editableTableRef.value?.formApi?.setFieldValue(
                'priorityRule',
                item?.id || '',
              );
            }
          });
        }
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    // 默认值 是普通
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.priorityRule,
    fieldName: 'priorityRule',
    label: '优先级',
    formItemClass: 'pb-2',
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: '备注',
    componentProps: {
      placeholder: '请输入备注',
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.description,
    formItemClass: 'pb-2 col-span-1',
  },
];
/**
 * 校验当前是否可以添加行
 */
const validateIfCanAddRow = () => {
  return new Promise<boolean>((resolve) => {
    // 验证必填字段
    editableTableRef.value?.formApi.getValues().then(async (temFormData) => {
      const formValues: { [key: string]: any } = {
        toWarehouseId:
          temFormData.toWarehouseId || currentHandleRow.value.toWarehouseId,
        departmentId:
          temFormData.departmentId || currentHandleRow.value.departmentId,
        warehouseId:
          temFormData.warehouseId || currentHandleRow.value.warehouseId,
        isPrecious: temFormData.isPrecious || currentHandleRow.value.isPrecious,
        priorityRule:
          temFormData.priorityRule || currentHandleRow.value.priorityRule,
      };
      const requiredFields = [
        { field: 'departmentId', label: '院区' },
        { field: 'toWarehouseId', label: '申请仓库' },
        { field: 'warehouseId', label: '上级仓库' },
        { field: 'priorityRule', label: '优先级' },
      ];
      let errorMsg: string = '';
      for (const { field, label } of requiredFields) {
        if (!formValues[field]) {
          errorMsg = label;
          break;
        }
      }
      if (errorMsg) {
        await nextTick();
        message.warning(`请先选择${errorMsg}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
/**
 * 根据用户选择的项获取新增行数据
 */
const getAddRowData = (option: any, formValues: any) => {
  return new Promise((resolve) => {
    getOrderPlanStorage({
      warehouseId: formValues.toWarehouseId,
      specWarehouseId:
        urlParams.specShowType === 'from'
          ? formValues.warehouseId
          : formValues.toWarehouseId,
      fromWarehouseId: formValues.warehouseId,
      productId: option.productId,
    }).then((response) => {
      resolve({
        ...option,
        ...response,
        currentPricePo: option.pricePO,
        currentPriceAmt: 0,
        qtyOnHand: response.storageQty,
        qtyOnHandFrom: response.storageQtyFrom,
        qtyMoving: response.qtyMoving,
        description: '',
        isGift: 'N',
      });
    });
  });
};
/**
 * 构建接口参数
 */
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
    delete row.vendorId;
    delete row.vendorName;
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
    orderIds:
      orderIds.value.length > 0
        ? orderIds.value.join(',')
        : currentHandleRow.value.orderId || 0,
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
    priorityRule:
      formValues.priorityRule || currentHandleRow.value.priorityRule,
    productControlLevel:
      formValues.productControlLevel ||
      currentHandleRow.value.productControlLevel,
    orderType: 'WO',
    returnDoc: 'N',
    isReplenish: 'Y',
    description: formValues.description || currentHandleRow.value.description,
    isPackaged: 'N',
    pleaseCollect:
      formValues.pleaseCollect || currentHandleRow.value.pleaseCollect,
    departmentBudgetPrice:
      formValues.departmentBudgetPrice ||
      currentHandleRow.value.departmentBudgetPrice,
    // 要求送达时间
    deliveryPlanDate:
      formValues.deliveryPlanDate || currentHandleRow.value.deliveryPlanDate,
    lineData,
  };
};
/**
 * 保存行数据,单行保存
 */
const saveRow = (row: any) => {
  return new Promise((resolve) => {
    editableTableRef.value?.formApi
      .getValues()
      .then((formVal: any) => {
        const params = queryparams(
          row.orderLineId ? 'saveDo' : 'saveLine',
          formVal,
          [row],
        );
        saveLine(params)
          .then((res) => {
            // 如果原先的 currentHandleRow.value.orderId 没值，说明是新增进来的
            // 此时需要更新 currentHandleRow.value.orderId
            if (!currentHandleRow.value.orderId) {
              currentHandleRow.value.orderId = res.data.header.orderId;
              editableTableRef.value?.formApi.setFieldValue(
                'orderId',
                res.data.header.orderId,
              );
            }
            // 更新 orderIds 数组
            orderIds.value = res.data.header.orderIds?.length
              ? res.data.header.orderIds
              : [res.data.header.orderId];
            queryOrderLineInfo({
              orderIds: orderIds.value.join(','),
            }).then((resIn) => {
              const newRow = resIn.rows.find(
                (item: any) => item.orderLineId === res.data.header.orderLineId,
              );
              resolve(newRow);
            });
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
/**
 * 删除行数据，支持多行删除
 */
const deleteRows = (rows: any[]) => {
  return new Promise((resolve) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('delete', res, rows);
      saveDo(params).then((res) => {
        resolve(res);
      });
    });
  });
};
/**
 * 整体保存接口调用
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
 * 整体提交接口调用
 */
const totalSubmit = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo({ ...params, doCommit: 'Y' })
        .then((res) => {
          if (res.success) {
            // 使用返回的 orderIds 提交
            dataCommit({
              orderId: JSON.stringify(orderIds.value),
            })
              .then(() => {
                message.success('单据提交成功');
                currentTab.value = 0;
                resolve(true);
              })
              .catch((error) => {
                console.error(error.msg);
                reject(error);
              });
          }
        })
        .catch((error) => {
          console.error(error.msg);
          reject(error);
        });
    });
  });
};

/**
 * 批量新增的表格配置
 */
const batchAddModalGridOptions: SchemaColumnAndOptions = {
  gridColumns: [
    {
      field: 'productCode',
      minWidth: 110,
      sortable: true,
      title: '药品编码',
    },
    {
      field: 'productName',
      minWidth: 135,
      sortable: true,
      title: '药品名称',
    },
    {
      field: 'productSpec',
      minWidth: 80,
      sortable: true,
      title: '规格',
    },
    {
      field: 'modelNo',
      minWidth: 100,
      sortable: true,
      title: '型号',
      visible: false,
    },
    {
      field: 'manufacturer',
      minWidth: 120,
      sortable: true,
      title: '厂家',
    },
    {
      field: 'uomName',
      minWidth: 60,
      sortable: true,
      title: '单位',
    },
    {
      field: 'price',
      minWidth: 100,
      sortable: true,
      title: '采购价',
    },
    {
      field: 'vendorName',
      minWidth: 180,
      sortable: true,
      title: '供应商',
    },
    {
      field: 'storageQty',
      minWidth: 70,
      sortable: true,
      title: '库存',
    },
    {
      field: 'markCode',
      minWidth: 100,
      sortable: true,
      title: '中标编码',
    },
    {
      field: 'productStateCode',
      title: '商品本位码',
      width: '100',
      formatter({ row }: any) {
        return row.productStateCode === 'Y' ? '是' : '否';
      },
    },
    { field: 'productControlLevelName', title: '商品组', width: '80' },
    {
      field: 'isBulkPurchase',
      title: '是否4+7',
      formatter({ row }: any) {
        return row.isBulkPurchase === 'Y' ? '是' : '否';
      },
      width: '80',
    },
    { field: 'certificateNo', title: '注册证号', width: '100' },
    { field: 'description', title: '备注', width: '100' },
  ],
  dataTableId: '/productAction/query.do',
  id: 'orderInput_batchChooseTable',
};
const queryActionLogParams = (row: any) => {
  return {
    AD_Table_ID: 260,
    Record_ID: row.orderLineId,
  };
};
/**
 * 批量新增表单配置
 */
const batchAddModalFormOptions: VbenFormProps = {
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '编码、名称、拼首码、规格',
        allowClear: true,
      },
      fieldName: 'productCode',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '生产厂家',
        allowClear: true,
      },
      fieldName: 'manufacturer',
    },
    {
      component: 'ChcSelect',
      componentProps: {
        placeholder: '供应商',
        allowClear: true,
        dictUrl: '/baseHandleAction/vendor.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        paginate: false,
        filterByFrontEnd: true,
        labelField: 'name',
        valueField: 'id',
        immediate: true,
        afterFetch: (res: any) => {
          return { ...res, rows: undefined, records: res.rows };
        },
      },
      fieldName: 'vendor',
    },
  ],
};
const handleBlackListChange = (blackList: string[]) => {
  if (detailConfig.value?.type === 'add') {
    // 只有在新增场景下，才更新禁用状态
    editableTableRef.value?.formApi.updateSchema([
      {
        fieldName: 'departmentId',
        componentProps: {
          // disabled: !!(currentHandleRow.value.orderId || blackList.length > 0),
          disabled: blackList.length > 0,
        },
      },
      {
        fieldName: 'deliveryPlanDate',
        componentProps: {
          // disabled: !!(currentHandleRow.value.orderId || blackList.length > 0),
          disabled: blackList.length > 0,
        },
      },
      {
        fieldName: 'toWarehouseId',
        componentProps: {
          // disabled: !!(currentHandleRow.value.orderId || blackList.length > 0),
          disabled: blackList.length > 0,
        },
      },
      {
        fieldName: 'warehouseId',
        componentProps: {
          // disabled: !!(currentHandleRow.value.orderId || blackList.length > 0),
          disabled: blackList.length > 0,
        },
      },
      {
        fieldName: 'productControlLevel',
        componentProps: {
          // disabled: !!(currentHandleRow.value.orderId || blackList.length > 0),
          disabled: blackList.length > 0,
        },
      },
      {
        fieldName: 'priorityRule',
        componentProps: {
          // disabled: !!(currentHandleRow.value.orderId || blackList.length > 0),
          disabled: blackList.length > 0,
        },
      },
    ]);
  }
};

/**
 * 初始化表格数据
 */
onMounted(async () => {
  if (currentHandleRow.value.orderId) {
    // 初始化 orderIds
    orderIds.value.push(currentHandleRow.value.orderId);
    editableTableRef.value!.showLoading = true;
    queryOrderLineInfo({
      orderIds: currentHandleRow.value.orderId,
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
  // 如果是编辑或者查看，手动给第一项院区赋值，触发后续依赖项的自动查询取值
  await nextTick();
  const departmentIdRef =
    editableTableRef.value?.formApi.getFieldComponentRef<
      InstanceType<typeof ChcSelect>
    >('departmentId');
  await departmentIdRef?.fetchApi();
  if (detailConfig.value?.type === 'add') {
    departmentIdRef?.selectFirstOption();
  } else {
    departmentIdRef?.setModelValue(currentHandleRow.value.departmentId);
  }
});
/**
 * 更新商品选择器的查询参数
 */
const updateSingleSelectParams = async () => {
  const res = await editableTableRef.value?.formApi.getValues<any>();
  // 如果开启了上级仓库目录，使用上级仓库的 warehouseId
  const finalWarehouseId = isUseParentWarehouseCatalog.value
    ? res.warehouseId
    : res.toWarehouseId;
  const newParams = {
    showStorage: urlParams.showStorage,
    showPrice: urlParams.showPrice,
    warehouseId: finalWarehouseId,
    fromWarehouseId: res.warehouseId,
    specWarehouseId:
      urlParams.specShowType === 'from' ? res.warehouseId : res.toWarehouseId,
    otherValue: res.isPrecious,
    productControlLevel:
      res.productControlLevel || currentHandleRow.value.productControlLevel,
  };
  Object.assign(selectParams.value, newParams);
};
/**
 * 用于在下拉列表的最后阶段处理接口数据
 */
const handleSelectParams = (params: any) => {
  const newParams = {
    ...params,
    current: undefined,
    pageNum: params.current,
    pageSize: params.size,
    size: undefined,
  };
  return newParams;
};
</script>
<template>
  <div class="h-full">
    <EditableTable
      class="buyPlanEditable"
      ref="editableTableRef"
      id="orderInputEditableTable"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailConfig?.type"
      :form-schema="formSchema"
      :single-select-props="{
        extraParams: selectParams,
        handleParams: handleSelectParams,
        filterField: 'productCode',
        queryModelValueField: 'model',
        refreshOptionsWhenOpenDropdown: true,
        optionColumns: [
          { header: '药品编码', name: 'productCode', width: 80 },
          { header: '药品名称', name: 'productName', width: 240 },
          { header: '规格', name: 'productSpec', width: 180 },
          { header: '厂家', name: 'manufacturer', width: 100 },
          { header: '单位', name: 'uomName', width: 80 },
          { header: '采购价', name: 'price', width: 80 },
          { header: '库存', name: 'storageQty', width: 80 },
        ],
      }"
      :validateIfCanAddRow="validateIfCanAddRow"
      :get-final-add-row-data="getAddRowData"
      :row-data-validate="rowDataValidate"
      :save-row="saveRow"
      :delete-rows="deleteRows"
      :totalSave="totalSave"
      :totalSubmit="totalSubmit"
      :batchAddModalGridOptions="batchAddModalGridOptions"
      :batchAddModalFormOptions="batchAddModalFormOptions"
      :queryActionLogParams="queryActionLogParams"
      @blackListChange="handleBlackListChange"
    >
      <!-- @blackListChange="handleBlackListChange" -->
    </EditableTable>
  </div>
</template>
<style scoped></style>
