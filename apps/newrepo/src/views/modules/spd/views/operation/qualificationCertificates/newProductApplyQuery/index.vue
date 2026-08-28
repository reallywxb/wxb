<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import licenseDetail from './modal/licenseDetail.vue';
import {
  commonFormOptions,
  formSchema,
  gridColumns,
  viewFormOptions,
} from './options';

const extParams = ref<{}>({});
const handleSubmit = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.reload(formValues);
};
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: {
      handleSubmit,
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: true,
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
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
    gridColumns,
    formSchema,
    id: 'newProductApplyQuery',
    dataTableId: '/newProductApplyAction/queryNewProductApply.do?page=result',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);

const [licenseDetailModal, licenseDetailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: licenseDetail,
  draggable: true,
});
const handleDetail = (scope: any) => {
  console.warn('scope', scope.row);
  licenseDetailModalApi
    ?.setData({
      row: scope.row,
      callback() {
        // 刷新表格数据
        ChcGridApi.query();
      },
    })
    .open();
};

onMounted(() => {
  console.warn('urlParams');
  handleSubmit();
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <licenseDetailModal />
    <ChcGrid>
      <template #action="scope">
        <Button
          type="primary"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
        >
          证照详情
        </Button>
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
