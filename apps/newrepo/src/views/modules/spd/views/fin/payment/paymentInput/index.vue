<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import {
  deletePayment,
  submitPayment,
} from '#/views/modules/spd/views/fin/payment/api';

import createNewPaymentModalComp from '../common/modals/createNewPaymentModal.vue';

const userStore = useUserStore();
console.warn('userStore', userStore);
const parentTableParams = ref<{ [key: string]: any }>({});

// 父表
const [ParentGrid, parentGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
    id: 'paymentInput',
    // api地址
    queryUrl: 'paymentAction/query.do?page=input',
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'documentNo',
        title: '付款单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'payDate',
        title: '登记时间',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'payAmt',
        title: '付款金额',
        minWidth: '100',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.payAmt);
        },
      },
      {
        field: 'startDate',
        title: '开始时间',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'endDate',
        title: '截止时间',
        minWidth: '100',
        sortable: true,
      },
      // {
      //   field: 'orgRegionName',
      //   title: '院区',
      //   // hidden : !(isOrgRegion=='Y'),
      //   minWidth: '100',
      //   sortable: true,
      // },
      // {
      //   field: 'productControlLevelName',
      //   title: isEmpty(userStore.userInfo?.['管控类型'])
      //     ? '商品组'
      //     : userStore.userInfo?.['管控类型'],
      //   visible: userStore.userInfo?.isProductControlLevel,
      //   minWidth: '100',
      //   sortable: true,
      // },
      {
        field: 'payTypeName',
        title: '付款方式',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'docStatusName',
        title: '状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'rejectReason',
        title: '退回原因',
        minWidth: '150',
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
      //   width: 230,
      // },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '登记时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'documentNo',
        label: '付款单号',
        componentProps: () => {
          return {
            placeholder: `请输入`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'bpartnerId',
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
    ],
    gridEvents: {
      radioChange: onRadioChange,
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      parentTableParams.value.paymentId = undefined;
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
  },
);

// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        // {
        //   type: 'checkbox',
        //   width: 50,
        //   align: 'center',
        // },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'movementTypeName',
          title: '类型',
          minWidth: '110',
          sortable: true,
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
          field: 'modelNo',
          title: '型号',
          minWidth: '130',
          sortable: true,
          visible: false,
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
          minWidth: '60',
          sortable: true,
        },
        {
          field: 'pricePo',
          title: '进价',
          minWidth: '110',
          sortable: true,
          align: 'right',
        },
        {
          field: 'priceList',
          title: '零售价',
          minWidth: '110',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qty',
          title: '数量',
          minWidth: '110',
          sortable: true,
          align: 'right',
        },
        {
          field: 'amountPricePo',
          title: '进价金额',
          minWidth: '110',
          sortable: true,
          align: 'right',
        },
        {
          field: 'amountPriceList',
          title: '零售价金额',
          minWidth: '110',
          sortable: true,
          align: 'right',
        },
        {
          field: 'taxInvoiceNo',
          title: '发票号码',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '110',
          sortable: true,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'paymentInput_son',
    dataTableId: 'paymentAction/queryProductDetail.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.paymentId) {
        return false;
      }
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

async function onRadioChange({ row }: { row: any }) {
  if (row?.paymentId) {
    parentTableParams.value.paymentId = row.paymentId;
    childGridApi.reload({
      paymentId: parentTableParams.value.paymentId,
    });
    await parentGridApi.grid.clearCheckboxRow();
    parentGridApi.grid.setCheckboxRow(row, true);
  } else {
    parentTableParams.value.paymentId = undefined;
    childGridApi.grid.remove();
  }
}

// 父表 - 新建付款对话框
const [CreateNewPaymentModal, createNewPaymentModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: createNewPaymentModalComp,
  draggable: true,
});

function handleAdd() {
  createNewPaymentModalApi.setData({}).open();
}

function submit() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确定要提交${selectedRows.length}笔付款吗？`,
    onOk: async () => {
      try {
        await submitPayment({
          paymentId: JSON.stringify(
            selectedRows.map(({ paymentId }) => paymentId),
          ),
        });

        message.success('提交成功');

        parentGridApi.query();
      } catch {
        message.error('提交失败');
      }
    },
  });
}

function del() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确定要删除${selectedRows.length}笔付款吗？`,
    onOk: async () => {
      try {
        await deletePayment({
          paymentId: JSON.stringify(
            selectedRows.map(({ paymentId }) => paymentId),
          ),
        });

        message.success('删除成功');

        parentGridApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

const taxInvoiceNo = ref('');

function handleChildSearch() {
  childGridApi.reload({
    paymentId: parentTableParams.value.paymentId,
    taxInvoiceNo: taxInvoiceNo.value,
  });
}

onMounted(() => {
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
        <CreateNewPaymentModal :after-submit="parentGridApi.query" />
        <ParentGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd"
              class="mr-[0.5rem]"
              data-testid="button_add"
            >
              新建
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="submit"
              data-testid="button_submit"
            >
              提交
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              ghost
              danger
              type="primary"
              @click="del"
              class="mr-[0.5rem]"
              data-testid="button_del"
            >
              删除
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="taxInvoiceNo"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入发票号"
              @keyup.enter="handleChildSearch"
              allow-clear
              data-testid="input_taxInvoiceNo"
            />
            <Button
              type="primary"
              @click="handleChildSearch"
              data-testid="button_childSearch"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>
