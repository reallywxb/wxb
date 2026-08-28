<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  ExportActionIcon,
  IconfontBasicView,
  SearchActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useGlobalPrintStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Checkbox, Input, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import InvoiceDetailModalComp from '../common/modals/invoiceDetailModal.vue';
import SettlementDetailModalComp from '../common/modals/settlementDetailModal.vue';

const globalPrintStore = useGlobalPrintStore();
const parentTableParams = ref<{ [key: string]: any }>({});

// 父表
const [
  ParentGrid,
  parentGridApi,
  { FormModal, LogModal, handleExport: handleParentExport },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['settlementDateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        trigger: 'cell',
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'settlementWfQuery',
    // api地址
    queryUrl: '/settlementAction/query.do?page=query',
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'settlementNo',
        title: '结算单号',
        width: '100',
        sortable: true,
      },
      {
        field: 'settlementDate',
        title: '结算时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        width: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'endDate',
        title: '截止日期',
        width: '110',
        sortable: true,
      },
      // {
      //   field: 'isWorkflowEnd',
      //   title: '审批是否结束',
      //   formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
      //   width: '130',
      //   sortable: true,
      // },
      {
        field: 'totalAmt',
        title: '结算金额',
        format: '0.00',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'origPricePoTotalAmt',
        title: '采购入库金额',
        // format: '0.000##',
        align: 'right',
        width: '120',
        sortable: true,
      },
      {
        field: 'totalAmountAdj',
        title: '调价金额',
        // format: '0.000##',
        align: 'right',
        width: '100',
        sortable: true,
      },
      // {
      //   field: 'totalDiffAmt',
      //   title: '尾差金额',
      //   // format: '0.000##',
      //   width: '100',
      //   sortable: true,
      // },
      {
        field: 'isNeedInvoice',
        title: '需开票',
        width: '80',
        formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
        sortable: true,
      },
      {
        field: 'docStatusName',
        title: '状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'openStatus',
        title: '开票状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'invoicedAmt',
        title: '开票金额',
        format: '0.00',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        width: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'completeUserName',
        title: '确认人',
        width: '100',
        sortable: true,
      },
      {
        field: 'completeTime',
        title: '确认时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 230,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'settlementDateRange',
        label: $t('fin.settlement.settlementInput.settlementDateRange'),
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: $t('fin.settlement.settlementInput.warehouseId'),
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
            placeholder: `请选择${$t('fin.settlement.settlementInput.warehouseId')}`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: `请选择供应商`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'settlementNo',
        label: '结算单号',
        componentProps: () => {
          return {
            placeholder: ``,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isNeedInvoice',
        label: '需开票',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'openStatus',
        label: '开票状态',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: '1', label: '未开票' },
              { value: '2', label: '开票中' },
              { value: '3', label: '已开票' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      // {
      //   component: 'ChcSelect',
      //   fieldName: 'isNeedPay',
      //   label: '有调价',
      //   componentProps: () => {
      //     return {
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: ``,
      //       defaultValue: '',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      // },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row?.settlementId) {
          parentTableParams.value.settlementId = row.settlementId;
          childGridApi.reload({ settlementId: row.settlementId });
          await parentGridApi.grid.clearCheckboxRow();
          parentGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.settlementId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: childGridApi,
  },
);

// 子表
const [ChildGrid, childGridApi, { handleExport: handleChildExport }] =
  useSpdGrid(
    {
      gridOptions: {
        columns: [
          { title: '序号', type: 'seq', width: 50, align: 'center' },
          {
            field: 'settlementLineId',
            title: '结算行ID',
            width: '120',
            sortable: true,
          },
          {
            field: 'productCode',
            title: '药品编码',
            width: '120',
            sortable: true,
          },
          {
            field: 'productName',
            title: '药品名称',
            width: '200',
            sortable: true,
          },
          {
            field: 'productSpec',
            title: '规格',
            width: '150',
            sortable: true,
          },
          {
            field: 'manufacturer',
            title: '厂家',
            width: '150',
            sortable: true,
          },
          {
            field: 'uomName',
            title: '单位',
            width: '80',
            sortable: true,
          },
          {
            field: 'qty',
            title: '结算数量',
            width: '90',
            align: 'right',
            sortable: true,
          },
          {
            field: 'price',
            title: '结算开票价',
            width: '100',
            align: 'right',
            sortable: true,
          },
          {
            field: 'pricePO',
            title: '结算入库价',
            width: '100',
            align: 'right',
            sortable: true,
          },
          {
            field: 'origPricePo',
            title: '采购入库价',
            format: '0.00',
            width: '100',
            align: 'right',
            sortable: true,
          },
          {
            field: 'lineAmt',
            title: '结算金额',
            format: '0.00',
            width: '110',
            align: 'right',
            sortable: true,
          },
          {
            field: 'origPricePoAmt',
            title: '采购入库金额',
            format: '0.00',
            width: '120',
            align: 'right',
            sortable: true,
          },
          {
            field: 'amountAdj',
            title: '调价金额',
            format: '0.00',
            width: '90',
            align: 'right',
            sortable: true,
          },
          {
            field: 'qtySettleLeft',
            title: '未结数量',
            width: '90',
            align: 'right',
            sortable: true,
          },
          {
            field: 'lot',
            title: '批号',
            width: '120',
            sortable: true,
          },
          {
            field: 'guaranteeDate',
            title: '效期',
            width: '110',
            sortable: true,
          },
          {
            field: 'invoiceRule',
            title: '分票规则',
            width: '120',
            sortable: true,
          },
          {
            field: 'openStatus',
            title: '开票状态',
            width: '120',
            sortable: true,
          },
          {
            field: 'invoicedAmt',
            title: '开票金额',
            format: '0.00',
            width: '100',
            align: 'right',
            sortable: true,
          },
          {
            field: 'isVoided',
            title: '已作废',
            width: '80',
            formatter: ({ cellValue }: any) =>
              cellValue === 'Y' ? '是' : '否',
            sortable: true,
          },
          {
            align: 'center',
            field: 'action',
            slots: { default: 'action' },
            fixed: 'right',
            headerAlign: 'center',
            showOverflow: false,
            title: $t('system.menu.operation'),
            width: 230,
          },
        ],
        proxyConfig: {
          autoLoad: false,
        },
      },
    },
    {
      parentTableParams,
      id: 'settlementQuery_son',
      dataTableId: 'settlementAction/queryLine.do',
      tableSearchExtraParams: {
        // orgId: userStore.userInfo?.orgId,
      },
      beforeFetchFn: (params) => {
        return {
          ...params,
          ...parentTableParams.value,
        };
      },
      getTableArrDataFn: (params) => {
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );

// 子表查询
const productName = ref('');
const isVoided = ref(false);

const handleSearch = () => {
  childGridApi.reload({
    settlementId: parentTableParams.value.settlementId,
    productName: productName.value,
    isVoided: isVoided.value ? 'Y' : undefined,
  });
};

const [InvoiceDetailModal, invoiceDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: InvoiceDetailModalComp,
  draggable: true,
});

// 查看发票明细
function showInvoiceDetail(row: any) {
  invoiceDetailModalApi
    .setData({
      settlementLineId: row.settlementLineId,
      summaryCols: '',
    })
    .open();
}

const [SettlementDetailModal, settlementDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: SettlementDetailModalComp,
  draggable: true,
});

// 查看结算明细
function showSettlementDetail(row: any) {
  settlementDetailModalApi
    .setData({
      settlementId: row.settlementId,
      settlementLineId: row.settlementLineId,
    })
    .open();
}

function printDetail(row: any) {
  // console.log('row', row);
  // const records = parentGridApi.grid.getCheckboxRecords(true);
  // console.log('records', records);
  const paramLine: number[] = [];
  paramLine.push(row.settlementId);
  Modal.confirm({
    title: '打印提示',
    content: '确认打印结算明细吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/settlementAction/printSettlementLineDetail.do?id=${paramLine}`,
      });
    },
    onCancel() {},
  });
}
onMounted(() => {
  // 触发自动查询
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <LogModal />
        <FormModal />
        <SettlementDetailModal />
        <ParentGrid>
          <template #toolbar-actions>
            <!--            <Button type="primary" class="mr-[0.5rem]" @click="handlePrint">-->
            <!--              打印-->
            <!--              <template #icon>-->
            <!--                <SvgPrintFillIcon />-->
            <!--              </template>-->
            <!--            </Button>-->
            <Button
              type="primary"
              @click="handleParentExport"
              class="mr-[0.5rem]"
              data-testid="button_parentExport"
            >
              导 出
              <template #icon>
                <ExportActionIcon />
              </template>
            </Button>
          </template>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click.stop="showSettlementDetail(scope.row)"
              :data-testid="`button_parentSettlementDetail_${scope.rowIndex}`"
            >
              结算明细
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click.stop="printDetail(scope.row)"
              :data-testid="`button_parentPrintDetail_${scope.rowIndex}`"
            >
              打印明细
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <InvoiceDetailModal />
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              @keyup.enter="handleSearch"
              allow-clear
              data-testid="input_productName"
            />

            <Checkbox
              class="mr-[1rem]"
              v-model:checked="isVoided"
              @change="handleSearch"
              data-testid="checkbox_isVoided"
            >
              已作废
            </Checkbox>

            <Button
              class="mr-[0.5rem]"
              type="primary"
              @click="handleSearch"
              data-testid="button_childSearch"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleChildExport"
              data-testid="button_childExport"
            >
              导出
              <template #icon>
                <ExportActionIcon />
              </template>
            </Button>
          </template>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="showSettlementDetail(scope.row)"
              :data-testid="`button_childSettlementDetail_${scope.rowIndex}`"
            >
              结算明细
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="showInvoiceDetail(scope.row)"
              :data-testid="`button_childInvoiceDetail_${scope.rowIndex}`"
            >
              发票明细
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

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
