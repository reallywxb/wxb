<script lang="ts" setup>
import type { ApplyOrRejectType, ManufRowType } from './api';

import { h, onMounted, ref, toRaw } from 'vue';

import { SvgCloseIcon, SvgSquareTickIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { applyOrReject } from './api';
import detail from './modal/detail.vue';

const extParams = ref<{
  page?: string;
  status?: string;
}>({
  page: 'CompanyCert',
  status: 'WA',
});
const selectCheckedRows = ref<ManufRowType[]>([]);
const [detailModal, detailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: detail,
  draggable: true,
});
const formSubmit = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query(formValues);
};
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: formSubmit,
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
    id: 'companyCertPreCheck',
    // api地址
    dataTableId: `/productCertAction/querySyncApply.do?page=${extParams.value.page}&status=${extParams.value.status}`,
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
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'companyName',
        title: '企业',
        minWidth: '120',
        sortable: false,
      },
      {
        field: 'companyType',
        title: '企业类型',
        width: '120',
        sortable: false,
      },
      {
        field: 'isVendor',
        title: '是否供应商',
        width: '100',
        sortable: false,
        formatter: ({ row }) => {
          return row.isVendor === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'certType',
        title: '证照类型',
        width: '110',
        sortable: false,
      },
      {
        field: 'certNo',
        title: '证照号码',
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
        field: 'certDate',
        title: '开始时间',
        width: '130',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '有效期至',
        width: '130',
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
        field: 'syncTime',
        title: '同步时间',
        width: '130',
        sortable: true,
      },
      {
        field: 'versionNo',
        title: '版本号',
        width: '80',
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
            placeholder: '企业',
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
            placeholder: '证照号码',
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000508',
            placeholder: '请选择证照类型',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
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
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '请选择供应商',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
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
      // radioChange: ({ row }: any) => {
      //   if (row) {
      //     chcGridApi.grid.clearCheckboxRow();
      //     chcGridApi.grid.setCheckboxRow(row, true);
      //   }
      // },
    },
    // tableSearchExtraParams: extParams.value,
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
        ChcGridApi.query();
      },
    })
    .open();
};

// 审核通过处理函数
const handleApproval = () => {
  console.warn('handleApproval', selectCheckedRows.value);
  // 先检查是否有选中的行数据
  // const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectCheckedRows.value.length === 0) {
    message.warning('请选择申请！');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认通过勾选的 ${selectCheckedRows.value.length} 条数据？`,
    onOk: async () => {
      try {
        const ids: ApplyOrRejectType[] = [];
        selectCheckedRows.value.forEach((row: ManufRowType) => {
          ids.push({
            applySyncId: row.applyId,
            status: row.status === 'WA' ? 'WC' : 'PS',
            checkRemark: '',
          });
        });
        const params = {
          ids: JSON.stringify(ids),
        };
        console.warn('params===>', params);
        await applyOrReject(params)
          .then((res) => {
            if (res && res.success) {
              // 刷新表格数据
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('操作成功');
            } else {
              message.error(res.msg || '操作失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
        ChcGridApi.query();
      } catch {
        message.error('确认失败');
      }
    },
  });
};

// 拒绝处理函数
const handleReject = () => {
  // 先检查是否有选中的行数据
  // const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectCheckedRows.value.length === 0) {
    message.warning('请选择申请！');
    return;
  }
  Modal.confirm({
    title: '请输入驳回原因',
    content: h('textarea', {
      id: 'reject-reason',
      placeholder: '',
      rows: 4,
      style: {
        width: '100%',
        padding: '6px 10px',
        border: '1px solid #e6e6e6',
        color: '#333',
        outline: 'none',
      },
      'data-testid': 'textarea_rejectReason',
    }),
    onOk: async () => {
      const rejectReason = (
        document.querySelector('#reject-reason') as HTMLTextAreaElement
      )?.value;
      try {
        const ids = selectCheckedRows.value.map((row: ManufRowType) => ({
          applySyncId: row.applyId,
          status: 'NO',
          checkRemark: rejectReason,
        }));
        console.warn('ids', ids);
        const params = {
          ids: JSON.stringify(ids),
        };
        const res = await applyOrReject(params);
        if (res && res.success) {
          message.success('成功驳回！');
          // 刷新表格数据
          ChcGridApi.formApi.getValues().then((resData: any) => {
            ChcGridApi.query({ ...resData });
          });
        } else {
          message.error(res.msg || '操作失败');
        }
      } catch {
        message.error('作废失败');
      }
    },
  });
};

onMounted(() => {
  console.warn('onMounted');
  formSubmit();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <detailModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleApproval"
          class="mr-[0.5rem]"
          data-testid="button_pass"
        >
          通过
          <template #icon>
            <SvgSquareTickIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleReject"
          class="mr-[0.5rem]"
          data-testid="button_reject"
        >
          拒绝
          <template #icon>
            <SvgCloseIcon />
          </template>
        </Button>
      </template>
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
