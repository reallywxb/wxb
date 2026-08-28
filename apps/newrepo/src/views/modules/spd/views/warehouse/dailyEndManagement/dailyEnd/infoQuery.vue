<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
// import { useRoute } from 'vue-router';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import LazySearch from '#/utils/LazySearch';

import inoutDetailModalUI from './modals/inoutDetailModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const [inoutDetailModal, inoutDetailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: inoutDetailModalUI,
  draggable: true,
});
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');

const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi?.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const extParams = ref<any>({
  summaryCols:
    'beginPOAmt,beginPriceListAmt,inStockPOAmt,inStockPriceListAmt,outStockPOAmt,outStockPriceListAmt,adjPOAmt,adjPriceListAmt,pricePODiffAmt,endPOAmt,endPriceListAmt',
});
const summaryRow = ref<any>([]);
// 父表
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      showFooter: true,
      showOverflow: true,
      // footerData: summaryRow.value,
      footerMethod: () => {
        return summaryRow.value;
      },
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        // enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/dailyEndAction/queryDailyEnd.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', field: 'seq', width: 50, align: 'center' },
      {
        field: 'storageDate',
        title: '结转日期',
        width: '100',
        sortable: true,
      },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },

      { field: 'productSpec', title: '规格', width: '90', sortable: true },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },

      { field: 'uomName', title: '单位', width: '60', sortable: true },
      {
        field: 'beginQty',
        title: '期初数量',
        align: 'right',
        width: '90',
        sortable: true,
      },
      {
        field: 'beginPOAmt',
        title: '期初进价金额',
        align: 'right',
        width: '120',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.beginPOAmt);
        },
      },
      {
        field: 'beginPriceListAmt',
        title: '期初零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.beginPriceListAmt);
        },
      },
      {
        field: 'inStockQty',
        title: '总入库数量',
        align: 'right',
        width: '100',
        slots: { default: 'inStockQty' },
        sortable: true,
      },
      {
        field: 'POQty',
        title: '采购入库数量',
        align: 'right',
        width: '130',
        slots: { default: 'POQty' },
        sortable: true,
      },
      {
        field: 'MIQty',
        title: '调拨入库数量',
        align: 'right',
        slots: { default: 'MIQty' },
        width: '130',
        sortable: true,
      },
      {
        field: 'SRQty',
        title: '科退入库数量',
        slots: { default: 'SRQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'PSRQty',
        title: '销退入库数量',
        slots: { default: 'PSRQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'IIQty',
        title: '报溢入库数量',
        slots: { default: 'IIQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'inStockPOAmt',
        title: '入库进价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.inStockPOAmt);
        },
      },
      {
        field: 'inStockPriceListAmt',
        title: '入库零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.inStockPriceListAmt);
        },
      },
      {
        field: 'outStockQty',
        title: '总出库数量',
        align: 'right',
        width: '130',
        slots: { default: 'outStockQty' },
        sortable: true,
      },
      {
        field: 'PRQty',
        title: '采退出库数量',
        align: 'right',
        slots: { default: 'PRQty' },
        width: '130',
        sortable: true,
      },
      {
        field: 'MOQty',
        title: '调拨出库数量',
        align: 'right',
        slots: { default: 'MOQty' },
        width: '130',
        sortable: true,
      },
      {
        field: 'SOQty',
        title: '科领出库数量',
        slots: { default: 'SOQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'PSOQty',
        title: '销售出库数量',
        slots: { default: 'PSOQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'IOQty',
        title: '报损出库数量',
        slots: { default: 'IOQty' },
        align: 'right',
        width: '130',
        sortable: true,
      },
      {
        field: 'outStockPOAmt',
        title: '出库进价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.outStockPOAmt);
        },
      },
      {
        field: 'outStockPriceListAmt',
        title: '出库零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.outStockPriceListAmt);
        },
      },
      {
        field: 'adjPOAmt',
        title: '进价调整金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.adjPOAmt);
        },
      },
      {
        field: 'adjPriceListAmt',
        title: '零售价调整金额',
        align: 'right',
        width: '140',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.adjPriceListAmt);
        },
      },
      {
        field: 'pricePODiffAmt',
        title: '出库价差金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePODiffAmt);
        },
      },
      {
        field: 'endQty',
        title: '期末数量',
        align: 'right',
        width: '110',
        sortable: true,
      },
      {
        field: 'endPOAmt',
        title: '期末进价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.endPOAmt);
        },
      },
      {
        field: 'endPriceListAmt',
        title: '期末零售价金额',
        align: 'right',
        width: '130',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.endPriceListAmt);
        },
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '200',
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
        width: 120,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
          dayjs(dayjs().format('YYYY-MM-DD'))
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
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
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
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
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
          trigger(values: any) {
            nextTick(() => {
              const ref = ChcGridApi.formApi?.getFieldComponentRef(
                'warehouseId',
              ) as any;
              if (ref?.params) {
                ref.params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                ref?.fetchApi();
              }
            });
          },
        },
        fieldName: 'warehouseId',
        label: '仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入编码/拼音码/名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000380',
            placeholder: '请选择商品分类',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'productType',
        label: '商品分类',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            options: [{ value: 'Y', label: '大于0' }],
            placeholder: '请选择结转数量',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'allHasQty',
        label: '结转数量',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        selectRow.value = row && row.storageStatus ? row : {};
      },
    },
    afterFetchFn: (params) => {
      const rows = params.rows || [];
      rows.forEach((item: any, index: number) => {
        item.seq = index + 1;
      });
      if (params.summaryRow) {
        // rows.push({ ...params.summaryRow, seq: '合计'  });
        summaryRow.value = [{ ...params.summaryRow, seq: '合计' }];
      }
      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
      };
    },
    defaultRequestOptions: {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    },
  },
);

