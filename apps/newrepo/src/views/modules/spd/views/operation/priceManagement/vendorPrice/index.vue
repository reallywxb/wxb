<script lang="ts" setup>
import type { VendorPriceRowType } from './api';

import { h, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import priceModalUI from './modals/priceModal.vue';

const userStore: any = useUserStore();

const extParams = ref<any>({});

const [priceModal, priceModalApi] = useVbenModal({
  connectedComponent: priceModalUI,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [
      //   ['dateOrdered', ['createDateFrom', 'createDateTo'], 'YYYY-MM-DD'],
      // ],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      checkboxConfig: {
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'vendorPriceGrid',
    queryUrl: 'productAction/queryProductOrg.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },

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
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
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
        field: 'vendorName',
        title: '供应商',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'pricePO',
        title: '采购价',
        minWidth: '120',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
      },
      {
        field: 'priceList',
        title: '药品零售价',
        minWidth: '100',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
      },
      {
        field: 'isDefault',
        title: '默认供应商',
        minWidth: '100',
        sortable: true,
        formatter({ row }: any) {
          return row.isDefault === 'Y' ? '是' : '否';
        },
      },
      // {
      //   field: 'expiredDate',
      //   title: '有效期',
      //   minWidth: '120',
      //   sortable: true,
      // },
      {
        field: 'isPurchasePriceUnify',
        title: '统一定价',
        minWidth: '100',
        sortable: true,
        formatter({ row }: any) {
          return row.isPurchasePriceUnify === 'Y' ? '是' : '否';
        },
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/userOrgList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择机构',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('orgId', val, option);
              // selectController.sign();
              extParams.value.orgId_text = option.name;
            },
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          show: () => {
            return userStore.userInfo.isSaas;
          },
        },
        fieldName: 'orgId',
        label: '机构',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/搜索码/名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('vendorId', val, option);
              // selectController.sign();
              // extParams.value.vendorId_text = option.name;
            },
            // mode: 'multiple',
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
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPurchasePriceUnify',
        label: '统一定价',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {
      checkboxChange: () => {
        selectedRows.value = ChcGridApi.grid.getCheckboxRecords();
      },
      checkboxAll: () => {
        selectedRows.value = ChcGridApi.grid.getCheckboxRecords();
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        isSaas: userStore.userInfo.isSaas,
        isActive: 'Y',
      };
    },
  },
);

// 调价/批量调价
const handleChangePrice = (isbatch: boolean) => {
  console.warn('selectedRows===>', selectedRows.value);
  const records: VendorPriceRowType[] = selectedRows.value;
  // 筛选中统一定价不为否的记录
  const invalidRecords = records.filter(
    (item) => item.isPurchasePriceUnify === 'Y',
  );
  if (invalidRecords.length > 0) {
    Modal.error({
      title: '错误',
      content: h('div', null, [
        h(
          'p',
          { style: 'margin-bottom: 0.5rem' },
          '以下药品是统一定价品种，不能按供应商调价！',
        ),
        h(
          'ul',
          { style: 'padding-left: 20px' },
          invalidRecords.map((item) => {
            return h('li', null, item.productName);
          }),
        ),
      ]),
      okText: '关闭',
      centered: true,
    });
    return;
  }

  // 统一定价为否才能打开弹框
  priceModalApi
    .setData({
      selectedRows: records,
      isbatch,
    })
    .open();
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

const selectedRows = ref<any>([]);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <priceModal @close="handleQuery" />
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            :disabled="selectedRows.length === 0 || selectedRows.length > 1"
            class="mr-[0.5rem]"
            @click="handleChangePrice(false)"
            data-testid="button_priceAdjust"
          >
            调价
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            :disabled="selectedRows.length === 0 || selectedRows.length <= 1"
            @click="handleChangePrice(true)"
            data-testid="button_batchPriceAdjust"
          >
            批量调价
          </Button>
        </template>
      </ChcGrid>
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
