<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table.js';

import { h, onMounted, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ChcSelect } from '@vben/chc-ui';
import { EditableTable } from '#/components/editableTable';
import { $t } from '#/locales';

import { handlePriceToFixedTwo } from '#/utils/util';

import { queryOrderPlanLineInfo, saveDo, saveLine } from './api';

const route = useRoute();
const userStore: any = useUserStore();
const ROWKEYFIELD = 'productCode';
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const departmentId = ref<number | string>('');

const selectParams = ref<{ [key: string]: any }>({
  warehouseId: currentHandleRow.value?.toWarehouseId || undefined,
  productControlLevel: userStore.userInfo?.isProductControlLevel
    ? currentHandleRow.value.productControlLevel
    : undefined,
});
// 用于在新增时临时存储从外部带进来的数据，第一次渲染后，就删掉对应字段
const tempData = ref({
  productControlLevel: userStore.userInfo?.isProductControlLevel
    ? currentHandleRow.value.productControlLevel
    : undefined,
  toWarehouseId: currentHandleRow.value?.toWarehouseId,
  departmentId: currentHandleRow.value?.departmentId,
  warehouseId: currentHandleRow.value?.warehouseId,
});
// 表格列配置
const gridColumns = ref<VxeGridProps['columns']>([
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
    sortable: true,
  },
  {
    field: 'productName',
    minWidth: 130,
    title: '药品名称',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    minWidth: 120,
    sortable: true,
  },
  {
    field: 'modelNo',
    title: '型号',
    minWidth: 100,
    sortable: true,
    visible: false,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    minWidth: 130,
    sortable: true,
  },
  {
    field: 'uomName',
    title: '单位',
    minWidth: 90,
    sortable: true,
  },
  {
    field: 'qtyApplied',
    title: '申请数量',
    sortable: true,
    minWidth: 90,
    align: 'right',
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
      },
    },
  },
  {
    field: 'replenishPackageQty',
    title: '定数',
    minWidth: 80,
    sortable: true,
    visible: false,
  },
  {
    field: 'qtyOnHand',
    title: '库存数量',
    minWidth: 90,
    sortable: true,
    align: 'right',
  },
  {
    field: 'description',
    title: '备注',
    minWidth: 150,
    sortable: true,
    editRender: {
      name: 'ChcInput',
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
    width: 70,
  },
]);

