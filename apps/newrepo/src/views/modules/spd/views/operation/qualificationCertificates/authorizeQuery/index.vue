<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import PreviewImageCom from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue';

import ReviewRecordCom from './modal/reviewRecord.vue';

const parentTableParams = ref<{ [key: string]: any }>({
  authorizeId: undefined,
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
const [ChildGrid, childGridApi, { handleExport: handleChildExport }] =
  useSpdGrid(
    {
      formOptions: {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
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
          field: 'authorizeCompanyName',
          title: '授权企业',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'toAuthorizeCompanyName',
          title: '被授权企业',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'certDate',
          title: '开始日期',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'certValidTo',
          title: '结束日期',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'scope',
          title: '范围',
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
          width: 100,
        },
      ],
      id: 'authorizeQuery_child',
      queryUrl: '/authorizeLineAction/queryLinkAuthorizeLine.do',
      beforeFetchFn: (params) => {
        return {
          ...params,
          ...parentTableParams.value,
          authorizeId: parentTableParams.value.authorizeId || 0,
          limit: 0,
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
// 父表
const [
  ChcGrid,
  chcGridApi,
  {
    PreviewPictureModal,
    PreviewPictureModalApi,
    ReviewRecordModal,
    ReviewRecordModalApi,
    handleExport: handleParentExport,
  },
] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [
        ['date', ['certValidFrom', 'certValidTo'], 'YYYY-MM-DD'],
      ],
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
    id: 'authorizeQuery_parent',
    queryUrl: '/authorizeAction/queryAuthorize.do',
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
        field: 'manufacturerName',
        title: '生产企业',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'authorizeCompanyName',
        title: '授权企业',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'toAuthorizeCompanyName',
        title: '被授权企业',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'certDate',
        title: '开始日期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '结束日期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'scope',
        title: '范围',
        minWidth: '150',
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
        width: '160',
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
        fieldName: 'manufacturerName',
        componentProps: {
          placeholder: '请输入生产企业',
        },
        label: '生产企业',
      },
      {
        component: 'Input',
        fieldName: 'authorizeCompanyName',
        componentProps: {
          placeholder: '请输入授权企业',
        },
        label: '授权企业',
      },
      {
        component: 'Input',
        fieldName: 'toAuthorizeCompanyName',
        componentProps: {
          placeholder: '请输入被授权企业',
        },
        label: '被授权企业',
        labelClass: 'w-[90px]',
      },
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '有效日期',
        defaultValue: [],
        // defaultValue: [
        //   dayjs(dayjs().format('YYYY-MM-DD'))
        //     // .subtract(2, 'year')
        //     // .subtract(1, 'week')
        //     // .subtract(1, 'day')
        //     .format('YYYY-MM-DD'),
        // ],
        formItemClass: 'col-span-1',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        console.warn('radioChange:', row);
        if (row && row.authorizeId) {
          parentTableParams.value.authorizeId = row.authorizeId;
          childGridApi.reload({ authorizeId: row.authorizeId });
          // await chcGridApi.grid.clearCheckboxRow();
          // chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.authorizeId = undefined;
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

// 查看图片
const handlePreview = (row: any) => {
  console.warn('handlePreview:', row);
  PreviewPictureModalApi?.setData({
    imageList: row.filePaths,
  }).open();
};

// 查看审查记录
const handleReviewRecord = (row: any) => {
  console.warn('handleReviewRecord:', row);
  ReviewRecordModalApi?.setData({
    searchId: row.authorizeId,
  }).open();
};

onMounted(() => {
  formSubmit();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PreviewPictureModal />
      <ReviewRecordModal />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleParentExport"
                data-testid="button_export_index"
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
                @click.stop="handlePreview(scope.row)"
                :data-testid="`button_preview_${scope.rowIndex}_index`"
              >
                查看图片
              </Button>
              <Button
                type="primary"
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click.stop="handleReviewRecord(scope.row)"
                :data-testid="`button_review_record_${scope.rowIndex}_index`"
              >
                审查记录
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <template #toolbar-actions>
              <span class="title mr-[6px]">逐级授权书</span>
              <Button
                type="primary"
                @click="handleChildExport"
                data-testid="button_export_child_index"
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
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handlePreview(scope.row)"
                :data-testid="`button_preview_child_${scope.rowIndex}_index`"
              >
                查看图片
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
