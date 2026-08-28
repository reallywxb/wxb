<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';

import PackageDetailModalComp from './packageDetailModal.vue';
// import { commonFormOptions, viewFormOptions } from './options';

const userStore = useUserStore();

const route = useRoute();
const urlParams = route.meta?.urlParams || {};
const orgId = userStore.userInfo?.orgId || null;

const extParams = ref<{
  // orgId?: number | string;
}>({
  // orgId,
});

const totalAmt = ref(0);
const totalQty = ref(0);
const [
  ChcGrid,
  ChcGridApi,
  { handleExport, PackageDetailModal, packageDetailModalApi },
] = useSpdGrid(
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
        autoLoad: true,
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
      // // 全选/全不选事件
      // checkboxAll: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'movementDate',
        minWidth: 120,
        sortable: true,
        title: '出库时间',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'insurance',
        minWidth: 120,
        sortable: true,
        title: '医保编码',
      },
      {
        field: 'standardCode',
        minWidth: 120,
        sortable: true,
        title: '贯标编码',
        visible: false, // TODO:medicine cancel 贯标码
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
        field: 'productControlLevelName',
        minWidth: 110,
        visible: userStore.userInfo?.isProductControlLevel,
        sortable: true,
        title: '管控类型',
      },
      {
        field: 'uomName',
        minWidth: 90,
        sortable: true,
        title: '单位',
      },
      {
        field: 'movementQty',
        minWidth: 90,
        sortable: true,
        title: '数量',
        slots: { default: 'movementQty' },
        align: 'right',
      },
      {
        field: 'price',
        minWidth: 120,
        sortable: true,
        title: '采购价',
        align: 'right',
      },
      {
        field: 'lineAmt',
        minWidth: 120,
        sortable: true,
        title: '金额',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 100,
        sortable: true,
        title: '批号',
        // slots: { default: 'lot' },
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
        field: 'vendorName',
        minWidth: 100,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'inoutNo',
        minWidth: 100,
        sortable: true,
        title: '出库单号',
      },
      {
        field: 'orderNo',
        minWidth: 100,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'movementTypeName',
        minWidth: 100,
        sortable: true,
        title: '申请类型',
      },
      {
        field: 'poOrderNo',
        minWidth: 100,
        sortable: true,
        visible: urlParams?.orderType === 'SR',
        title: '原订单号',
      },
      {
        field: 'warehouseName',
        minWidth: 100,
        sortable: true,
        title: '发货仓库',
      },
      {
        field: 'confirmUsername',
        minWidth: 100,
        sortable: true,
        visible: userStore.userInfo.isProductControlLevel,
        title: userStore.userInfo.isProductControlLevel
          ? '发货人'
          : '第一发货人',
      },
      {
        field: 'confirmUsername2',
        minWidth: 100,
        sortable: true,
        visible: userStore.userInfo.isProductControlLevel,
        title: '第二发货人',
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
        label: '出库时间',
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
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择发货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            onChange(val: any, option: any) {
              console.warn(val, option);
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '发货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=3,4',
            placeholder: '请选择收货单位',
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
        fieldName: 'inoutNo',
        label: '出库单号',
        componentProps: {
          placeholder: '请输入出库单号',
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
              { value: 'C+', label: '科室退回' },
              { value: 'C-', label: '科室消耗' },
              { value: 'PC-', label: '患者消耗' },
              { value: 'PC+', label: '患者退回' },
            ],
            placeholder: '请选择申请类型',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: '',
        fieldName: 'movementType',
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
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000503',
            placeholder: '请选择产品类型',
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
        fieldName: 'productType',
        label: '产品类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
            placeholder: '请选择商品类别',
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
        fieldName: 'productCategoryId',
        label: '商品类别',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do?readWrite=N',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'vendorId',
        label: '供应商',
      },
    ],
    dataTableId: `/inoutAction/queryDetail.do?page=w3output&returnNegative=${urlParams?.returnNegative || ''}&isExchange=${urlParams?.isExchange || ''}`,
    // commonFormOptions,
    // viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmt.value = params.summaryRow?.totalAmt || 0;
      totalQty.value = params.summaryRow?.totalQty || 0;

      console.warn('afterFetchFn:', params);
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
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);

const handleMovementQtyClick = (scope: any) => {
  packageDetailModalApi!
    .setData({
      // warehouseId: scope.row?.warehouseId,
      // orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
      type: 'view',
      // checkStatus: type === 'qtyArrived' ? '' : 'Y',
      title: '包装明细查看',
    })
    .open();
};

onMounted(() => {
  console.warn('urlParams', urlParams, userStore);
  console.warn(
    'orgId',
    userStore.userInfo,
    userStore.userInfo.isProductControlLevel,
    orgId,
  );
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <PackageDetailModal />
    <ChcGrid>
      <template #movementQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleMovementQtyClick(scope)"
          :data-testid="`button_movementQty_${scope.rowIndex}`"
        >
          {{ scope.row.movementQty }}
        </a>
      </template>
      <template #toolbar-tools>
        <span style="margin-left: 20px">金额汇总：{{ totalAmt }}元</span>
        <span style="margin-left: 20px">数量汇总：{{ totalQty }}</span>
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
