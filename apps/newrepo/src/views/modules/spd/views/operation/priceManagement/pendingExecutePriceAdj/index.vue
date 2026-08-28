<script lang="ts" setup>
import type { ParentTableItem } from './api';

import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Modal as AntModal, Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { cancelPriceListAdj } from './api';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
const page = urlParams?.page || '';
const fatherTableCheckedRow = ref<Record<string, any>>({});
const searchContent = ref('');
// 子表
const [RoleGrid, roleGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        // ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        // ['dateGun', ['certValidFrom', 'certValidTo'], 'YYYY-MM-DD'],
      ],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      // rowStyle:() => {}
      // cellStyle: () => {}
    }),
  },
  {
    gridColumns: [
      {
        type: 'radio',
        width: 60,
        visible: false,
        title: '单选',
      },
      {
        field: 'index',
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: 200,
        sortable: true,
        visible: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        sortable: true,
        minWidth: 120,
      },
      {
        field: 'uomName',
        title: '单位',
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'priceList',
        title: '原零售价',
        sortable: true,
        minWidth: 90,
        align: 'right',
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'priceListNew',
        title: '新零售价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '原采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePONew',
        title: '新采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'description',
        title: '备注',
        width: 150,
        sortable: true,
      },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/productAction/queryProductPriceListAdj.do',
    beforeFetchFn: (params) => {
      if (isEmpty(fatherTableCheckedRow.value)) {
        return false;
      }
      return {
        ...params,
        priceListAdjId: fatherTableCheckedRow.value.priceListAdjId,
      };
    },
    afterFetchFn: (params) => {
      // 数据加载成功后，自动选中第一行
      if (params.rows && params.rows.length > 0) {
        nextTick(() => {
          roleGridApi.grid.setRadioRow(params.rows[0]);
        });
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          // field: 'priorityRuleName',
          // order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/productAction/queryPriceListAdj.do',
    tableSearchExtraParams: {
      page,
      docStatus: 'WU',
    },
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      {
        field: 'sitePriceListAdjId',
        title: '调价单号',
        minWidth: 110,
        sortable: true,
      },
      { field: 'docDate', title: '单据日期', minWidth: 120, sortable: true },
      { field: 'adjNo', title: '调价文号', minWidth: 130, sortable: true },
      {
        field: 'adjTypeName',
        title: '调价类型',
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'effectiveTime',
        title: '生效时间',
        minWidth: 130,
        sortable: true,
      },
      {
        field: 'productCount',
        title: '品种数',
        minWidth: 70,
        align: 'right',
        sortable: true,
      },
      {
        field: 'adjReason',
        title: '调价原因',
        minWidth: 160,
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: 110,
        sortable: true,
      },
      {
        field: 'approveUserName',
        title: '审批人',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'approveTime',
        title: '审批时间',
        minWidth: 160,
        sortable: true,
      },
      { field: 'description', title: '备注', minWidth: 150, sortable: true },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '单据日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'year')
            .subtract(2, 'week')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'sitePriceListAdjId',
        label: '调价单号',
        componentProps: () => {
          return {
            placeholder: '请输入调价单号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入编码/搜索码/名称',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: ParentTableItem }) => {
        if (row && row.priceListAdjId) {
          fatherTableCheckedRow.value = deepClone(row);
          roleGridApi.query({ priceListAdjId: row.priceListAdjId });
        } else {
          // 父表没数据，子表要清空
          fatherTableCheckedRow.value = {};
          roleGridApi.grid.remove();
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 查询
const handleSearch = () => {
  if (!fatherTableCheckedRow.value.priceListAdjId) {
    return;
  }
  roleGridApi.query({
    priceListAdjId: fatherTableCheckedRow.value.priceListAdjId,
    productName: searchContent.value.trim(),
  });
};

// 作废
const handleCancel = (row: ParentTableItem) => {
  // const selectedRow = ChcGridApi.grid.getRadioRecord(true);
  console.warn('作废selectedRow===>', row);
  AntModal.confirm({
    title: '作废提示',
    content: '确认作废调价单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      cancelPriceListAdj({
        priceListAdjId: row.priceListAdjId,
      }).then((res) => {
        if (res && res.success) {
          message.success('作废成功');
          ChcGridApi.query();
        }
      });
    },
  });
};

// 打印
const handlePrint = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrint row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const priceListAdjId = (row as ParentTableItem).priceListAdjId;
  AntModal.confirm({
    title: '打印提示',
    content: '确认打印调价单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printOutputDoc.do?id=${priceListAdjId}`,
      });
    },
    onCancel() {},
  });
};

onMounted(() => {
  console.warn('urlParams:', urlParams, userStore);
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handlePrint"
                class="mr-[0.5rem]"
                data-testid="button_print"
              >
                打 印
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                danger
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleCancel(scope.row)"
                data-testid="button_cancel"
              >
                作废
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <label for="searchContent">药品：</label>
              <Input
                v-model:value="searchContent"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_searchContent_childGrid"
              />
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleSearch"
                data-testid="button_search_childGrid"
              >
                查询
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleExport"
                class="mr-[0.5rem]"
                data-testid="button_export_childGrid"
              >
                导出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
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