const handleView = (row: any) => {
  parentData.value = row;
  currentTab.value = headerTabs.value.length - 1;

  detailInfo.value = {
    detailTitle: '批号日结表',
    sourcePage: props.thisTab.value,
    type: 'view',
  };
};

const filedName = ref('');
const orderData = ref<any>({});
const handleViewDetail = (row: any, fieldName: string) => {
  orderData.value = row;
  filedName.value = fieldName;
  inoutDetailModalApi.open();
};

const selectRow = ref<any>({});
</script>

<template>
  <div class="h-full">
    <inoutDetailModal :order-data="orderData" :filed-name="filedName" />
    <ChcGrid class="flex-1 overflow-hidden">
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_infoQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #inStockQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'inStockQty')"
          :data-testid="`button_inStockQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.inStockQty }}
        </a>
      </template>
      <template #POQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'POQty')"
          :data-testid="`button_POQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.POQty }}
        </a>
      </template>
      <template #MIQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'MIQty')"
          :data-testid="`button_MIQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.MIQty }}
        </a>
      </template>
      <template #SRQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'SRQty')"
          :data-testid="`button_SRQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.SRQty }}
        </a>
      </template>
      <template #PSRQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'PSRQty')"
          :data-testid="`button_PSRQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.PSRQty }}
        </a>
      </template>
      <template #IIQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'IIQty')"
          :data-testid="`button_IIQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.IIQty }}
        </a>
      </template>
      <template #outStockQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'outStockQty')"
          :data-testid="`button_outStockQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.outStockQty }}
        </a>
      </template>
      <template #PRQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'PRQty')"
          :data-testid="`button_PRQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.PRQty }}
        </a>
      </template>
      <template #MOQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'MOQty')"
          :data-testid="`button_MOQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.MOQty }}
        </a>
      </template>
      <template #SOQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'SOQty')"
          :data-testid="`button_SOQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.SOQty }}
        </a>
      </template>
      <template #PSOQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'PSOQty')"
          :data-testid="`button_PSOQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.PSOQty }}
        </a>
      </template>
      <template #IOQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleViewDetail(scope.row, 'IOQty')"
          :data-testid="`button_IOQty_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.IOQty }}
        </a>
      </template>

      <template #action="scope">
        <Button
          type="primary"
          style="background-color: #b17a33d4"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleView(scope.row)"
          :data-testid="`button_view_${scope.rowIndex}_infoQuery`"
        >
          批号明细
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

/* ::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
} */
</style>
