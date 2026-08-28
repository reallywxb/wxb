<script lang="ts" setup>
import { ref } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { requestClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

// 主表选中行数据
const mainTableCheckedRow = ref<Record<string, any>>({});

const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: { content: '查询' },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      rowClassName: ({ row }: any) =>
        row.status === '未上传' ? 'bg-[rgba(228,149,149,1)]' : '',
      checkboxConfig: { highlight: true },
      radioConfig: { trigger: 'row', highlight: true },
      stripe: false,
      pagerConfig: { enabled: true },
    }),
  },
  {
    id: 'dispenseUpload',
    queryUrl: '/asnAction/tracCode/distributeList',
    showRadioRowTag: true,
    showCustomBtn: true,
    showZoomBtn: true,
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'distributeDate',
        label: '发药时间',
        componentProps: () => ({ valueFormat: 'YYYY-MM-DD' }),
      },
      {
        component: 'Input',
        fieldName: 'documentNo',
        label: '处方号',
        componentProps: () => ({
          placeholder: '请输入处方号',
          // style: { width: '180px' },
        }),
      },
      {
        component: 'ChcSelect',
        fieldName: 'status',
        label: '状态',
        componentProps: () => ({
          // style: { width: '120px' },
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          options: [
            { value: '', label: '全部' },
            { value: '1', label: '已上传' },
            { value: '0', label: '未上传' },
          ],
        }),
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
        formatter: (scope: any) => scope.rowIndex + 1,
      },
      { field: 'tracCode', title: '追溯码', width: 180 },
      {
        field: 'isNeedPush',
        title: '状态',
        width: 120,
        formatter: ({ cellValue }: { cellValue: string }) => {
          return cellValue === '1' ? '已上传' : '未上传';
        },
      },
      { field: 'productName', title: '药品名称', width: 160 },
      { field: 'productSpec', title: '规格', width: 120 },
      { field: 'lot', title: '批号', width: 120 },
      { field: 'guaranteeDate', title: '有效期至', width: 120 },
      { field: 'uomName', title: '单位', width: 100 },
      { field: 'patientName', title: '姓名', width: 120 },
      { field: 'patientCode', title: '就诊号', width: 120 },
      { field: 'prescriptionNo', title: '处方号', width: 120 },
      { field: 'pickUpName', title: '发药人', width: 120 },
      { field: 'dispenseTime', title: '发药时间', width: 180 },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row) {
          await chcGridApi.grid.clearCheckboxRow();
          await chcGridApi.grid.setCheckboxRow(row, true);
          mainTableCheckedRow.value = row;
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
          await chcGridApi.grid.setCheckboxRow(row, true);
          mainTableCheckedRow.value = row;
        } else {
          const checkedRows = chcGridApi.grid.getCheckboxRecords(true);
          mainTableCheckedRow.value =
            checkedRows.length === 0 ? {} : checkedRows[0];
        }
      },
      checkboxAll: async ({ checked }: { checked: boolean }) => {
        if (checked) {
          const records = chcGridApi.grid.getFullData();
          if (records.length > 0) {
            mainTableCheckedRow.value = records[0];
          }
        } else {
          mainTableCheckedRow.value = {};
        }
      },
    },
  },
);

// const handleSearch = async () => {
//   const formValues = await chcGridApi.formApi.getValues();
//   await chcGridApi.query(formValues);
// };

const handleUpload = () => {
  const checkedRows: any[] = chcGridApi.grid.getCheckboxRecords(true);
  if (checkedRows.length === 0) {
    message.warning('请选择要上传追溯码的记录');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认上传追溯码？共 ${checkedRows.length} 条记录`,
    onOk: async () => {
      try {
        const ids = checkedRows.map((r) => r.pmsPreScriptionLineTcId);
        await requestClient.post('/asnAction/tracCode/distribute/upload', ids);
        message.success('上传成功！');
        chcGridApi.query();
      } catch (error) {
        console.error('上传失败:', error);
        message.error('上传失败，请重试！');
      }
    },
  });
};

// onMounted(async () => {
//   await handleSearch();
// });
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleUpload"
          class="mr-[0.5rem]"
          data-testid="button_upload_uploadQuery_dispenseUpload"
        >
          上传
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_uploadQuery_dispenseUpload"
        >
          <template #icon>
            <ExportActionIcon />
          </template>
          导出
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
