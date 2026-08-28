<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import careResultFormUI from './modal/careResultForm.vue';

const route = useRoute();
console.warn(route, '@@@');
const globalPrintStore = useGlobalPrintStore();
const parentTableParams = ref<{ [key: string]: any }>({
  productCareId: undefined,
  productName: undefined,
  processed: 'N',
});
const selectRow = ref<any>({});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },
      { field: 'productSpec', title: '规格', width: '90', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '70', sortable: true },
      {
        field: 'storageQty',
        title: '库存数量',
        width: '90',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.storageQty);
        },
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: '180',
        sortable: true,
      },
    ],
    id: 'child',
    tableSearchExtraParams: {},
    queryUrl: 'productCareAction/queryProductCareDetail.do?page=input',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.productCareId) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['careDateFrom', 'careDateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: 'productCareAction/queryProductCare.do?page=resultInput',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'productCareNo',
        minWidth: 120,
        sortable: true,
        title: '养护单号',
      },
      {
        field: 'careDate',
        minWidth: 160,
        sortable: true,
        title: '养护时间',
      },
      {
        field: 'warehouseName',
        title: '养护仓库',
        width: '200',
        sortable: true,
      },
      {
        field: 'createdByName',
        minWidth: 100,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 160,
        sortable: true,
        title: '创建时间',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '养护时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'week')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
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
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            triggerFields: ['departmentId', 'regionId'],
            allowClear: true,
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
        fieldName: 'warehouseId',
        label: '仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            const c = isFieldComponentRefExist('warehouseId');
            if (c) {
              const refInst =
                ChcGridApi.formApi.getFieldComponentRef('warehouseId');
              if (refInst && refInst.params) {
                refInst.params.dependencies = {
                  regionId: values.departmentId,
                  departmentId: values.departmentId,
                };
                refInst?.fetchApi();
                ChcGridApi.formApi.setFieldValue('warehouseId', undefined);
              }
            }
          },
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.productCareId) {
          parentTableParams.value.productCareId = row.productCareId;
          selectRow.value = row;
          // roleGridApi.query({ productCareId: row.productCareId });
          handleSearch();
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.productCareId = undefined;
          roleGridApi.grid.remove(roleGridApi.grid.getFullData());
          selectRow.value = {};
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [CareResultFormModal, careResultFormModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: careResultFormUI,
  draggable: true,
});
const handleBatch = () => {
  const selectedRow = ChcGridApi.grid.getRadioRecord(true);
  if (!selectedRow) {
    message.error('请选择养护单');
    return;
  }
  careResultFormModalApi
    .setData({
      title: '整单登记',
      isBatch: true,
      productCareId: selectedRow.productCareId,
      callback: () => {
        handleParentSearch();
      },
    })
    .open();
};

// 打印
const handlePrint = () => {
  const selectedRow = ChcGridApi.grid.getRadioRecord(true);
  if (!selectedRow) {
    message.error('请选择一条记录');
    return;
  }
  const productCareId = selectedRow.productCareId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印订单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/ureport/pdf/show?_u=file:productCare.ureport.xml&productCareId=${productCareId}`,
      });
    },
    onCancel() {},
  });
};
// 子表查询
const handleSearch = () => {
  return roleGridApi.reload({
    productCareId: parentTableParams.value.productCareId,
    productName: parentTableParams.value.productName,
    processed: parentTableParams.value.processed,
  });
  // getChildMockData().then((res) => {
  //   roleGridApi.grid.reloadData(res);
  // });
};

// 养护登记
const handleProcess = () => {
  const records = roleGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择养护品种');
    return;
  }
  careResultFormModalApi
    .setData({
      title: '养护登记',
      isBatch: false,
      productCareId: parentTableParams.value.productCareId,
      childDg: records,
      callback: async () => {
        await handleSearch(); // 异步处理
        const tableData = roleGridApi.grid.getTableData().tableData || [];
        if (!tableData || tableData.length === 0) {
          handleParentSearch();
        }
      },
    })
    .open();
};

// const getParentMockData = () => {
//   const mockData = Array.from({ length: 20 }, (_, index) => ({
//     id: index + 1,
//     productCareId: Math.random().toString(10).slice(2, 8), // 随机六位数
//     careDate: `${new Date().toISOString().slice(0, 10)}`, // 随机日期
//     warehouseName: `养护仓库{index + 1}`,
//     createdByName: `创建人${index + 1}`,
//     created: `${new Date().toISOString().slice(0, 10)}`, // 随机日期
//   }));
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(mockData);
//     }, 1000);
//   });
// };

// const getChildMockData = () => {
//   const mockData = Array.from({ length: 10 }, (_, index) => ({
//     id: index + 1,
//     productCode: Math.random().toString(10).slice(2, 8), // 随机六位数
//     productName: `养护品种${index + 1}`,
//     productSpec: `规格${index + 1}`,
//     modelNo: `模型号${index + 1}`,
//     manufacturer: `生产商${index + 1}`,
//     uomName: `单位${index + 1}`,
//     storageQty: Math.random() * 1000, // 随机库存数量
//     lotNo: `批号${index + 1}`,
//     guaranteeDate: `${new Date().toISOString().slice(0, 10)}`, // 随机日期
//     vendorName: `供应商${index + 1}`,
//     locatorName: `定位器${index + 1}`,
//   }));
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(mockData);
//     }, 1500);
//   });
// };

const handleParentSearch = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

onMounted(async () => {
  handleParentSearch();
  // ChcGridApi.grid.reloadData(await getParentMockData());
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <CareResultFormModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleBatch"
                data-testid="button_handle_batch"
              >
                整单登记
              </Button>
              <Button
                type="primary"
                @click="handlePrint"
                data-testid="button_print"
              >
                打印
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <label for="">药品:</label>
              <Input
                v-model:value="parentTableParams.productName"
                class="ml-[0.5rem] mr-[0.5rem] w-[240px]"
                placeholder="请输入"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_product_name"
              />
              <label for="">已登记:</label>
              <!-- default-value="N" -->
              <ChcSelect
                v-model="parentTableParams.processed"
                placeholder="请选择"
                class="ml-[0.5rem] mr-[0.5rem] w-[240px]"
                :paginate="false"
                :immediate="false"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                label-field="label"
                value-field="value"
                :options="[
                  { label: '全部', value: '' },
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                data-testid="select_processed"
              />
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleSearch"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleProcess"
                data-testid="button_care_process"
              >
                养护登记
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
  </Page>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
