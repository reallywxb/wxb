<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { handlePriceToFixedTwo } from '#/utils/util';

import PackageDetailModalComp from './packageDetailModal.vue';

const route = useRoute();
const globalPrintStore = useGlobalPrintStore();
// var isProductControlLevel = chcAppConfig.isProductControlLevel;
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const hiddenField = urlParams.hiddenField || '';
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
  pickListId: undefined,
  productName: undefined,
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};

// 子表
const [ChildGrid, childGridApi, { PackageDetailModal, packageDetailModalApi }] =
  useSpdGrid(
    {
      formOptions: {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
      },
      gridOptions: {
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: true,
        },
      },
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
          field: 'pickListJobId',
          visible: false,
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
          minWidth: '75',
          sortable: true,
        },
        {
          field: 'qtyTarget',
          title: '指示数量',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qtyPicked',
          title: '拣货数量',
          minWidth: '90',
          align: 'right',
          slots: {
            default: 'qtyPickedDefault',
          },
          // hover: true,
          sortable: false,
        },
        {
          field: 'qtyCancelled',
          title: '取消数量',
          minWidth: '90',
          align: 'right',
          sortable: false,
        },
        {
          field: 'fromLocatorName',
          title: '货位',
          minWidth: '100',
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
          field: 'currentPricePo',
          title: '采购价',
          minWidth: 100,
          sortable: true,
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.currentPricePo);
          },
        },
        {
          field: 'pickedLot',
          title: '已拣批号',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'lineStatusName',
          title: '状态',
          minWidth: 80,
          sortable: true,
        },
        {
          field: 'cancelReasonName',
          title: '取消原因',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'description',
          title: '备注',
          minWidth: '150',
          sortable: true,
        },
      ],
      id: 'child',
      queryUrl: 'pickListAction/queryPickListJob.do?page=query',
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
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      handleSubmit: handleFormSubmit,
      handleReset: async () => {
        await chcGridApi.formApi.resetForm();
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(formValues);
        chcGridApi.query(formValues);
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
      sortConfig: {
        defaultSort: {
          // field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: `pickListAction/query.do?page=query&orderType=WO,WR,MO,SO&productControlLevel=${urlParams.productControlLevel || ''}`,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'pickListNo',
        title: '拣货单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'priorityTypeName',
        title: '来源类别',
        minWidth: '100',
        visible: !hiddenField.includes('priorityTypeName'),
        sortable: true,
      },
      {
        field: 'pickDate',
        title: '指示时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '发货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '收货单位',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        minWidth: '100',
        visible: !hiddenField.includes('orderTypeName'),
        sortable: true,
      },
      {
        field: 'statusName',
        title: '拣货状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        //  hidden : !isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '指示时间',
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
                // .subtract(2, 'year')
                .subtract(1, 'week')
                // .subtract(1, 'day')
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
            placeholder: '请选择发货仓库',
            paginate: false,
            showChooseAll: '',
            triggerFields: ['departmentId', 'regionId'],
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
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
        fieldName: 'warehouseId',
        label: '发货仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4',
            placeholder: '请选择申请单位',
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
        fieldName: 'bpartnerId',
        label: '收货单位',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000453',
            placeholder: '请选择拣货状态',
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
        fieldName: 'pickStatus',
        label: '拣货状态',
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
        fieldName: 'pickListNo',
        label: '拣货单号',
        defaultValue: isFromTraceSearchPage.value
          ? route?.query?.pickListNo
          : null,
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.pickListId) {
          parentTableParams.value.pickListId = row.pickListId;
          childGridApi.reload({ pickListId: row.pickListId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.pickListId = 0;
          // childGridApi.query({ pickListId: row.pickListId });
        }
      },
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleSearch = () => {
  childGridApi.reload({
    pickListId: parentTableParams.value.pickListId,
    productName: parentTableParams.value.productName,
  });
};
const handleQtyPickedClick = (scope: any) => {
  packageDetailModalApi!
    .setData({
      ...scope.row,
      type: 'view',
      title: '拣货包装',
    })
    .open();
};
const handlePrint = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    message.error('请选择一条记录');
  }
  const pickListId = record.pickListId;
  Modal.confirm({
    title: '提示',
    content: '确认打印拣货单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      // 执行打印操作
      // App.print(
      //   `${App.getContextPath()}pickListAction/printPickListDoc.do?id=${JSON.stringify(
      //     pickListId,
      //   )}`,
      // );
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/pickListAction/printPickListDoc.do?id=${pickListId}`,
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
                @click="handlePrint"
                data-testid="button_print"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <PackageDetailModal />
          <ChildGrid>
            <template #qtyPickedDefault="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyPickedClick(scope)"
                :data-testid="`button_qtyPicked_${scope.rowIndex}`"
              >
                {{ scope.row.qtyPicked }}
              </a>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
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
          </ChildGrid>
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
