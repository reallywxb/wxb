<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
// import { commonFormOptions, viewFormOptions } from './options';
import Summarize from '#/components/spd/summarize/index.vue';
import previewImage from '#/views/modules/spd/views/common/previewImages/index.vue';

const globalPrintStore = useGlobalPrintStore();

// 批号证书弹窗函数
const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImage,
  draggable: true,
});

const userStore = useUserStore();

const route = useRoute();
const urlParams = route.meta?.urlParams || {};
const orgId = userStore.userInfo?.orgId || null;

const extParams = ref<{
  orgId?: number | string;
}>({
  orgId,
});
const selectedAmount = ref(0);
const totalAmt = ref(0);
const totalQty = ref(0);
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      showCollapseButton: false,
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
      radioConfig: {
        trigger: 'row',
        highlight: true,
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
      { title: '单选', type: 'radio', visible: false },
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
        minWidth: 90,
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
        minWidth: 120,
        sortable: true,
        title: '采购价',
        align: 'right',
      },
      {
        field: 'lineAmt',
        minWidth: 120,
        sortable: true,
        title: '采购金额',
        align: 'right',
      },
      {
        field: 'priceList',
        minWidth: 120,
        sortable: true,
        title: '零售价',
        align: 'right',
      },
      {
        field: 'lineAmtPricelist',
        minWidth: 120,
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
            placeholder: '请选择收货仓库',
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
        label: '收货仓库',
      },
      {
        component: 'Input',
        fieldName: 'inoutNo',
        label: '入库单号',
        componentProps: {
          placeholder: '请输入配送单号',
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
    dataTableId: `/inoutAction/queryDetail.do?page=input&returnDoc=${urlParams?.returnDoc || ''}&orderType=${urlParams?.orderType || ''}`,
    // commonFormOptions,
    // viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmt.value = params.summaryRow?.totalAmt || 0;
      totalQty.value = params.summaryRow?.totalQty || 0;

      // 计算所有记录的零售金额合计，先*100避免浮点数精度问题
      let totalLineAmtPricelist = 0;
      const rows = params.rows || [];
      for (const row of rows) {
        const lineAmtPricelist = Number.parseFloat(row.lineAmtPricelist) || 0;
        totalLineAmtPricelist += Math.round(lineAmtPricelist * 100);
      }
      selectedAmount.value = Math.round(totalLineAmtPricelist) / 100;
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      console.warn('afterFetchFn:', params);
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

// 批号证书弹窗函数
const openLotCert = async (row: any) => {
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
const handlePrint = () => {
  const record = ChcGridApi.grid.getTableData().tableData || [];

  if (!record) {
    message.error('请选择需要打印的数据');
    return;
  }

  const params = {};
  const paramLine = record.map((row) => row.inoutLineId);
  params.ids = paramLine;

  Modal.confirm({
    title: '打印提示',
    content: '确认打印入库明细吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printInoutInDetail.do?params=${encodeURIComponent(JSON.stringify(params))}`,
      });
    },
    onCancel() {},
  });
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

onMounted(() => {
  console.warn('urlParams', urlParams, userStore);
  console.warn('orgId', userStore.userInfo?.orgId);
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});
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
