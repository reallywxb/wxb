<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { SvgBatchJobIcon, SvgSquareTickIcon } from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import BatchSetModalComp from './batchSetModal.vue';

const extParams = ref<any>({
  isQuality: 'N',
});
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  // 默认不查询
  // const formValues = await chcGridApi?.formApi?.getValues();
  // chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  // isFirstLoaded.value = true;
  // chcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

const [ChcGrid, chcGridApi, { BatchSetModal, batchSetModalApi }] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      compact: true,
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      // pagerConfig: {
      //   enabled: false,
      // },
      editConfig: {
        enabled: true,
        trigger: 'click',
        mode: 'row',
        autoClear: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // 使用 vxe 内置序号配置，确保序号从 1 开始且稳定显示
      seqConfig: {
        /**
         * 自定义序号计算方法
         * @param params 当前单元格的上下文参数
         * @returns 从 1 开始的行序号
         */
        seqMethod: ({ rowIndex }: any) => rowIndex + 1,
        startIndex: 1,
      },
      stripe: false,
      cellStyle: (scope: any) => {
        if (
          scope.column.field === 'qty' ||
          scope.column.field === 'locatorIdTo' ||
          scope.column.field === 'storageStatusToName' ||
          scope.column.field === 'description'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {
        chcGridApi.grid.clearEdit();
      },
      // 全选/全不选事件
      checkboxAll: () => {
        chcGridApi.grid.clearEdit();
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
      },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'checkbox',
        title: '多选',
        width: 50,
        align: 'center',
        fixed: 'left',
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qtyAvailable',
        title: '可移库数量',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qty',
        title: '目标数量',
        editRender: {},
        slots: {
          edit: 'qtyEdit',
        },
        // edit: 'number',
        // verify:"number|required",
        minWidth: 90,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'locatorNameTo',
        title: '目标货位',
        minWidth: '130',
        visible: false,
        // "edit":"ProductPopWin",
        // "verify":"required"
      },
      {
        field: 'locatorIdTo',
        title: '目标货位',
        minWidth: '130',
        editRender: {},
        slots: {
          edit: 'locatorIdToEdit',
        },
        formatter({ row }: any) {
          return row.locatorNameTo;
        },
        //  "hidden":true,
        sortable: true,
      },

      {
        field: 'receiptTypeName',
        title: '采购类型',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageStatusToName',
        visible: false,
        title: '目标状态',
        minWidth: '130',
        // "edit":"ProductPopWin",
        formatter({ row }: any) {
          return row.storageStatusToName || row.storageStatusName;
        },
        // "verify":"required"
      },
      {
        field: 'storageStatusTo',
        slots: {
          edit: 'storageStatusToEdit',
        },
        editRender: {},
        title: '目标状态',
        minWidth: '120',
        formatter({ row }: any) {
          return row.storageStatusToName || row.storageStatusName;
        },
        //  "hidden":true,
        sortable: true,
      },

      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'description',
        minWidth: '150',
        title: '备注',
        slots: {
          edit: 'descriptionEdit',
        },
        editRender: {},
        // edit: 'text'
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
    ],
    // formSchema,
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            afterFetch: (res: any) => {
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        fieldName: 'warehouseId',
        label: '仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch: (res: any) => {
              chcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger: (values: Record<string, any>) => {
            nextTick(() => {
              const cond =
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                chcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: '请选择存货状态',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch: (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'storageStatus',
        label: '存货状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '请选择供应商',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch: (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'vendorId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: {
          placeholder: '请输入批号',
        },
      },
    ],
    queryUrl:
      'storageAction/queryStorageDetail.do?isScatter=Y&haveAvailableQty=Y',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: true,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
        showTargetLocatorId: 'Y'
      };
    },
    afterFetchFn: (params) => {
      const rows = params.rows?.map((item) => {
        return {
          ...item,
          locatorIdTo: item.locatorIdTo || item.targetLocatorId || item.locatorId,
          locatorNameTo: item.locatorNameTo || item.targetLocatorName || item.locatorName,
        };
      });
      return {
        ...params,
        records: rows || [],
      };
    },
    customModals: {
      'BatchSetModal-batchSetModalApi': {
        // 连接抽离的组件
        connectedComponent: BatchSetModalComp,
      },
      // 'ScatterCreateModal-scatterCreateModalApi': {
      //   connectedComponent: ScatterCreateComp,
      // },
    },
  },
);
const handleBatchSet = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.warning('请选择批量设置行！');
  }
  let warehouseId = '';
  let isSameWarehouse = true;
  records.forEach((data: any) => {
    if (!warehouseId) {
      warehouseId = data.warehouseId;
    } else if (warehouseId !== data.warehouseId) {
      isSameWarehouse = false;
    }
  });
  if (!isSameWarehouse) {
    return message.warning('请选择相同仓库的行！');
  }
  batchSetModalApi
    ?.setData({
      records,
      callback() {
        chcGridApi.query();
      },
    })
    .open();
};
const handleApply = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  const dates: any[] = [];
  let hasError = false;
  records.forEach((data: any) => {
    if (data.qtyAvailable < data.qty) {
      hasError = true;
      return message.error(
        `药品：${data.productName}，可移数量：${
          data.qtyAvailable
        },小于移动数量：${data.qty}`,
      );
    }
    if (!data.qty || data.qty < 0) {
      hasError = true;
      return message.error(`药品：${data.productName}，移动数量不能小于0`);
    }
    if (!data.locatorIdTo || data.locatorIdTo === '') {
      hasError = true;
      return message.error(`药品：${data.productName}，未设置目标货位!`);
    }

    if (data.qty && data.qty > 0) {
      dates.push(data);
    }
  });
  if (hasError) {
    return null;
  }
  const params: { [key: string]: any } = {};
  params.lines = JSON.stringify(dates);
  Modal.confirm({
    title: '提示',
    content: '确认移库？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient.post('movementAction/move.do', params).then(() => {
        message.success('移库提交成功！');
        chcGridApi.query();
      });
    },
    onCancel() {},
  });
};
onMounted(() => {
  console.warn('urlParams');
  // chcGridApi.query();
});
</script>
<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[transparent] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <BatchSetModal />
    <ChcGrid class="h-[calc(100%-40px)]">
      <template #locatorIdToEdit="scope">
        <ChcSelect
          v-model="scope.row.locatorIdTo"
          :paginate="true"
          :allow-clear="false"
          class="w-full"
          dict-url="/warehouseAction/locatorList.do"
          placeholder="请选择"
          @change="
            (val, option) => {
              scope.row.locatorNameTo = option.label;
            }
          "
          :extra-params="{
            isScatter: 'Y',
            warehouseId: scope.row.warehouseId,
            sort: 'id',
            dir: 'asc',
          }"
          :filter-by-front-end="false"
          :show-search="true"
          :immediate="true"
          label-field="name"
          value-field="id"
          filter-field="productName"
          query-model-value-field="locatorId"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :data-testid="`ChcSelect_locatorIdTo_${scope.rowIndex}`"
        />
      </template>
      <template #qtyEdit="scope">
        <InputNumber
          v-model:value="scope.row.qty"
          class="w-full"
          placeholder="请输入"
          :data-testid="`InputNumber_qty_${scope.rowIndex}`"
        />
      </template>
      <template #storageStatusToEdit="scope">
        <ChcSelect
          v-model="scope.row.storageStatusTo"
          class="w-full"
          dict-url="/baseHandleAction/refList.do?id=1000346&validation=ad_ref_list.value%20in(%27H%27,%27S%27,%27R%27,%27N%27)"
          placeholder="请选择"
          :paginate="false"
          @change="
            (val, option) => {
              scope.row.storageStatusToName = option.label;
            }
          "
          :show-search="true"
          :filter-by-front-end="false"
          :extra-params="{
            // isScatter: 'Y',
            // warehouseId: scope.row.warehouseId,
            // sort: 'id',
            // dir: 'asc',
          }"
          :immediate="true"
          label-field="name"
          value-field="id"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :option-columns="[
            {
              header: '状态编码',
              name: 'id',
              width: 80,
            },
            {
              header: '状态名称',
              name: 'name',
              width: 80,
            },
          ]"
          :data-testid="`ChcSelect_storageStatusTo_${scope.rowIndex}`"
        />
      </template>
      <template #descriptionEdit="scope">
        <Input
          v-model:value="scope.row.description"
          placeholder="请输入备注"
          :data-testid="`input_description_${scope.rowIndex}`"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleBatchSet"
          data-testid="button_BatchSet"
        >
          批量设置
          <template #icon>
            <SvgBatchJobIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button type="primary" @click="handleApply" data-testid="Button_移库">
            移库
            <template #icon>
              <SvgSquareTickIcon />
            </template>
          </Button>
        </div>
      </div>
    </template>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
