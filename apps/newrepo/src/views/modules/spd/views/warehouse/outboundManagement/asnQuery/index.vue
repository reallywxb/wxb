<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import PackageDetailModalComp from './packageDetailModal.vue';

const route = useRoute();
const globalPrintStore = useGlobalPrintStore();
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
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
const parentTableParams = ref<{ [key: string]: any }>({
  asnId: undefined,
  productName: undefined,
});
// 子表
const [RoleGrid, roleGridApi, { PackageDetailModal, packageDetailModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
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
          title: '序号',
          type: 'seq',
          minWidth: 50,
          align: 'center',
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
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '70',
          sortable: true,
        },
        {
          field: 'qtyArrived',
          title: '配送数量',
          minWidth: '90',
          align: 'right',
          slots: {
            default: 'qtyArrivedDefault',
          },
          // hover: true,
          sortable: true,
        },
        {
          field: 'qtyCheckLeft',
          title: '待验收数量',
          minWidth: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtyChecked',
          title: '已验收数量',
          minWidth: '110',
          align: 'right',
          slots: {
            default: 'qtyCheckedDefault',
          },
          // hover: true,
          sortable: true,
        },
        {
          field: 'qtyPutawayLeft',
          title: '待上架数量',
          minWidth: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtyPutawayed',
          title: '已上架数量',
          minWidth: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtyReceived',
          title: '入库数量',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qtyRejected',
          title: '拒收数量',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtyReturned',
          title: '拒收回库数量',
          minWidth: '120',
          sortable: true,
          align: 'right',
        },
        // {
        //   field: 'replenishPackageQty',
        //   title: '定数',
        //   minWidth: '80',
        //   sortable: true,
        //   align: 'right',
        // },
        {
          field: 'packageCountArrived',
          title: '配送包数',
          minWidth: '90',
          align: 'right',
        },
        {
          field: 'packageCountCheckLeft',
          title: '待验收包数',
          minWidth: '120',
          align: 'right',
        },
        {
          field: 'packageCountChecked',
          title: '已验收包数',
          minWidth: '120',
          align: 'right',
        },
        {
          field: 'packageCountPutawayLeft',
          title: '待上架包数',
          minWidth: '120',
          align: 'right',
        },
        {
          field: 'packageCountPutawayed',
          title: '已上架包数',
          minWidth: '120',
          align: 'right',
        },
        {
          field: 'packageCountRejected',
          title: '拒收包数',
          minWidth: '90',
          align: 'right',
        },
        {
          field: 'qtyOnHandLeft',
          title: '剩余库存数量',
          minWidth: 120,
          sortable: true,
          align: 'right',
        },
        {
          field: 'supportDays',
          title: '维持天数',
          minWidth: 100,
          sortable: true,
          align: 'right',
        },
        {
          field: 'priceActual',
          title: '采购价',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'lineAmt',
          title: '行金额',
          minWidth: '90',
          sortable: true,
          align: 'right',
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
          field: 'locatorName',
          title: '货位',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'checkerName',
          title: '验收人',
          minWidth: '100',
          sortable: false,
        },
        {
          field: 'checkTime',
          title: '验收时间',
          minWidth: '120',
          sortable: false,
        },
        {
          field: 'putawayName',
          title: '上架人',
          minWidth: '100',
          sortable: false,
        },
        {
          field: 'putawayTime',
          title: '上架时间',
          minWidth: '120',
          sortable: false,
        },
      ],
      id: 'child',
      queryUrl: 'asnAction/queryDetail.do?specShowType=from',
      beforeFetchFn: (params) => {
        return { ...params, ...parentTableParams.value };
      },
      afterFetchFn: (params) => {
        return {
          ...params,
          records: params.rows,
        };
      },
      customModals: {
        'PackageDetailModal-packageDetailModalApi': {
          // 连接抽离的组件
          connectedComponent: PackageDetailModalComp,
        },
      },
    },
  );
