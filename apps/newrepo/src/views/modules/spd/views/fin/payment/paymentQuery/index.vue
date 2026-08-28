<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

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
    id: 'paymentQuery',
    // api地址
    queryUrl: 'paymentAction/query.do?page=query',
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
        format: '0.00',
        minWidth: '100',
        sortable: true,
        align: 'right',
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
      //   field: 'productControlLevelName',
      //   title: userStore.userInfo?.['管控类型'] || '商品组',
      //   visible: userStore.userInfo?.isProductControlLevel,
      //   minWidth: '100',
      //   sortable: true,
      // },
      // {
      //   field: 'orgRegionName',
      //   title: '院区',
      //   // hidden : !(isOrgRegion=='Y'),
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
        field: 'commitTime',
        title: '提交时间',
        minWidth: '160',
      },
      {
        field: 'commitUserName',
        title: '提交人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'confirmTime',
        title: '确认时间',
        minWidth: '160',
      },
      {
        field: 'confirmUserName',
        title: '确认人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
        //			}, {
        //				"field": "bankAccountNo",
        //				"title": "收款账号",
        //				"minWidth": "120",
        //				"sortable": true
        //			},{
        //				"field": "bankName",
        //				"title": "收款银行",
        //				"minWidth": "120",
        //				"sortable": true
      },
      {
        field: 'docStatusName',
        title: '状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
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
        label: '付款时间',
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
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'priceList',
          title: '零售价',
          minWidth: '90',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qty',
          title: '数量',
          minWidth: '60',
          sortable: true,
          align: 'right',
        },
        {
          field: 'amountPricePo',
          title: '进价金额',
          minWidth: '90',
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
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '100',
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
    id: 'paymentQuery_son',
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
        <ParentGrid>
          <template #toolbar-actions>
            <!--          <template #toolbar-actions>-->
            <!--            <Button type="primary" @click="handleExport" class="mr-[0.5rem]">-->
            <!--              打印-->
            <!--              <template #icon>-->
            <!--                <ExportActionIcon />-->
            <!--              </template>-->
            <!--            </Button>-->
            <!--          </template>-->
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
            <!--            <Button type="primary" @click="handleExport" class="mr-[0.5rem]">-->
            <!--              打印明细-->
            <!--              <template #icon>-->
            <!--                <ExportActionIcon />-->
            <!--              </template>-->
            <!--            </Button>-->
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>
