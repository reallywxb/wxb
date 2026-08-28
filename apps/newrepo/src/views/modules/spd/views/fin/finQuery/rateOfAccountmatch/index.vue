<script lang="ts" setup>
import { onMounted } from 'vue';
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
      showCollapseButton: false,
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
    id: 'rateOfAccountmatch',
    // api地址
    queryUrl: 'inventoryPlanAction/queryWarehouseAccountMatch.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'completetime',
        title: '盘点时间',
        minWidth: '150',
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
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'rate',
        title: '账货相符率(%)',
        minWidth: '130',
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

function showRateOfProductAccountmatch({ warehouseId }: any) {
  parentGridApi.formApi
    .getValues<{
      dateFrom: string;
      dateTo: string;
    }>()
    .then(({ dateFrom, dateTo }) => {
      router.push(
        `/fin/finQuery/rateOfProductAccountmatch?warehouseId=${warehouseId ?? ''}&dateFrom=${dateFrom ?? ''}&dateTo=${dateTo ?? ''}`,
      );
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
          @click="showRateOfProductAccountmatch(scope.row)"
          :data-testid="`button_rateOfProductAccountmatch_${scope.rowIndex}`"
        >
          商品账货相符率
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ParentGrid>
  </Page>
</template>
