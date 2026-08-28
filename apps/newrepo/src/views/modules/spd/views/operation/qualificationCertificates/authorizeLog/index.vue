<script lang="ts" setup>
import type { AuthorizeRowType } from './type';

import { onMounted, ref, toRaw } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import detail from './modal/detail.vue';

const selectCheckedRows = ref<AuthorizeRowType[]>([]);
const [detailModal, detailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: detail,
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
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        console.warn('formValues', formValues);
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
    id: 'authorizeLog',
    // api地址
    dataTableId:
      "productCertAction/querySyncApply.do?page=Authorize&status='NO','PS'",
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
        field: 'manufacturerName',
        title: '生产企业',
        width: '120',
        sortable: false,
      },
      {
        field: 'authorizeCompanyName',
        title: '授权企业',
        width: '120',
        sortable: false,
      },
      {
        field: 'toAuthorizeCompanyName',
        title: '被授权企业',
        width: '120',
        sortable: false,
      },
      {
        field: 'certDate',
        title: '开始时间',
        width: '110',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '有效期至',
        width: '110',
        sortable: true,
      },
      {
        field: 'validityType',
        title: '是否长期',
        width: '70',
        sortable: false,
        formatter: ({ row }) => {
          const validityTypeMap: Record<string, string> = {
            R: '否',
            L: '是',
          };
          return validityTypeMap[row.validityType] || '';
        },
      },
      {
        field: 'scope',
        title: '范围',
        width: '110',
        sortable: false,
      },
      {
        field: 'statusName',
        title: '状态',
        width: '100',
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
        fieldName: 'manufacturerName',
        label: '生产企业',
        componentProps: () => {
          return {
            placeholder: '生产企业',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'authorizeCompanyName',
        label: '授权企业',
        componentProps: () => {
          return {
            placeholder: '授权企业',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'toAuthorizeCompanyName',
        label: '被授权企业',
        labelClass: 'w-[90px]',
        componentProps: () => {
          return {
            placeholder: '',
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            // dictUrl: '',
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'PS', label: '已通过' },
              { value: 'NO', label: '已驳回' },
            ],
            placeholder: '',
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
        selectCheckedRows.value = records;
      },
      // 全选/全不选事件
      checkboxAll: ({ records, checked }: any) => {
        console.warn('checkboxAll:', checked, records);
        selectCheckedRows.value = records;
      },
    },
    // tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn', params);
      return params;
      // return {
      //     ...params,
      //     departmentId:
      //       params.departmentId === '-1' ? undefined : params.departmentId,
      //     start: undefined,
      //     limit: 0,
      // },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 详情处理函数
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

onMounted(() => {
  console.warn('onMounted');
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <detailModal />
    <ChcGrid>
      <template #action="scope">
        <Button
          type="primary"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope.row)"
          :data-testid="`button_detail_${scope.rowIndex}`"
        >
          授权书详情
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
