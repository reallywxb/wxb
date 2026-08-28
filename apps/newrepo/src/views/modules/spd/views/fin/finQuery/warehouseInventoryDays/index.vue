<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { IconfontBasicView } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const router = useRouter();
// 父表
const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // commonConfig: {
      //   labelClass: 'w-[90px]',
      // },
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
    }),
  },
  {
    id: 'warehouseInventoryDays',
    // api地址
    queryUrl: 'inoutAction/queryWarehouseTurnOver.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'inoutAmt',
        title: '出库金额(元)',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'beginInoutAmt',
        title: '期初库存金额(元)',
        minWidth: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'endInoutAmt',
        title: '期末库存金额(元)',
        minWidth: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'turnOverDays',
        title: '库存周转天数',
        minWidth: '140',
        align: 'right',
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
        width: 150,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'month')
            .add(1, 'day')
            .format('YYYY-MM-DD'),
          dayjs(dayjs().format('YYYY-MM-DD')),
        ],
        formItemClass: 'col-span-1',
      },
    ],
    afterFetchFn(params: any) {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

function showProductInventoryDays(rows: any) {
  parentGridApi.formApi
    .getValues<{
      dateFrom: string;
      dateTo: string;
    }>()
    .then(({ dateFrom, dateTo }) => {
      router.push(
        `/fin/finQuery/productInventoryDays?departmentName=${rows.departmentName ?? ''}&warehouseId=${rows.warehouseId ?? ''}&dateFrom=${dateFrom ?? ''}&dateTo=${dateTo ?? ''}`,
      );
    });
}
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="showProductInventoryDays(scope.row)"
          :data-testid="`button_productInventoryDays_${scope.rowIndex}`"
        >
          商品周转参数
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ParentGrid>
  </Page>
</template>
