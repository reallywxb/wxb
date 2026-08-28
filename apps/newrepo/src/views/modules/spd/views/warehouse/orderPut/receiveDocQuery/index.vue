<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import Summarize from '#/components/spd/summarize/index.vue';
import previewImage from '#/views/modules/spd/views/common/previewImages/index.vue';

import { commonFormOptions, viewFormOptions } from './options';

const userStore = useUserStore();

const route = useRoute();
const urlParams = route.meta?.urlParams || {};
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});
const isFirstLoaded = ref(false);
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
const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
}>({
  commitStatus: "'CO'",
  approvalStatus: "'WA'",
  isGift: 'N',
});
const selectedAmount = ref(0);
const totalAmt = ref(0);
const totalQty = ref(0);
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orgName',
        minWidth: 120,
        sortable: true,
        title: '机构',
        visible: userStore.userInfo.isSaas,
      },
      {
        field: 'movementDate',
        minWidth: 120,
        sortable: true,
        title: '入库时间',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 120,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 90,
        sortable: true,
        title: '规格',
      },
      {
        field: 'manufacturer',
        minWidth: 110,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'insurance',
        minWidth: 90,
        sortable: true,
        title: '医保编码',
      },
      {
        field: 'standardCode',
        minWidth: 90,
        sortable: true,
        title: '贯标编码',
        visible: false, // TODO:medicine cancel 贯标码
      },
      {
        field: 'uomName',
        minWidth: 60,
        sortable: true,
        title: '单位',
      },
      {
        field: 'movementQty',
        minWidth: 90,
        sortable: true,
        title: '入库数量',
        align: 'right',
      },
      {
        field: 'price',
        minWidth: 75,
        sortable: true,
        title: '采购价',
        align: 'right',
      },
      {
        field: 'lineAmt',
        minWidth: 90,
        sortable: true,
        title: '采购金额',
        align: 'right',
      },
      {
        field: 'priceList',
        minWidth: 75,
        sortable: true,
        title: '零售价',
        align: 'right',
      },
      {
        field: 'lineAmtPricelist',
        minWidth: 90,
        sortable: true,
        title: '零售金额',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 100,
        sortable: true,
        title: '批号',
        slots: { default: 'lot' },
      },
      {
        field: 'guaranteeDate',
        minWidth: 100,
        sortable: true,
        title: '效期',
      },
      {
        field: 'bpartnerName',
        minWidth: 150,
        sortable: true,
        title: urlParams?.orderType === 'PR' ? '供应商' : '发货单位',
      },
      {
        field: 'inoutNo',
        minWidth: 100,
        sortable: true,
        title: '入库单号',
      },
      {
        field: 'confirmUsername',
        minWidth: 100,
        sortable: true,
        title: '验收人',
      },
      {
        field: 'applyNo',
        minWidth: 100,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'orderTypeName',
        minWidth: 100,
        sortable: true,
        title: '申请类型',
      },
      {
        field: 'departmentName',
        minWidth: 100,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 100,
        sortable: true,
        title: '入库仓库',
      },
      {
        field: 'description',
        minWidth: 100,
        sortable: true,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered', // 默认实际查询参数 dateFrom，dateTo
        label: '入库时间',
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
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
              const defaultWarehouseId = isFromTraceSearchPage.value
                ? null
                : userStore?.userInfo?.defaultWarehouseId || undefined;
              if (isEmpty(defaultWarehouseId)) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                );
              } else {
                ChcGridApi.formApi?.setFieldValue('departmentId', '');
              }

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
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                );
              } else {
                const defaultWarehouseId = isFromTraceSearchPage.value
                  ? null
                  : userStore?.userInfo?.defaultWarehouseId || undefined;
                if (isEmpty(defaultWarehouseId)) {
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                  );
                } else {
                  ChcGridApi.formApi?.setFieldValue('warehouseId', '');
                }
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
        // defaultValue: isFromTraceSearchPage.value
        //   ? null
        //   : userStore?.userInfo?.defaultWarehouseId || undefined,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '收货仓库',
      },
      {
        component: 'Input',
        fieldName: 'inoutNo',
        label: '入库单号',
        defaultValue: isFromTraceSearchPage.value
          ? route?.query?.inoutNo
          : null,
        componentProps: {
          placeholder: '请输入入库单号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'WO', label: '库房请领' },
              { value: 'WR', label: '库房请退' },
              { value: 'MO', label: '库间调拨' },
              { value: 'SO', label: '科室请领' },
              { value: 'SR', label: '科室请退' },
            ],
            placeholder: '请选择申请类型',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: '',
        fieldName: 'queryOrderType',
        label: '申请类型',
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
    id: 'receiveDocQuery',
    // dataTableId:
    //   '/inoutAction/queryDetail.do?page=input&returnDoc=&orderType=WO,MO,WR',
    dataTableId: `/inoutAction/queryDetail.do?page=input&returnDoc=${urlParams?.returnDoc || ''}&orderType=${urlParams?.orderType || ''}`,
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmt.value = params.summaryRow?.totalAmt || 0;
      totalQty.value = params.summaryRow?.totalQty || 0;
      selectedAmount.value = params.summaryRow?.totalLineAmtPricelist || 0;

      console.warn('afterFetchFn:', params);
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = Number.parseFloat(total.toFixed(2));
  calculateSummarize();
};

// 获取当前请求的基础URL
// const getBaseUrl = () => {
//   return window.location.origin;
// };

// 批号证书弹窗函数
const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImage,
  draggable: true,
});
const openLotCert = async (row: any) => {
  console.warn('openLotCert row', row);
  row.loading = true;
  try {
    const res = await requestFormClient.get(
      `/storageAction/viewInspectReport.do?siteCode=${row.productServerCode}&productCode=${row.productCode}&lot=${row.lot}&index=0`,
    );
    const imageList = (res?.filePaths || []).map((item: any, index: number) => {
      return {
        path: item?.path,
        id: index,
      };
    });
    previewImageModalApi
      .setData({
        imageList,
      })
      .open();
  } catch (error) {
    console.warn('openLotCert error', error);
  } finally {
    row.loading = false;
  }
};

const handleLotClick = (scope: any) => {
  console.warn('handleLotClick', scope.row);
  openLotCert(scope.row);
};

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '零售金额',
      value: selectedAmount.value,
    },
    {
      label: '采购金额',
      value: totalAmt.value,
    },
    {
      label: '数量汇总',
      value: totalQty.value,
      noUnit: true,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #lot="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleLotClick(scope)"
          :data-testid="`button_lot_${scope.rowIndex}`"
        >
          {{ scope.row.lot }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span>零售金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">采购金额：{{ totalAmt }}元</span>
        <span style="margin-left: 20px">数量汇总：{{ totalQty }}元</span> -->
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>

    <!-- 批号证书弹窗 -->
    <PreviewImageModal />
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
