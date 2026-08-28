<script lang="ts" setup>
import type { ContractRowType } from './type';

import { onMounted, toRaw } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import detail from './modal/detail.vue';
import previewImage from './modal/previewImage.vue';

const [detailModal, detailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: detail,
  draggable: true,
});

const [previewImageModal, previewImageModalApi] = useVbenModal({
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImage,
  draggable: true,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        highlight: true,
        trigger: 'row',
      },
      pagerConfig: {
        enabled: true,
      },
      stripe: false,
    }),
  },
  {
    id: 'contractLog',
    // api地址
    queryUrl:
      "/productCertAction/querySyncApply.do?page=Contract&status='NO','PS'",
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'contractNo',
        title: '合同号',
        minWidth: '120',
        sortable: false,
      },
      {
        field: 'beginDate',
        title: '开始时间',
        minWidth: '110',
        sortable: false,
      },
      {
        field: 'endDate',
        title: '结束时间',
        minWidth: '110',
        sortable: false,
      },
      {
        field: 'scope',
        title: '范围',
        width: '100',
        sortable: false,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'statusName',
        title: '状态',
        width: '70',
        sortable: true,
      },
      {
        field: 'checkTime',
        title: '审核时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'rejectReason',
        title: '驳回原因',
        width: '150',
        sortable: true,
      },
      {
        field: 'syncTime',
        title: '同步时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'versionNo',
        title: '版本号',
        width: '90',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        align: 'center',
        width: 160,
        slots: { default: 'action' },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'contractNo',
        label: '合同号',
        componentProps: () => {
          return {
            placeholder: '请输入合同号',
          };
        },
      },
      {
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'PS', label: '已通过' },
              { value: 'NO', label: '已驳回' },
            ],
            placeholder: '请选择状态',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'queryStatus',
        label: '状态',
      },
    ],
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        console.warn('checkboxChange:', records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records, checked }: any) => {
        console.warn('checkboxAll:', checked, records);
      },
    },
    // tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn', params);
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 合同详情
const handleDetail = (row: any) => {
  detailModalApi
    ?.setData({
      row,
      callback() {
        // 刷新表格数据
        // ChcGridApi.query();
      },
    })
    .open();
};

// 查看图片
const handlePreviewImage = (row: ContractRowType) => {
  previewImageModalApi
    ?.setData({
      imageList: row.filePaths,
    })
    .open();
};

onMounted(() => {
  console.warn('onMounted');
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <detailModal />
    <previewImageModal />
    <ChcGrid>
      <template #action="scope">
        <Button
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope.row)"
          data-testid="button_detail_contractLog"
        >
          合同详情
        </Button>
        <Button
          type="primary"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handlePreviewImage(scope.row)"
          data-testid="button_preview_contractLog"
        >
          查看图片
        </Button>
      </template>
    </ChcGrid>
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
