<script setup lang="ts">
import type { GridColumn } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';

import { onMounted, toRaw } from 'vue';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import licenseDetailModalUI from './licenseDetail.vue';

// const extParams = ref<{
//   approvalStatus?: string;
//   commitStatus?: string;
//   isGift?: string;
// }>({
//   commitStatus: "'CO'",
//   approvalStatus: "'WA'",
//   isGift: 'N',
// });

// 表单配置项
const formSchema: VbenFormProps['schema'] = [
  {
    component: 'DateGroup',
    fieldName: 'dateOrdered',
    label: '审核时间',
    defaultValue: [
      dayjs(dayjs().format('YYYY-MM-DD'))
        .subtract(7, 'day')
        .format('YYYY-MM-DD'),
    ],
    formItemClass: 'col-span-1',
  },
  {
    component: 'Input',
    fieldName: 'certNo',
    label: '证照号码',
    componentProps: {
      placeholder: '请输入证照号码',
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/refList.do?id=1000477',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择证照类型',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        defaultValue: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'certType',
    label: '证照类型',
  },
  {
    component: 'Input',
    fieldName: 'manufacturerName',
    label: '生产企业名称',
    labelClass: 'w-[100px]',
    componentProps: {
      placeholder: '请输入生产企业名称',
    },
  },
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
        dictUrl: '/baseHandleAction/refList.do?id=192',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择供应商',
        paginate: false,
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
    component: 'ChcSelect',
    componentProps: () => {
      return {
        defaultValue: '',
        placeholder: '',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
        options: [
          { value: '', label: '全部' },
          { value: 'PS', label: '已通过' },
          { value: 'NO', label: '已驳回' },
        ],
      };
    },
    fieldName: 'queryStatus',
    label: '状态',
  },
];

// 表格配置项目
const gridColumns: GridColumn[] = [
  { type: 'checkbox', title: '多选', width: 50, align: 'center' },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productName',
    minWidth: 150,
    sortable: true,
    title: '产品名',
  },
  {
    field: 'certType',
    minWidth: 110,
    sortable: true,
    title: '证照类型',
  },
  {
    field: 'certNo',
    minWidth: 100,
    sortable: false,
    title: '证照号',
  },
  {
    field: 'certDate',
    minWidth: 110,
    sortable: true,
    title: '开始时间',
  },
  {
    field: 'certValidTo',
    minWidth: 110,
    sortable: true,
    title: '有效期至',
  },
  {
    field: 'productType',
    minWidth: 100,
    sortable: false,
    title: '产品类型',
  },
  {
    field: 'manufacturerName',
    minWidth: 90,
    sortable: true,
    title: '生产企业',
  },
  {
    field: 'bpartnerName',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'description',
    minWidth: 120,
    sortable: false,
    title: '备注',
  },
  {
    field: 'statusName',
    minWidth: 70,
    sortable: true,
    title: '状态',
  },
  {
    field: 'checkTime',
    minWidth: 150,
    sortable: true,
    title: '审核时间',
  },
  {
    field: 'rejectReason',
    minWidth: 150,
    sortable: true,
    title: '驳回原因',
  },
  {
    field: 'rejectReasonDetail',
    minWidth: 150,
    sortable: true,
    title: '驳回明细',
    visible: false,
  },
  {
    field: 'syncTime',
    minWidth: 150,
    sortable: true,
    title: '同步时间',
  },
  {
    field: 'versionNo',
    minWidth: 80,
    sortable: true,
    title: '版本号',
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: $t('system.menu.operation'),
    width: 120,
  },
];

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['checkTimeFrom', 'checkTimeTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      // commonConfig: {
      //   labelClass: 'w-[90px]',
      // },
      handleSubmit: async (values: VbenFormProps) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      // radioConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      // pagerConfig: {
      //   enabled: true,
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema,
    gridColumns,
    id: 'reviewRecordGrid',
    dataTableId: `/productCertAction/querySyncApply.do?page=Product&status='NO','PS'`,
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [licenseDetailModal, modalApi] = useVbenModal({
  // class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: licenseDetailModalUI,
  draggable: true,
});

// 查看某行的证照详情
const handleView = (row: VbenFormProps) => {
  modalApi
    .setData({
      openType: 'add',
      tableRow: {
        ...row,
      },
    })
    .open();
};

onMounted(() => {
  console.warn('urlParams');
});
</script>
<template>
  <Page content-class="p-[0.75rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <!-- 操作 -->
      <template #action="scope">
        <!-- style="background-color: #009688" -->
        <Button
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleView(scope.row)"
          data-testid="button_view"
        >
          证照详情
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ChcGrid>
    <licenseDetailModal />
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