// 父表
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: `asnAction/query.do?isSurgery=N&asnType=${urlParams.asnType || ''}`,
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'asnNo',
        title: '配送单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'created',
        title: '配送时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'fromWarehouseName',
        title: '发货仓库',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '收货仓库',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'asnStatusName',
        title: '收货状态',
        minWidth: '100',
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        // hidden: !isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        minWidth: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'createdByName',
        title: '操作人',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'workOutName',
        title: '出库工人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'workOutTime',
        title: '出库时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'workInName',
        title: '入库工人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'workInTime',
        title: '入库时间',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateArrived',
        label: '配送时间',
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
                // .subtract(2, 'year')
                .subtract(2, 'week')
                .subtract(1, 'day')
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
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '-1' : res?.rows?.[0]?.id,
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
            placeholder: '请选择发货仓库',
            paginate: false,
            showChooseAll: '',
            triggerFields: ['departmentId', 'regionId'],
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'fromWarehouseId',
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
          trigger(values: any) {
            nextTick(() => {
              const cond =
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi.formApi?.getFieldComponentRef('fromWarehouseId') &&
                chcGridApi.formApi?.getFieldComponentRef('fromWarehouseId')
                  .params;
              if (cond) {
                chcGridApi.formApi.getFieldComponentRef(
                  'fromWarehouseId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                chcGridApi.formApi
                  ?.getFieldComponentRef('fromWarehouseId')
                  ?.fetchApi();
                chcGridApi.formApi?.setFieldValue('fromWarehouseId', undefined);
              }
            });
          },
        },
        fieldName: 'fromWarehouseId',
        label: '发货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y',
            placeholder: '请选择收货仓库',

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
        fieldName: 'warehouseId',
        label: '收货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do?readWrite=N',
            placeholder: '请选择供应商',
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
        fieldName: 'poVendorId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        label: '配送单号',
        defaultValue: isFromTraceSearchPage.value ? route.query?.asnNo : null,
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000565',
            placeholder: '请选择收货状态',
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
        fieldName: 'asnStatus',
        label: '收货状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            paginate: false,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
          };
        },
        defaultValue: '',
        fieldName: 'isPrinted',
        label: '已打印',
      },
    ],
    showCustomBtn: true,
    showZoomBtn: true,
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.asnId) {
          parentTableParams.value.asnId = row.asnId;
          roleGridApi.reload({ asnId: row.asnId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.asnId = 0;
          // roleGridApi.query({ asnId: row.asnId });
        }
      },
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
      };
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
const handleQtyClick = (scope: any, type: string) => {
  packageDetailModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
      checkStatus: type === 'qtyArrived' ? '' : 'Y',
      title: type === 'qtyArrived' ? '配送包装' : '已验收包装',
    })
    .open();
};
const handlePrintAsnBtn = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    paramLine.push(data.asnId);
  });
  // 提示打印
  Modal.confirm({
    title: '打印提示',
    content: '确认打印配送单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      // 执行打印操作
      //          App.print(
      //   `${App.getContextPath()}asnAction/printAsnDoc.do?id=${paramLine}`,
      // );
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/printAsnDoc.do?id=${paramLine}`,
      });
    },
    onCancel() {},
  });
};

const handlePrintLackBtn = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  // console.warn('records', records);
  const orderId = records[0].orderId;
  if (!orderId) {
    return message.error('配送单未关联订单！');
  }
  // 提示打印
  Modal.confirm({
    title: '打印提示',
    content: '打印欠品单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      // 执行打印操作
      //  App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDoc.do?orderId=${orderId}`,
      });
    },
    onCancel() {},
  });
};
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
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrintAsnBtn"
                data-testid="button_print_asn"
              >
                打印配送单
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrintLackBtn"
                data-testid="button_print_lack"
              >
                打印欠品单
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <PackageDetailModal />
          <RoleGrid>
            <template #qtyArrivedDefault="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyClick(scope, 'qtyArrived')"
                :data-testid="`button_qtyArrived_${scope.rowIndex}`"
              >
                {{ scope.row.qtyArrived }}
              </a>
            </template>
            <template #qtyCheckedDefault="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyClick(scope, 'qtyChecked')"
                :data-testid="`button_qtyChecked_${scope.rowIndex}`"
              >
                {{ scope.row.qtyChecked }}
              </a>
            </template>
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model="scope.row.qtyProcess"
                :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}`"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="Input_productName"
              />
              <Button
                type="primary"
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
