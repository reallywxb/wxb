<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';

import { requestClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

// AI-GENERATED-BEGIN
// @date 2026-06-24
// @prompt 采购仓库自动查询时没有把值带到接口入参里
// @description 使用 LazySearch 延迟查询，等待表单字段初始化完成后再执行查询（等待3个immediate字段）
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  setTimeout(async () => {
    const formValues = await chcGridApi.formApi?.getValues();
    // console.log(222222222222, formValues);
    chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
    chcGridApi.reload(formValues);
    isFirstLoaded.value = true;
  }, 200);
});
// AI-GENERATED-END

const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      showCollapseButton: true,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      rowClassName: ({ row }: any) => {
        return row.uploadFlag === '0' ? 'bg-[rgba(228,149,149,1)]' : '';
      },
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'uploadQuery',
    queryUrl: '/asnAction/tracCode/purchaseList.do',
    showRadioRowTag: true,
    showCustomBtn: true,
    showZoomBtn: true,
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'asnDate',
        label: '配送时间',
        componentProps: () => {
          return {
            valueFormat: 'YYYY-MM-DD',
          };
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'storyDate',
        label: '入库时间',
        componentProps: () => {
          return {
            valueFormat: 'YYYY-MM-DD',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'purchaseWarehouse',
        label: '采购仓库',
        componentProps: () => {
          return {
            // style: { width: '120px' },
            placeholder: '请选择',
            options: [],
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length) {
                chcGridApi.formApi?.setFieldValue(
                  'purchaseWarehouse',
                  res.rows[0].id,
                );
              }
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'demandWarehouse',
        label: '需求仓库',
        defaultValue: '',
        componentProps: () => {
          return {
            // style: { width: '120px' },
            placeholder: '请选择',
            options: [],
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'documentNo',
        label: '出入库单号',
        componentProps: () => {
          return {
            placeholder: '请输入',
            // style: { width: '180px' },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            // style: { width: '120px' },
            placeholder: '请选择',
            options: [],
            dictUrl: '/baseHandleAction/vendor.do',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'checkbox',
        title: '多选',
        width: 50,
        align: 'center',
      },
      {
        title: '序号',
        type: 'seq',
        field: 'index',
        width: 60,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'uploadStatus',
        title: '上传情况',
        width: 100,
      },
      {
        field: 'warehouseOrderNo',
        title: '入库单号',
        width: 140,
      },
      {
        field: 'deliveryOrderNo',
        title: '配送单号',
        width: 140,
      },
      {
        field: 'vendor',
        title: '供应商',
        width: 120,
      },
      {
        field: 'purchaseWarehouse',
        title: '采购仓库',
        width: 120,
      },
      {
        field: 'demandWarehouse',
        title: '需求仓库',
        width: 120,
      },
      {
        field: 'warehouseType',
        title: '入库类型',
        width: 100,
      },
      {
        field: 'processStatus',
        title: '处理状态',
        width: 100,
      },
      {
        field: 'deliverer',
        title: '配送人',
        width: 100,
      },
      {
        field: 'deliveryTime',
        title: '配送时间',
        width: 150,
      },
      {
        field: 'deliveryQty',
        title: '配送数量',
        width: 100,
        align: 'right',
      },
      {
        field: 'deliveryAmount',
        title: '配送金额',
        width: 120,
        align: 'right',
      },
      {
        field: 'qualifiedQty',
        title: '验收合格数量',
        width: 120,
        align: 'right',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row) {
          // 清除之前的多选记录
          await chcGridApi.grid.clearCheckboxRow();
          // 设置当前行为单选记录
          await chcGridApi.grid.setCheckboxRow(row, true);
          // 更新主表选中行
          mainTableCheckedRow.value = row;
          // 刷新子表数据
          await sonGridApi.query({ asnId: row.deliveryOrderNo });
        }
      },
      checkboxChange: async ({
        row,
        checked,
      }: {
        checked: boolean;
        row: any;
      }) => {
        if (checked) {
          // 设置当前行为选中状态
          await chcGridApi.grid.setCheckboxRow(row, true);
          // 更新主表选中行
          mainTableCheckedRow.value = row;
          // 刷新子表数据
          await sonGridApi.query({ asnId: row.deliveryOrderNo });
        } else {
          // 取消选中
          const checkedRows = chcGridApi.grid.getCheckboxRecords(true);
          if (checkedRows.length === 0) {
            // 如果没有选中行，清空子表
            mainTableCheckedRow.value = {};
            await sonGridApi.grid.clearData();
          } else {
            // 更新为第一个选中行
            mainTableCheckedRow.value = checkedRows[0];
            await sonGridApi.query({ asnId: checkedRows[0].deliveryOrderNo });
          }
        }
      },
      checkboxAll: async ({ checked }: { checked: boolean }) => {
        if (checked) {
          // 获取所有记录
          const records = chcGridApi.grid.getFullData();
          if (records.length > 0) {
            // 设置第一个记录为选中行
            mainTableCheckedRow.value = records[0];
            await sonGridApi.query({ asnId: records[0].deliveryOrderNo });
          }
        } else {
          // 清空子表
          mainTableCheckedRow.value = {};
          await sonGridApi.grid.clearData();
        }
      },
    },
    afterFetchFn: (res: any) => {
      sonGridApi.grid.reloadData([]);
      return { ...res, records: res.rows };
    },
  },
);

const handleSearch = async () => {
  // const formValues = await chcGridApi.formApi.getValues();
  // await chcGridApi.query(formValues);
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.reload(formValues);
};

// 主表选中行数据
const mainTableCheckedRow = ref<Record<string, any>>({});

// 子表配置
const [SonChcGrid, sonGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      wrapperClass: 'grid-cols-3',
      handleSubmit: async () => {
        const formValues = await sonGridApi.formApi.getValues();
        sonGridApi.query(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      fit: true,
      rowClassName: ({ row }: any) => {
        return row.status === '1' ? '' : 'bg-[rgba(228,149,149,1)]';
      },
      showOverflow: 'tooltip',
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'uploadQuerySon',
    queryUrl: '/asnAction/tracCode/purchaseDetail',
    showCustomBtn: true,
    showZoomBtn: true,
    formSchema: [
      // 子表查询条件可以根据需要添加
    ],
    gridColumns: [
      {
        title: '序号',
        type: 'seq',
        field: 'index',
        width: 60,
        align: 'center',
        fixed: 'left',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        align: 'center',
        field: 'traceCode',
        title: '追溯码',
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'status',
        align: 'center',
        title: '状态',
        sortable: true,
        formatter: ({ cellValue }: { cellValue: string }) => {
          return cellValue === '1' ? '已上传' : '未上传';
        },
        minWidth: 150,
      },
    ],
    beforeFetchFn: (params: any) => {
      return { ...params, asnId: mainTableCheckedRow.value.deliveryOrderNo };
    },
  },
);

// 页面加载时自动查询 - 由 LazySearch 等待3个immediate字段初始化完成后自动触发
onMounted(async () => {
  // 采购仓库、需求仓库、供应商三个字段都配置了 immediate: true
  // LazySearch 会在它们都完成 afterFetch 后自动执行查询
});

// 处理上传追溯码
const handleUpload = () => {
  const checkedRows: any[] = chcGridApi.grid.getCheckboxRecords(true);
  if (checkedRows.length === 0) {
    message.warning('请选择要上传追溯码的记录');
    return;
  }

  // 确认弹窗
  Modal.confirm({
    title: '提示',
    content: '确认上传追溯码?',
    onOk: async () => {
      try {
        const orderIds = checkedRows.map((row) => row.deliveryOrderNo);
        // const params = { orderIds: orderIds.join(',') };
        await requestClient.post('/asnAction/tracCode/upload', orderIds);

        message.success('上传成功！');
        // 刷新表格数据
        chcGridApi.query();
      } catch (error) {
        console.error('上传失败:', error);
        message.error('上传失败，请重试！');
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleUpload"
              class="mr-[0.5rem]"
              data-testid="button_upload_uploadQuery"
            >
              上传
            </Button>
            <Button
              type="primary"
              @click="handleExport"
              class="mr-[0.5rem]"
              data-testid="button_export_uploadQuery"
            >
              <template #icon>
                <ExportActionIcon />
              </template>
              导出
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <SonChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
