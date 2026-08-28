<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { ExportActionIcon, SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

// import addModalUi from './addModal/index.vue';
import { columns } from './gridOptions';
import { searchFormSchemas } from './searchFormSchemas';

const [cols, gridColumns] = handleCommonGridColumns(columns);
const userStore = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发并携带表单参数
const searchController = new LazySearch(1, async () => {
  await nextTick();
  const values = await ChcGridApi.formApi.getValues();
  ChcGridApi.query({ ...values });
  isFirstLoaded.value = true;
});
const [ChcGrid, ChcGridApi, { FormModal, LogModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    // 表格配置
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true, // 选中行时高亮
      },
      proxyConfig: {
        autoLoad: false,
      },
      rowStyle: ({ row }: { row: any }) => {
        const validToDate = convertDateFromString(row.validTo);
        if (!validToDate) return {};
        const thirtyDaysLater = getTimeAfterToday(30);
        if (validToDate < new Date()) {
          return { color: 'red' };
        } else if (validToDate < thirtyDaysLater) {
          return { color: 'blue' };
        }
        return {};
      },
    }),
  },
  {
    dataTableId: '/vendorAction/queryContract.do',
    id: 'purchaseAgreementQueryFa',
    gridColumns: [
      {
        type: 'radio',
        width: 60,
        fixed: 'left',
        visible: false,
        label: '单选',
      },
      ...gridColumns,
    ],
    formSchema: searchFormSchemas,
    cols,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.contractId) {
          parentTableParams.value = { contractId: row.contractId };
          // contractId.value = row.contractId;
          roleGridApi.query({ contractId: row.contractId });
        } else {
          parentTableParams.value = {};
        }
      },
    },
    tableSearchExtraParams: {},
    // orgId: userStore.userInfo?.orgId,
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [RoleGrid, roleGridApi, { FormModal: RoleFormModal, handleExport }] =
  useSpdGrid(
    {
      gridOptions: {
        columns: [
          { title: '序号', type: 'seq', width: 50, align: 'center' },
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
            minWidth: 110,
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
            field: 'modelNo',
            minWidth: 90,
            sortable: true,
            title: '型号',
            visible: false,
          },
          {
            field: 'uomName',
            minWidth: 110,
            sortable: true,
            title: '单位',
            align: 'center',
          },
          {
            field: 'price',
            minWidth: 110,
            sortable: true,
            title: '采购价',
            formatter: ({ cellValue }: any) => {
              return handlePriceToFixedTwo(cellValue);
            },
            align: 'right',
          },
          {
            field: 'discountRate',
            minWidth: 110,
            sortable: true,
            title: '折扣率',
            align: 'right',
          },
          {
            field: 'discountPrice',
            minWidth: 110,
            sortable: true,
            title: '折扣价',
            formatter: ({ cellValue }: any) => {
              return handlePriceToFixedTwo(cellValue);
            },
            align: 'right',
          },
          {
            field: 'guaranteeDaysMin',
            minWidth: 120,
            sortable: true,
            title: '效期预警天数',
            align: 'right',
          },
          {
            field: 'description2',
            minWidth: 110,
            sortable: true,
            title: '备注',
            align: 'right',
          },
        ],
        proxyConfig: {
          autoLoad: false,
        },
      },
    },
    {
      parentTableParams,
      dataTableId: '/vendorAction/queryContractLine.do',
      id: 'purchaseAgreementQueryCh',
      tableSearchExtraParams: {
        // orgId: userStore.userInfo?.orgId,
      },
      beforeFetchFn: (params) => {
        if (isEmpty(parentTableParams.value?.contractId)) {
          return false;
        }
        return {
          ...params,
          ...parentTableParams.value,
        };
      },
      afterFetchFn: (params) => {
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );

const convertDateFromString = (dateString: any) => {
  if (dateString) {
    const date = new Date(dateString.replaceAll('-', '/'));
    return date;
  }
};

const getTimeAfterToday = (days: number) => {
  const today = new Date();
  const targetday = today.getTime() + 1000 * 60 * 60 * 24 * days;
  today.setTime(targetday);
  return today;
};

const productName = ref('');
const handleSearch = (e) => {
  console.warn('handleSearch', e.target.value, productName.value);
  roleGridApi.query({
    contractId: parentTableParams.value.contractId,
    productName: productName.value,
  });
};

// 新增 编辑 表单提交之后执行
function refreshTable() {
  ChcGridApi.query();
}

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
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
        <addModal :after-submit="refreshTable" />
        <LogModal />
        <FormModal />
        <ChcGrid />
      </template>
      <template #second>
        <RoleFormModal />
        <RoleGrid>
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
              @click="handleSearch"
              data-testid="button_search"
            >
              搜索
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleExport"
              class="ml-[0.5rem]"
              data-testid="button_export"
            >
              导 出
              <template #icon>
                <ExportActionIcon />
              </template>
            </Button>
          </template>
        </RoleGrid>
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
