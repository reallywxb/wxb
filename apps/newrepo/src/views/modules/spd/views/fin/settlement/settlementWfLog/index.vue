<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  EditActionIcon,
  IconfontBasicView,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  deleteLine,
  modifyPrice,
} from '#/views/modules/spd/views/fin/settlement/api';
import { priceAdjustmentFormOptions } from '#/views/modules/spd/views/fin/settlement/common/options';

import approvalProcessModalComp from '../common/modals/approvalProcessModal.vue';
import commonFormModalComp from '../common/modals/commonFormModal.vue';

const parentTableParams = ref<{ [key: string]: any }>({});

// 父表
const [ParentGrid, parentGridApi, { FormModal, LogModal }] = useSpdGrid(
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
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    }),
  },
  {
    id: 'settlementWfLog',
    // api地址
    queryUrl: '/settlementAction/query.do?page=workflowApproveLog',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'settlementNo',
        title: '结算单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'settlementDate',
        title: '结算时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'endDate',
        title: '截止日期',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'isWorkflowEnd',
        title: '审批是否结束',
        formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '结算金额',
        format: '0.00',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'origPricePoTotalAmt',
        title: '原采购金额',
        // format: '0.000##',
        align: 'right',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'totalAmountAdj',
        title: '调价金额',
        // format: '0.000##',
        align: 'right',

        minWidth: '100',
        sortable: true,
      },
      {
        field: 'totalDiffAmt',
        title: '尾差金额',
        // format: '0.000##',
        align: 'right',

        minWidth: '100',
        sortable: true,
      },
      {
        field: 'isNeedInvoice',
        title: '需开票',
        minWidth: '80',
        formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'rejectReason',
        title: '退回原因',
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
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 140,
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
      radioChange: ({ row }: { row: any }) => {
        if (row?.settlementId) {
          parentTableParams.value.settlementId = row.settlementId;
          childGridApi.reload({ settlementId: row.settlementId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.settlementId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
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
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '单选', type: 'radio', visible: false },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
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
          minWidth: '150',
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
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'qty',
          title: '结算数量',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'price',
          title: '结算价',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'origPricePo',
          title: '原采购价',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lineAmt',
          title: '结算金额',
          format: '0.00',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'origPricePoAmt',
          title: '原采购金额',
          format: '0.00',
          minWidth: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: 'amountAdj',
          title: '调价金额',
          format: '0.00',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'diffAmt',
          title: '尾差金额',
          format: '0.000##',
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtySettleLeft',
          title: '未结数量',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'invoiceRule',
          title: '分票规则',
          minWidth: '120',
          sortable: true,
        },
        // {
        //   align: 'center',
        //   field: 'action',
        //   slots: { default: 'action' },
        //   fixed: 'right',
        //   headerAlign: 'center',
        //   showOverflow: false,
        //   title: $t('system.menu.operation'),
        //   width: 140,
        // },
      ],
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
    },
  },
  {
    parentTableParams,
    id: 'settlementWfLog_son',
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

// 子表 - 调整结算价对话框
const [SettlementPriceAdjustmentModal, settlementPriceAdjustmentModalApi] =
  useVbenModal({
    class: 'w-[400px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

// 展示调整结算价对话框
function adjustSettlementPrice() {
  const selectedRow = childGridApi.grid.getRadioRecord();

  if (!selectedRow) {
    message.error('请选择一条行记录');
    return;
  }

  settlementPriceAdjustmentModalApi
    .setData({
      title: '调整结算价',
      form: {
        price: selectedRow.price,
      },
      submit: (params: any) =>
        modifyPrice({
          ...params,
          id: selectedRow.settlementLineId,
        }),
    })
    .open();
}

// 子表 - 删除行
function handleDelChild() {
  const selectedRow = childGridApi.grid.getRadioRecord();

  if (!selectedRow) {
    message.error('请选择一条行记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    okType: 'danger',
    onOk: async () => {
      try {
        await deleteLine({
          id: selectedRow.settlementLineId,
        });

        message.success('删除成功');
        handleSearch();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

// 子表查询
const productName = ref('');
const handleSearch = () => {
  childGridApi.reload({
    settlementId: parentTableParams.value.settlementId,
    productName: productName.value,
  });
};

// 查看审批流程modal
const [approvalProcessModal, approvalProcessModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: approvalProcessModalComp,
  draggable: true,
});

// 查看审批流程
const showApprovalProcess = (row: any) => {
  approvalProcessModalApi
    .setData({
      settlementId: row.settlementId || row.settlementLineId,
      processId: row.processId,
    })
    .open();
};

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
        <approvalProcessModal />
        <ParentGrid>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="showApprovalProcess(scope.row)"
              :data-testid="`button_parentApprovalProcess_${scope.rowIndex}`"
            >
              查看审批流程
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <SettlementPriceAdjustmentModal
          :after-submit="handleSearch"
          :form-options="priceAdjustmentFormOptions"
        />
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
            <Button
              type="primary"
              @click="handleSearch()"
              data-testid="button_search"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              ghost
              danger
              class="mx-[6px]"
              @click="handleDelChild()"
              data-testid="button_delChild"
            >
              删除行
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
            <Button
              ghost
              class="mr-[6px]"
              type="primary"
              @click="adjustSettlementPrice"
              data-testid="button_adjustSettlementPrice"
            >
              调整结算价
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
          </template>
          <!-- TOOD: 先去除子表的查看审批流程按钮 -->
          <!-- <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="showApprovalProcess(scope.row)"
              :data-testid="`button_childApprovalProcess_${scope.rowIndex}`"
            >
              查看审批流程
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template> -->
        </ChildGrid>
      </template>
    </PageSplit>
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
