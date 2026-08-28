<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  SvgBatchJobIcon,
  SvgSquareTickIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button, InputNumber, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
// import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import BatchSetModalComp from './batchSetModal.vue';
import ImportModalComp from './importModal.vue';

const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const orderType = urlParams.orderType || '';
// const movementType = urlParams.movementType || '';
// const returnNegative = urlParams.returnNegative || '';
// const isExchange = urlParams.isExchange || '';
const isNarcotic = urlParams.isNarcotic || undefined;
const extParams = ref<any>({
  isNarcotic,
  specShowType: 'warehouse',
});
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
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

const [
  ChcGrid,
  chcGridApi,
  { BatchSetModal, batchSetModalApi, ImportModal, importModalApi },
] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      editConfig: {
        enabled: true,
        trigger: 'click',
        mode: 'row',
        autoClear: false,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
      cellStyle(scope: any) {
        if (
          scope.column.field === 'qtyPlaned' ||
          scope.column.field === 'toLocatorId'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        // if (
        //   scope.column.field === 'price' &&
        //   scope.row.price !== scope.row.priceList
        // ) {
        //   return {
        //     color: 'red',
        //   };
        // }
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {},
      // 全选/全不选事件
      checkboxAll: () => {},
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
        width: 50,
        type: 'seq',
        align: 'center',
        fixed: 'left',
        // formatter(scope: any) {
        //   return scope.rowIndex + 1;
        // },
      },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '150',
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
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'qtyPlaned',
        title: '指示数量',
        minWidth: '90',
        editRender: {},
        slots: {
          edit: 'qtyPlanedEdit',
        },
        // edit: 'number',
        sortable: false,
      },
      {
        field: 'qtyScatterAvailable',
        title: '库存数量',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'toLocatorId',
        title: '目标货位',
        minWidth: '120',
        formatter({ row }: any) {
          return row.toLocatorName;
        },
        editRender: {},
        slots: {
          edit: 'toLocatorIdEdit',
        },
        // hidden: true,
        sortable: true,
      },
      {
        field: 'toLocatorName',
        title: '目标货位',
        minWidth: '120',
        visible: false,
        // edit: 'ProductPopWin',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'storageStatusToName',
        title: '目标状态',
        minWidth: '130',
        formatter({ row }: any) {
          return row.storageStatusToName || row.storageStatusName;
        },
        // format(value, item) {
        //   return value || item.storageStatusName;
        // },
        // verify: 'required',
      },
      {
        field: 'storageStatusTo',
        title: '目标状态编码',
        minWidth: '110',
        visible: false,
        // format(value, item) {
        //   return value || item.storageStatus;
        // },
        // hidden: true,
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'price',
        title: '价格',
        minWidth: '90',
        sortable: true,
      },
    ],
    formSchema: [
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            showChooseAll: '',
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
      },
      {
        fieldName: 'warehouseId',
        label: '仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
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
          trigger(values: Record<string, any>) {
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
                chcGridApi?.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi?.formApi
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
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: {
          placeholder: '请输入批号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000574',
            placeholder: '请选择货位类型',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'locatorType',
        label: '货位类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: '请选择存货状态',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'storageStatus',
        label: '存货状态',
      },
    ],
    dataTableId:
      'storageAction/queryStorageLot.do?isScatter=Y&showPrice=Y&showVendor=N',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'BatchSetModal-batchSetModalApi': {
        // 连接抽离的组件
        connectedComponent: BatchSetModalComp,
      },
      'ImportModal-importModalApi': {
        connectedComponent: ImportModalComp,
      },
    },
  },
);
const handleBatchSet = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择批量设置行！');
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
const handleSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  // 获取表格选中的数据
  const warehouseId = formValues.warehouseId;
  if (!warehouseId) {
    return message.error('请选择仓库！');
  }
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  let flag = true;
  let msg = '';
  const data: any[] = [];
  records.forEach((record: any, index: number) => {
    if (!record.toLocatorId) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `没有目标货位`;
      flag = false;
      return;
    }
    if (!record.qtyPlaned || record.qtyPlaned < 1) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `没有指示数量`;
      flag = false;
      return;
    }
    if (record.toLocatorId === record.locatorId) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `原货位与目标货位一样`;
      flag = false;
      return;
    }
    data.push(record);
  });
  if (!flag) {
    return message.error(msg);
  }
  if (data.length === 0) {
    return message.error('请录入指示数量！');
  }
  const params: { [key: string]: any } = {};
  params.created = JSON.stringify(data);
  params.warehouseId = warehouseId;
  requestFormClient.post('movementPlanAction/batchSave.do', params).then(() => {
    message.success('指示成功！');
    handleFormSubmit();
  });
};
const handleImport = () => {
  importModalApi?.open();
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
    <ImportModal />
    <BatchSetModal />
    <!-- class="h-[calc(100%-40px)]" -->
    <ChcGrid class="h-full">
      <template #qtyPlanedEdit="scope">
        <InputNumber
          v-model:value="scope.row.qtyPlaned"
          class="w-full"
          :data-testid="`InputNumber_qtyPlaned_${scope.rowIndex}`"
        />
      </template>
      <template #toLocatorIdEdit="scope">
        <ChcSelect
          v-model="scope.row.toLocatorId"
          :data-testid="`ChcSelect_toLocatorId_${scope.rowIndex}`"
          class="w-full"
          dict-url="/warehouseAction/locatorList.do"
          placeholder="请选择"
          :paginate="false"
          @change="
            (_: any, option: any) => {
              scope.row.toLocatorName = option.label;
              scope.row.storageStatusTo = option.locatorUseType;
              scope.row.storageStatusToName = option.locatorUseTypeName;
            }
          "
          filter-field="value"
          :show-search="true"
          :extra-params="{
            isScatter: 'Y',
            warehouseId: scope.row.warehouseId,
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
              header: '货位ID',
              name: 'id',
              width: 110,
            },
            {
              header: '货位名称',
              name: 'name',
              width: 120,
            },
          ]"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleSubmit"
          data-testid="button_submit"
        >
          指示
          <template #icon>
            <SvgSquareTickIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleBatchSet"
          data-testid="button_batchSet"
        >
          批量设置
          <template #icon>
            <SvgBatchJobIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleImport"
          data-testid="button_import"
        >
          导入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
    <!-- <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button type="primary" @click="handleSubmit">
            指示
            <template #icon>
              <SvgSquareTickIcon />
            </template>
          </Button>
        </div>
      </div>
    </template> -->
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
