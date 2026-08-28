<script lang="ts" setup>
import { nextTick, ref, toRaw } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { VxeUI } from '@vben/plugins/vxe-table';
import { requestFormClient } from '#/api/request.js';

const VxeDatePicker = VxeUI.getComponent('VxeDatePicker');

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import LazySearch from '#/utils/LazySearch';
import {
  getWarehousePolicyByWarehouse,
  saveDepartmentWithdrawal,
} from '../api';

const modalOuterData = ref<any>();
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});

const isUseParentWarehouseCatalog = ref<boolean>(false);
const locatorParams = ref({
  warehouseId: '',
  productId: '',
});

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const selectedRows = ChcGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      return message.warning('请先选择要添加的商品');
    }

    // 校验勾选的数据必填字段
    const requiredFields = [
      { field: 'price', name: '价格' },
      { field: 'lot', name: '批号' },
      { field: 'guaranteeDate', name: '效期' },
      { field: 'taxInvoiceNo', name: '发票号' },
      { field: 'dateInvoiced', name: '发票日期' },
      { field: 'locatorId', name: '货位' },
      { field: 'qty', name: '数量' },
    ];

    for (const row of selectedRows) {
      for (const { field, name } of requiredFields) {
        if (!row[field]) {
          return message.warning(
            '勾选的数据价格，数量，批号，效期，发票号，发票日期和货位不能为空',
          );
        }
      }
    }

    console.warn('科退录入选中的数据:', selectedRows);
    const formValues = await ChcGridApi.formApi.getValues();
    const res = await saveDepartmentWithdrawal({
      warehouseId: modalOuterData.value?.warehouseId,
      lineData: JSON.stringify(selectedRows),
      fromWarehouseId: formValues.fromWarehouseId,
    });
    if (res && res.success) {
      console.warn('保存成功:', res);
      message.success(res.msg || '保存成功');
      modalOuterData.value?.onClose?.();
      modalApi.close();
    }
    // modalOuterData.value?.handleBatchChoose?.(selectedRows);
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;

      const res = await getWarehousePolicyByWarehouse({
        warehouseId: modalData?.warehouseId,
      });
      if (res && res.success) {
        isUseParentWarehouseCatalog.value =
          res.isUseParentWarehouseCatalog || false;
      }

      // 设置货位下拉的参数
      locatorParams.value.warehouseId = modalData?.warehouseId;

      // setTimeout(async () => {
      //   // 设置表单默认值
      //   await ChcGridApi.formApi.setValues({
      //     departmentId: modalData?.departmentId,
      //     warehouseId: modalData?.warehouseId,
      //     fromWarehouseId: modalData?.fromWarehouseId,
      //     storageStatus: modalData?.storageStatus,
      //   });

      //   // 触发查询
      //   searchController.sign(1);
      // }, 0);
    }
  },
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: true,
      collapsedRows: 1,
      wrapperClass: 'grid-cols-4',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values: any) => {
        const formValues = await ChcGridApi.formApi.getValues();

        // 校验上级仓库是否有值
        if (!formValues.fromWarehouseId) {
          return message.warning('请选择上级仓库');
        }

        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.query(formValues);
      },
      commonConfig: {
        labelClass: 'w-[fit-content]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      checkboxConfig: {
        checkMethod: (scope: any) => {
          return true;
        },
      },
      editConfig: {
        trigger: 'click',
        mode: 'cell',
        autoClear: true,
        enabled: true,
        showStatus: true,
      },
    }),
    gridEvents: {
      editActivated: async (scope: any) => {
        if (scope.column.field === 'locatorId') {
          locatorParams.value.productId = scope.row.productId;

          // 调用接口获取该行的 locatorId
          if (!scope.row.locatorId) {
            try {
              const res = await requestFormClient.post(
                '/warehouseAction/getLocator',
                {
                  warehouseId: locatorParams.value.warehouseId,
                  productId: locatorParams.value.productId,
                },
              );
              console.warn('getLocator接口返回值:', res);

              // 将返回的 locatorId 赋值给当前行
              if (res.data?.locatorId) {
                scope.row.locatorId = res.data.locatorId;
                scope.row.locatorName = res.data.locatorName || '';
              }
            } catch (error) {
              console.error('getLocator接口调用失败:', error);
            }
          }
        }
      },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'productCode',
        minWidth: 110,
        sortable: true,
        title: '商品编码',
      },
      {
        field: 'productName',
        minWidth: 135,
        sortable: true,
        title: '商品名称',
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
        sortable: false,
        title: '单位',
      },
      {
        field: 'price',
        minWidth: 100,
        sortable: false,
        align: 'right',
        title: '价格',
        editRender: {
          name: 'ChcInputNumber',
          props: {
            min: 0,
          },
        },
      },
      {
        field: 'qty',
        minWidth: 100,
        sortable: false,
        align: 'right',
        title: '数量',
        editRender: {
          name: 'ChcInputNumber',
          props: {
            min: 0,
          },
        },
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        editRender: {
          name: 'ChcInput',
        },
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '120',
        editRender: {},
        slots: { edit: 'edit_guaranteeDate' },
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '110',
        sortable: false,
        editRender: {
          name: 'ChcInput',
        },
      },
      {
        field: 'dateInvoiced',
        title: '发票日期',
        width: '120',
        sortable: false,
        editRender: {},
        slots: { edit: 'edit_dateInvoiced' },
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: '120',
        sortable: false,
        editRender: {},
        slots: { edit: 'edit_productionDate' },
      },
      {
        field: 'locatorId',
        title: '货位',
        width: '120',
        sortable: false,
        formatter: ({ row }: any) => {
          return row.locatorName;
        },
        editRender: {
          name: 'ChcSelect',
          props: {
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            dictUrl: '/warehouseAction/wareLocatorList.do',
            onChange(val: any, option: any, scope: any) {
              scope.row.locatorId = val;
              scope.row.locatorName = option?.label;
            },
            handleParams: (params: any) => {
              console.warn('handleParams-当前品种', locatorParams.value);
              return {
                ...params,
                warehouseId: locatorParams.value.warehouseId,
                isScatter: 'Y',
                // productId: locatorParams.value.productId,
                type: 'locator',
              };
            },
            labelField: 'name',
            valueField: 'id',
            queryModelValueField: 'locatorId',
            afterFetch(res: any) {
              return res.rows;
            },
          },
        },
      },
    ],
    formSchema: [
      // {
      //   component: 'ChcSelect',
      //   fieldName: 'warehouseId',
      //   formItemClass: 'col-span-1',
      //   label: '申请仓库',
      //   componentProps: {
      //     dictUrl:
      //       '/baseHandleAction/warehouse.do?level1=N&readWrite=Y&isHis=N',
      //     placeholder: '请选择申请仓库',
      //     paginate: false,
      //     allowClear: true,
      //     immediate: true,
      //     labelField: 'name',
      //     valueField: 'id',
      //     disabled: true,
      //     afterFetch(res: any) {
      //       return { ...res, rows: undefined, records: res.rows || [] };
      //     },
      //   },
      // },
      {
        component: 'ChcSelect',
        fieldName: 'fromWarehouseId',
        formItemClass: 'col-span-1',
        label: '上级仓库',
        componentProps: {
          dictUrl:
            '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y&level2=Y&level3=N',
          placeholder: '请选择上级仓库',
          allowClear: true,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendor',
        formItemClass: 'col-span-1',
        label: '供应商',
        componentProps: {
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择供应商',
          paginate: false,
          filterByFrontEnd: true,
          labelField: 'name',
          valueField: 'id',
          immediate: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productCode',
        formItemClass: 'col-span-1',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称/规格',
        },
      },
    ],
    dataTableId: '/productAction/query.do',
    id: 'departmentReturnBatch',
    beforeFetchFn: (params) => {
      // console.log(11111111, params);

      return {
        ...params,
        records: params.rows,
        warehouseId: isUseParentWarehouseCatalog.value
          ? params.fromWarehouseId
          : modalOuterData.value.warehouseId,
      };
    },
    afterFetchFn: (params) => {
      const records = (params.rows || []).map((row: any) => ({
        ...row,
        guaranteeDate: row.guaranteeDate || '',
        dateInvoiced: row.dateInvoiced || '',
        productionDate: row.productionDate || '',
      }));
      return {
        ...params,
        records: records,
      };
    },
  },
);
</script>

<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="科退录入"
    title-tooltip="多选后点击确定添加到科退单"
  >
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #edit_guaranteeDate="{ row }">
          <VxeDatePicker v-model="row.guaranteeDate" />
        </template>
        <template #edit_dateInvoiced="{ row }">
          <VxeDatePicker v-model="row.dateInvoiced" />
        </template>
        <template #edit_productionDate="{ row }">
          <VxeDatePicker v-model="row.productionDate" />
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>

<style scoped>
::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>
