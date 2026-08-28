<script lang="ts" setup>
import type { childrenRow } from './type';

import { onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import PreviewImageCom from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue';

import ReviewRecordCom from './modal/reviewRecord.vue';

const parentTableParams = ref<{ [key: string]: any }>({
  contractId: undefined,
});
const formSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const formReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};
// 子表
const [
  ChildGrid,
  childGridApi,
  {
    PreviewPictureModal,
    PreviewPictureModalApi,
    ReviewRecordModal,
    ReviewRecordModalApi,
    handleExport: handleChildExport,
  },
] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [
        // ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
      ],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productCode',
        title: '品种编码',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productName',
        title: '品种名称',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'certNo',
        title: '证照号码',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturerName',
        title: '生产企业',
        minWidth: '180',
        sortable: true,
      },
    ],
    id: 'contractQuery_child',
    queryUrl: '/contractAction/queryContractProduct.do',
    beforeFetchFn: (params) => {
      console.warn('childGridApi', params);
      return {
        ...params,
        ...parentTableParams.value,
        contractId: parentTableParams.value.contractId || 0,
        limit: 0,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'PreviewPictureModal-PreviewPictureModalApi': {
        // 连接抽离的组件
        connectedComponent: PreviewImageCom,
      },
      'ReviewRecordModal-ReviewRecordModalApi': {
        // 连接抽离的组件
        connectedComponent: ReviewRecordCom,
      },
    },
  },
);
// 父表
const [ChcGrid, chcGridApi, { handleExport: handleParentExport }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: formSubmit,
      handleReset: formReset,
      showCollapseButton: false,
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'contractQuery_parent',
    queryUrl: '/contractAction/queryContract.do',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'contractNo',
        title: '合同号',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'beginDate',
        title: '开始日期',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'endDate',
        title: '结束日期',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'scope',
        title: '产品范围',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '100',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 160,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=192',
            placeholder: '请选择供应商',
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
        fieldName: 'vendorId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'contractNo',
        componentProps: {
          placeholder: '请输入合同号',
        },
        label: '合同号',
      },
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '有效日期',
        defaultValue: [],
        // defaultValue: [
        //   dayjs(dayjs().format('YYYY-MM-DD'))
        //     // .subtract(2, 'year')
        //     .subtract(2, 'week')
        //     .subtract(1, 'day')
        //     .format('YYYY-MM-DD'),
        // ],
        formItemClass: 'col-span-1',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        console.warn('radioChange:', row);
        if (row && row.contractId) {
          parentTableParams.value.contractId = row.contractId;
          childGridApi.reload({ contractId: row.contractId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.contractId = undefined;
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 查看图片
const handlePreview = (row: childrenRow) => {
  console.warn('handlePreview:', row);
  PreviewPictureModalApi?.setData({
    imageList: row.filePaths,
  }).open();
};

// 查看审查记录
const handleReviewRecord = (row: any) => {
  console.warn('handleReviewRecord:', row);
  ReviewRecordModalApi?.setData({
    searchId: row.contractId,
  }).open();
};

onMounted(() => {
  formSubmit();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <PreviewPictureModal />
          <ReviewRecordModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleParentExport"
                data-testid="button_export"
              >
                导出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handlePreview(scope.row)"
                data-testid="button_preview"
              >
                查看图片
              </Button>
              <Button
                type="primary"
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleReviewRecord(scope.row)"
                data-testid="button_review_record"
              >
                审查记录
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <template #toolbar-actions>
              <span class="title mr-[6px]">关联品种</span>
              <Button
                type="primary"
                @click="handleChildExport"
                data-testid="button_export_child"
              >
                导出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </template>
          </ChildGrid>
        </template>
      </PageSplitLazy>
    </div>
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

.title {
  position: relative;
  padding: 0 15px;
  color: #009688;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 25px;
    content: '';
    border: none;
    border-bottom: 2px solid #5fb878;
    border-radius: 0;
  }
}
</style>
