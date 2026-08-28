<script setup lang="ts">
import { onMounted, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import { formOptions } from '../common/options';
import { columns } from './gridOptions';
import { searchFormSchemas } from './searchFormSchemas';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);

// const [ApproveLogModal, approveLogModalApi] = useVbenModal({
//   connectedComponent: approveLogModal,
// });
const [cols, gridColumns] = handleCommonGridColumns(columns);
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
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
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      rowStyle: ({ row }: { row: any }) => {
        if (row.isActive === 'N') {
          return { color: 'gray' };
        } else if (row.certValidTo && new Date(row.certValidTo) < new Date()) {
          return { color: 'red' };
        }
        return {};
      },
      cellStyle(scope: any) {
        if (scope.column.field === 'isActive' && scope.row.isActive === 'N') {
          return {
            color: 'red',
          };
        }
      },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // // 单个复选框变化事件
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
      // // 全选/全不选事件
      // checkboxAll: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      ...gridColumns,
    ],
    formSchema: searchFormSchemas,
    cols,
    dataTableId: '/productAction/queryProduct.do',
    id: 'queryHcProduct',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: { page: 'query' },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleProductCodeClick = ({ row }: any) => {
  detailModalApi
    .setData({
      title: '查看',
      form: cloneDeep(row),
    })
    .open();
};

const handleCertificateNoClick = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '查看证照信息',
    sourcePage: props.thisTab.value,
    type: 'view',
  });
};

// 父表 - 拒绝对话框
const [DetailModal, detailModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
  footer: false,
});

onMounted(() => {
  console.warn('urlParams');
  ChcGridApi.query();
});
</script>
<template>
  <DetailModal disabled :form-options="formOptions" />
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #productCode="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleProductCodeClick(scope)"
        >
          {{ scope.row.productCode }}
        </a>
      </template>
      <template #certificateNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleCertificateNoClick(scope)"
        >
          {{ scope.row.certificateNo }}
        </a>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
