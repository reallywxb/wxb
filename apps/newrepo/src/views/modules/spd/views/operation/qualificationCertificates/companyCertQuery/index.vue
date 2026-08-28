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
  companyId: undefined,
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
        field: 'companyName',
        title: '企业名称',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'certTypeName',
        title: '证照类型',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'certNo',
        title: '证照号码',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'certDate',
        title: '发证日期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '有效日期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'principal',
        title: '委托人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'principalMobile',
        title: '委托人手机',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'scope',
        title: '范围',
        minWidth: '130',
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
    id: 'companyCertQuery_child',
    queryUrl: '/companyAction/queryCert.do',
    beforeFetchFn: (params) => {
      console.warn('childGridApi', params);
      return {
        ...params,
        ...parentTableParams.value,
        companyId: parentTableParams.value.companyId || 0,
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
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: formSubmit,
      handleReset: formReset,
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
    id: 'companyCertQuery_parent',
    queryUrl: '/companyAction/queryCompany.do',
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
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'bpartnerCode',
        title: '供应商编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'toAuthorizeCompanyName',
        title: '被授权企业',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'name',
        title: '企业名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'typeName',
        title: '企业类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'locationOfCountryName',
        title: '国别',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'isVendorCompany',
        title: '是否供应商',
        minWidth: '100',
        sortable: false,
        formatter({ row }) {
          return row.isVendorCompany === 'Y' ? '是' : '否';
        },
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'bpartnerName',
        componentProps: {
          placeholder: '请输入供应商',
        },
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'bpartnerCode',
        componentProps: {
          placeholder: '请输入供应商编码',
        },
        label: '供应商编码',
        labelClass: 'w-[100px]',
      },
      {
        component: 'Input',
        fieldName: 'name',
        componentProps: {
          placeholder: '请输入企业名称',
        },
        label: '企业名称',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              {
                label: '是',
                value: 'Y',
              },
              {
                label: '否',
                value: 'N',
              },
            ],
            placeholder: '请选择是否供应商',
            paginate: false,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'isVendorCompany',
        label: '是否供应商',
        labelClass: 'w-[100px]',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        console.warn('radioChange:', row);
        if (row && row.companyId) {
          parentTableParams.value.companyId = row.companyId;
          childGridApi.reload({ companyId: row.companyId });
          // await chcGridApi.grid.clearCheckboxRow();
          // chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.companyId = undefined;
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
    searchId: row.companyCertId,
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
          <ChcGrid class="flex-1 overflow-hidden" />
        </template>
        <template #second>
          <PreviewPictureModal />
          <ReviewRecordModal />
          <ChildGrid>
            <template #toolbar-actions>
              <span class="title mr-[6px]">企业证照</span>
              <Button
                type="primary"
                @click="handleChildExport"
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
                :data-testid="`button_preview_${scope.rowIndex}`"
              >
                查看图片
              </Button>
              <Button
                type="primary"
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleReviewRecord(scope.row)"
                :data-testid="`button_ReviewRecord_${scope.rowIndex}`"
              >
                审查记录
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
