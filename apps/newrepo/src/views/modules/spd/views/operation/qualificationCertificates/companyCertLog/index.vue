<script lang="ts" setup>
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
    id: 'companyCertLog',
    // api地址
    dataTableId:
      "/productCertAction/querySyncApply.do?page=CompanyCert&status='NO','PS'",
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
        field: 'bpartnerName',
        title: '供应商',
        width: '100',
        sortable: true,
      },
      {
        field: 'companyName',
        title: '企业',
        width: '100',
        sortable: false,
      },
      {
        field: 'companyType',
        title: '企业类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'isVendor',
        title: '是否供应商',
        width: '80',
        sortable: false,
        formatter: ({ row }) => {
          const isVendorMap: Record<string, string> = {
            Y: '是',
            N: '否',
          };
          return isVendorMap[row.isVendor] || '';
        },
      },
      {
        field: 'certType',
        title: '证照类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'certNo',
        title: '证照号码',
        width: '100',
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
        field: 'statusName',
        title: '状态',
        width: '80',
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
        width: 100,
        slots: { default: 'action' },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'companyName',
        label: '企业',
        componentProps: () => {
          return {
            placeholder: '请输入企业名称',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'certNo',
        label: '证照号码',
        componentProps: () => {
          return {
            placeholder: '请输入证照号码',
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000508',
            placeholder: '请选择证照类型',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'certType',
        label: '证照类型',
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
      return {
        ...params,
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
          证照详情
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
