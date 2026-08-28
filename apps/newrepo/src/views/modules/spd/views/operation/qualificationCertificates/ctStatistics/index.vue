<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { useSpdGrid } from '#/components/spd';

import { gridColumns } from './options';

const userStore = useUserStore();

const extParams = ref<{
  isActive?: string;
  orgId?: string;
}>({
  isActive: '',
  orgId: userStore.userInfo?.orgId || '',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
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
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '产品名称',
        componentProps: {
          placeholder: '请输入产品名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
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
        fieldName: 'vendorId',
        label: '供应商',
      },
      {
        component: 'Switch',
        componentProps: {
          disabled: false,
          allowClear: true,
          options: [
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
              value: 'false',
            },
          ],
          placeholder: '请选择',
          onChange(val: any, option: any) {
            console.warn('val', val, 'option', option);
            extParams.value.isActive = val ? 'Y' : '';
          },
          style: {
            width: '40px',
          },
        },
        defaultValue: false,
        fieldName: 'isOpen',
        label: '活跃',
      },
    ],
    dataTableId: '/productCertAction/queryCtStatis.do',
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

onMounted(() => {
  console.warn('urlParams');
  ChcGridApi.query();
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button> -->
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