// 表格表单配置
const formSchema: VbenFormProps['schema'] = [
  {
    fieldName: 'departmentId',
    label: '院区',
    formItemClass: 'pb-2',
    component: 'ChcSelect',
    // defaultValue: currentHandleRow.value?.departmentId || undefined,
    componentProps: {
      disabled: !!currentHandleRow.value?.applyPlanId,
      dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
      // apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      placeholder: '请选择院区',
      paginate: false,
      allowClear: true,
      filterByFrontEnd: true,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      showChooseAll: false,
      onChange(val: any) {
        departmentId.value = val;
      },
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
  },
  {
    fieldName: 'toWarehouseId',
    label: '申请仓库',
    formItemClass: 'pb-2',
    component: 'ChcSelect',
    // defaultValue: currentHandleRow.value?.toWarehouseId || undefined,
    componentProps: {
      disabled: !!currentHandleRow.value?.applyPlanId,
      dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
      placeholder: '请选择申请仓库',
      paginate: false,
      labelField: 'name',
      valueField: 'id',
      triggerFields: ['departmentId', 'regionId'],
      immediate: false,
      showChooseAll: false,
      onChange(val: any) {
        selectParams.value.warehouseId = val;
      },
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['departmentId', 'regionId'],
      async trigger(values: any) {
        const toWarehouseRef =
          editableTableRef.value?.formApi.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('toWarehouseId');
        if (toWarehouseRef) {
          if (detailConfig.value?.type === 'add') {
            if (values.departmentId) {
              toWarehouseRef.params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              await toWarehouseRef.fetchApi();
              toWarehouseRef.setModelValue(tempData.value.toWarehouseId);
              tempData.value.toWarehouseId = undefined;
            } else {
              toWarehouseRef.clearOptions();
              toWarehouseRef.setModelValue(undefined);
              tempData.value.toWarehouseId = undefined;
            }
          } else {
            toWarehouseRef.params.dependencies = {
              regionId: values.departmentId,
              departmentId: values.departmentId,
            };
            await toWarehouseRef.fetchApi();
            toWarehouseRef.setModelValue(currentHandleRow.value.toWarehouseId);
          }
        }
      },
    },
  },
  {
    fieldName: 'warehouseId',
    label: '上级仓库',
    formItemClass: 'pb-2',
    component: 'ChcSelect',
    // defaultValue: currentHandleRow.value?.warehouseId || undefined,
    componentProps: {
      disabled: !!currentHandleRow.value?.applyPlanId,
      dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
      placeholder: '请选择上级仓库',
      paginate: false,
      allowClear: true,
      labelField: 'name',
      triggerFields: ['toWarehouseId'],
      valueField: 'id',
      immediate: false,
      showChooseAll: false,
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['toWarehouseId'],
      async trigger(values: any) {
        const warehouseRef =
          editableTableRef.value?.formApi.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('warehouseId');
        if (warehouseRef) {
          if (detailConfig.value?.type === 'add') {
            if (values.toWarehouseId) {
              warehouseRef.params.dependencies = {
                toWarehouseId: values.toWarehouseId,
              };
              await warehouseRef.fetchApi();
              warehouseRef.setModelValue(tempData.value.warehouseId);
              tempData.value.warehouseId = undefined;
            } else {
              warehouseRef.clearOptions();
              warehouseRef.setModelValue(undefined);
              tempData.value.warehouseId = undefined;
            }
          } else {
            warehouseRef.params.dependencies = {
              toWarehouseId: values.toWarehouseId,
            };
            await warehouseRef.fetchApi();
            warehouseRef.setModelValue(currentHandleRow.value.warehouseId);
          }
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'productControlLevel',
    label: '商品组',
    formItemClass: 'pb-2',
    componentProps: {
      disabled: !!currentHandleRow.value?.applyPlanId,
      dictUrl: '/productAction/productControlLevelList.do',
      placeholder: '请选择商品组',
      paginate: false,
      allowClear: true,
      labelField: 'name',
      valueField: 'id',
      immediate: true,
      showChooseAll: false,
      onChange(val: any) {
        selectParams.value.productControlLevel = val;
      },
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['warehouseId'],
      if: () => {
        return userStore.userInfo?.isProductControlLevel;
      },
      async trigger() {
        const productControlLevelRef =
          editableTableRef.value?.formApi.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('productControlLevel');
        if (productControlLevelRef) {
          if (detailConfig.value?.type === 'add') {
            productControlLevelRef?.setModelValue(
              tempData.value.productControlLevel,
            );
            tempData.value.productControlLevel = undefined;
          } else {
            productControlLevelRef?.setModelValue(
              currentHandleRow.value.productControlLevel,
            );
          }
        }
      },
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'applyPlanDate',
    label: '计划月份',
    formItemClass: 'col-span-1 pb-2',
    defaultValue:
      detailConfig.value?.type === 'add'
        ? currentHandleRow.value?.applyPlanDate ||
          dayjs().add(1, 'month').format('YYYY-MM-01')
        : dayjs().format('YYYY-MM-01'),
    componentProps: {
      picker: 'month',
      format: 'YYYY-MM',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: '备注',
    formItemClass: 'pb-2',
    defaultValue: currentHandleRow.value?.description || undefined,
    componentProps: {
      placeholder: '请输入备注',
    },
  },
];

// 初始化表格数据
onMounted(async () => {
  if (currentHandleRow.value?.applyPlanId) {
    editableTableRef.value!.showLoading = true;
    queryOrderPlanLineInfo({
      applyPlanId: currentHandleRow.value.applyPlanId,
    }).then(async (res) => {
      if (res.success) {
        editableTableRef.value?.initRows(res.rows);
        editableTableRef.value!.showLoading = false;
      } else {
        message.error(res.msg);
      }
    });
  }
  await nextTick();
  const departmentIdRef =
    editableTableRef.value?.formApi.getFieldComponentRef<
      InstanceType<typeof ChcSelect>
    >('departmentId');
  if (departmentIdRef) {
    if (detailConfig.value?.type === 'add') {
      await departmentIdRef.fetchApi();
      if (tempData.value.departmentId) {
        departmentIdRef.setModelValue(tempData.value.departmentId);
        tempData.value.departmentId = undefined;
      } else {
        departmentIdRef.selectFirstOption();
      }
    } else {
      await departmentIdRef.fetchApi();
      departmentIdRef.setModelValue(currentHandleRow.value.departmentId);
    }
  }
});

// 验证是否能添加行
const validateIfCanAddRow = () => {
  return new Promise<boolean>((resolve) => {
    editableTableRef.value?.formApi.getValues().then((temFormData) => {
      const formValues: Record<string, any> = {
        departmentId: temFormData.departmentId,
        toWarehouseId: temFormData.toWarehouseId,
        warehouseId: temFormData.warehouseId,
        applyPlanDate: temFormData.applyPlanDate,
        productControlLevel: temFormData.productControlLevel,
      };

      if (formValues.departmentId === '') {
        message.warning('院区不能选择全部，请选择具体院区');
        resolve(false);
        return;
      }

      const requiredFields = [
        { field: 'departmentId', label: '院区' },
        { field: 'toWarehouseId', label: '申请仓库' },
        { field: 'warehouseId', label: '上级仓库' },
        { field: 'applyPlanDate', label: '计划月份' },
        ...(userStore.userInfo?.isProductControlLevel
          ? [{ field: 'productControlLevel', label: '商品组' }]
          : []),
      ];

      for (const { field, label } of requiredFields) {
        if (!formValues[field]) {
          message.warning(`请选择${label}`);
          resolve(false);
          return;
        }
      }
      resolve(true);
    });
  });
};

// 获取新增行数据
const getAddRowData = (option: any, formValue: any) => {
  return new Promise((resolve) => {
    // 直接返回选项数据
    resolve({
      ...option,
      // qtyApplied: 0,
    });
  });
};

// 行数据验证
function rowDataValidate(row: any) {
  return new Promise<boolean>((resolve, reject) => {
    if (!row.qtyApplied || row.qtyApplied <= 0) {
      message.error('申请数量必须大于零!');
      reject(new Error('申请数量必须大于零!'));
    } else {
      resolve(true);
    }
  });
}

// 构建查询参数
const queryparams = (
  type: 'saveDo' | 'saveLine' | 'delete',
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

  lineData = JSON.stringify({
    created: type === 'saveLine' ? filteredRows : [],
    updated: type === 'saveDo' ? filteredRows : [],
    removed: type === 'delete' ? filteredRows : [],
  });

  return {
    applyPlanId: currentHandleRow.value?.applyPlanId || 0,
    toWarehouseId:
      formValues.toWarehouseId || currentHandleRow.value?.toWarehouseId,
    departmentId:
      formValues.departmentId || currentHandleRow.value?.departmentId,
    warehouseId: formValues.warehouseId || currentHandleRow.value?.warehouseId,
    applyPlanDate:
      formValues.applyPlanDate || currentHandleRow.value?.applyPlanDate,
    description: formValues.description || currentHandleRow.value?.description,
    lineData,
    ...(userStore.userInfo?.isProductControlLevel
      ? {
          productControlLevel:
            formValues.productControlLevel ||
            currentHandleRow.value?.productControlLevel,
        }
      : {}),
  };
};

// 保存行数据
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi
      .getValues()
      .then((res: any) => {
        const type = row.applyPlanLineId ? 'saveDo' : 'saveLine';
        const params = queryparams(type, res, [row]);
        saveLine(params)
          .then((res) => {
            if (!currentHandleRow.value?.applyPlanId) {
              currentHandleRow.value = { applyPlanId: res.id };
              editableTableRef.value?.formApi.setFieldValue(
                'applyPlanId',
                res.id,
              );
            }
            queryOrderPlanLineInfo({ applyPlanId: res.id }).then((resIn) => {
              const newRow = resIn.rows.find(
                (item: any) => item.applyPlanLineId === res.applyPlanLineId,
              );
              resolve(newRow);
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

// 删除行数据
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

// 表格额外配置
const gridOptions: VxeGridProps = {
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
};

// 整体保存
const totalSave = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo(params)
        .then(() => {
          currentTab.value = 0;
          message.success('保存成功');
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

// 整体提交
const totalSubmit = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo({ ...params, doCommit: 'Y' })
        .then(() => {
          currentTab.value = 0;
          message.success('单据提交成功');
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

// 批量添加模态框配置
const batchAddModalGridOptions: SchemaColumnAndOptions = {
  gridColumns: [
    { type: 'checkbox', title: '', width: 50, align: 'center' },
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
      align: 'right',
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
      align: 'right',
      title: '库存',
    },
  ],
  dataTableId: '/productAction/query.do',
};

const batchAddModalFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'productCode',
      componentProps: {
        placeholder: '编码、名称、拼首码、规格',
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturer',
      componentProps: {
        placeholder: '生产厂家',
        allowClear: true,
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'vendor',
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
    },
  ],
};

// 操作日志参数
const queryActionLogParams = (row: any) => {
  return {
    AD_Table_ID: 1_000_359,
    Record_ID: row.applyPlanLineId,
  };
};

// 处理黑名单变化
const handleBlackListChange = (blackList: string[]) => {
  // 更新表单字段禁用状态
  editableTableRef.value?.formApi.updateSchema([
    {
      fieldName: 'departmentId',
      componentProps: {
        disabled: !!currentHandleRow.value?.applyPlanId || blackList.length > 0,
      },
    },
    {
      fieldName: 'toWarehouseId',
      componentProps: {
        disabled: !!currentHandleRow.value?.applyPlanId || blackList.length > 0,
      },
    },
    {
      fieldName: 'warehouseId',
      componentProps: {
        disabled: !!currentHandleRow.value?.applyPlanId || blackList.length > 0,
      },
    },
  ]);
};
</script>
<template>
  <div class="h-full">
    <EditableTable
      id="applyplanInputEditableTable"
      ref="editableTableRef"
      :row-data-validate="rowDataValidate"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailConfig?.type"
      :form-schema="formSchema"
      :single-select-props="{
        extraParams: selectParams,
        filterField: 'productCode',
        queryModelValueField: 'model',
        refreshOptionsWhenOpenDropdown: true,
        placeholder: '请输入药品编码、药品名称、规格',
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
      :search-input-props="{
        placeholder: '请输入药品关键词',
      }"
      @blackListChange="handleBlackListChange"
    >
    </EditableTable>
  </div>
</template>
<style scoped></style>
