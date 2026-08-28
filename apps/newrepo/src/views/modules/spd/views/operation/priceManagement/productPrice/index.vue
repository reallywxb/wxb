<script lang="ts" setup>
import { ref } from 'vue';

// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';

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
      fieldMappingTime: [
        ['dateOrdered', ['createDateFrom', 'createDateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      // showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
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
    id: 'parent',
    queryUrl: '/productAction/queryProduct.do',
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
        field: 'modelNo',
        title: '型号',
        minWidth: '120',
        sortable: true,
        visible: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '120',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturerName',
        title: '生产厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productStyleName',
        title: '剂型',
        minWidth: '剂型',
      },
      {
        field: 'uomName',
        title: '采购单位',
        minWidth: '120',
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
        title: '零售价',
        minWidth: '90',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
      },
      {
        field: 'defaultVendorName',
        title: '默认供应商',
        minWidth: '150',
      },
      {
        field: 'isPurchasePriceUnify',
        title: '统一定价',
        minWidth: '100',
        sortable: true,
        formatter({ row }: any) {
          return row.isPurchasePriceUnify === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'productControlLevelName',
        title: '商品组',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '注册证号',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'priceTypeName',
        title: '价格类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'isBid',
        title: '是否省标',
        minWidth: '100',
        sortable: true,
        formatter({ row }: any) {
          return row.isBid === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'markCode',
        title: '省标编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'isCityBid',
        title: '是否市标',
        minWidth: '100',
        sortable: true,
        formatter({ row }: any) {
          return row.isCityBid === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'cityBidCode',
        title: '市标编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '140',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/userOrgList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择机构',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
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
      // TODO:medicine cancel modelNo
      // {
      //   component: 'Input',
      //   fieldName: 'modelNo',
      //   label: '型号',
      //   componentProps: {
      //     placeholder: '请输入型号',
      //   },
      // },
      {
        component: 'Input',
        fieldName: 'productSpec',
        label: '规格',
        componentProps: {
          placeholder: '请输入规格',
        },
      },
      {
        component: 'Input',
        fieldName: 'manufacturerName',
        label: '生产厂家',
        componentProps: {
          placeholder: '请输入生产厂家',
        },
      },
      {
        component: 'Input',
        fieldName: 'certificateNo',
        label: '注册证号',
        componentProps: {
          placeholder: '请输入注册证号',
        },
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000244',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择管控类型',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
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

        fieldName: 'productControlLevel',
        label: '商品组',
      },

      {
        component: 'Input',
        fieldName: 'markCode',
        label: '省标编码',
        componentProps: {
          placeholder: '请输入省标编码',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // defaultValue: '',
            options: [
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择统一定价',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPurchasePriceUnify',
        label: '统一定价',
      },
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '创建时间',
        formItemClass: 'col-span-1',
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
        isApproved: 'Y',
        isActive: 'Y',
      };
    },
  },
);

const handleChangePrice = (isbatch: boolean) => {
  priceModalApi
    .setData({
      selectedRows: selectedRows.value,
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
