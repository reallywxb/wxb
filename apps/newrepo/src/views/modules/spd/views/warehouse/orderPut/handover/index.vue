<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import actionLogModal from './modals/actionLogModal.vue';
import FormModal from './modals/FormModal.vue';

const userStore = useUserStore();
const route = useRoute();
const urlParams = route.meta?.urlParams || {};
const isFirstLoaded = ref(false);
// 当前选中院区id
const currentDeptId = ref<any>(undefined);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

const parentTableParams = ref<{ [key: string]: any }>({
  asnId: undefined,
  productName: undefined,
});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
      {
        field: 'index',
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 90,
        sortable: true,
      },
      { field: 'manufacturer', title: '厂家', sortable: true, minWidth: 120 },
      { field: 'uomName', title: '单位', sortable: true, minWidth: 60 },
      {
        field: 'qtyArrived',
        title: '配送数量',
        sortable: true,
        minWidth: 90,
        align: 'right',
        slots: { default: 'qtyArrived' },
      },
      {
        field: 'packageCountArrived',
        title: '配送包数',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceActual',
        title: '采购价',
        minWidth: 70,
        sortable: true,
        align: 'right',
      },
      {
        field: 'lineAmt',
        title: '行金额',
        minWidth: 70,
        sortable: true,
        align: 'right',
      },
      { field: 'lot', title: '批号', sortable: true, minWidth: 120 },
      { field: 'guaranteeDate', title: '效期', sortable: true, minWidth: 120 },
      { field: 'locatorName', title: '货位', sortable: true, minWidth: 120 },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/asnAction/queryDetail.do?specShowType=from',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.asnId) {
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
        ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    // queryUrl:
    //   '/asnAction/query.do?page=transship&isSurgery=N&asnType=WO,MO,WR,SR&asnRegType=IN',
    queryUrl: `/asnAction/query.do?page=transship&isSurgery=N&asnType=${urlParams?.asnType || ''}&asnRegType=${urlParams?.asnRegType || 'IN'}`,
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { field: 'orderNo', title: '申请单号', minWidth: 110, sortable: true },
      { field: 'asnNo', title: '配送单号', minWidth: 110, sortable: true },
      { field: 'created', title: '配送时间', minWidth: 150, sortable: true },
      {
        field: 'fromWarehouseName',
        title: '发货仓库',
        minWidth: 100,
        sortable: true,
      },
      { field: 'departmentName', title: '院区', minWidth: 100, sortable: true },
      {
        field: 'warehouseName',
        title: '收货仓库',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'asnStatusName',
        title: '收货状态',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '药品组',
        visible: userStore.userInfo.isProductControlLevel,
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        minWidth: 80,
        align: 'right',
        sortable: true,
      },
      {
        field: 'workOutName',
        title: '出库工人',
        minWidth: 100,
        visible: urlParams?.asnRegType !== 'OUT',
        sortable: true,
      },
      {
        field: 'workOutTime',
        title: '出库时间',
        minWidth: 150,
        visible: urlParams?.asnRegType !== 'OUT',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '操作人',
        minWidth: 110,
        sortable: true,
      },
      { field: 'description', title: '备注', minWidth: 150, sortable: true },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '配送时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
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
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // 只有当前院区有值时，才自动选中第一个仓库
              // 重置时 currentDeptId 会被清空，此处不会执行，从而避免误选
              if (currentDeptId.value && res?.rows?.[0]?.id) {
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  res.rows[0].id,
                );
              }

              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            // 记录当前的院区 ID，用于 afterFetch 判断是否应该自动选中第一个
            currentDeptId.value = values?.departmentId;
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '收货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y',
            placeholder: '请选择发货仓库',
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
        // defaultValue: '',
        fieldName: 'fromWarehouseId',
        label: '发货仓库',
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        label: '配送单号',
        componentProps: {
          // allowClear: true,
          placeholder: '请输入配送单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.asnId) {
          parentTableParams.value.asnId = row.asnId;
          roleGridApi.reload({ asnId: row.asnId });
          await roleGridApi.grid.clearCheckboxRow();
          roleGridApi.grid.setCheckboxRow(row, true);
          await ChcGridApi.grid.clearCheckboxRow();
          ChcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.asnId = 0;
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleSearch = () => {
  roleGridApi.reload({
    asnId: parentTableParams.value.asnId,
    productName: parentTableParams.value.productName,
  });
};
const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});

const handleChange = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择入库单！');
    return;
  }
  const asnId = selectedRows.map((row: any) => row.asnId);
  modalApi
    .setData({
      dataTableId: '/orderAction/close.do',
      formData: {
        asnId: JSON.stringify(asnId),
      },
      openType: 'close',
    })
    .open();
};
async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}

const handleQtyArrivedClick = (scope: any) => {
  console.warn('点击qtyArrived:', scope.row, scope.row.qtyArrived);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
    })
    .open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <OrgFormModal :after-submit="refreshTable" />
      <ActionLogModal />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleChange"
                data-testid="button_change"
              >
                扫码交接
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #qtyArrived="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyArrivedClick(scope)"
                :data-testid="`button_qtyArrived_${scope.rowIndex}`"
              >
                {{ scope.row.qtyArrived }}
              </a>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                style="margin-top: 10px"
                placeholder="请输入药品名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                style="margin-top: 10px"
                @click="handleSearch"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
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
