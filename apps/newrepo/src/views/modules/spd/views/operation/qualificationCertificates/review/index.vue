<script setup lang="ts">
import type { CommonType, tableRowType } from './api';

import { h, onMounted } from 'vue';

import {
  ExportActionIcon,
  SvgCloseIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import { applySyncCheck, rejectSyncCheck } from './api';
import CertificatesDetail from './components/certificatesDetailModal.vue';

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  // await nextTick();
  ChcGridApi.query();
  // isFirstLoaded.value = true;
});

const [CertificatesDetailModal, CertificatesDetailModalApi] = useVbenModal({
  closable: true,
  // 连接抽离的组件
  connectedComponent: CertificatesDetail,
  draggable: true,
});

// const checkedRow = ref<Record<string, any>>({});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
      stripe: false,
    }),
  },
  {
    id: 'review',
    queryUrl: 'productCertAction/querySyncApply.do?page=Product&status=WC',
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productName',
        title: '产品名',
        minWidth: 150,
        sortable: false,
      },
      {
        field: 'certType',
        title: '证照类型',
        minWidth: '110',
        sortable: false,
      },
      {
        field: 'certNo',
        title: '证照号',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'certDate',
        title: '开始时间',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '有效期至',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'validityType',
        title: '是否长期',
        minWidth: '70',
        sortable: false,
        formatter({ row }) {
          const validityTypeMap: Record<string, string> = {
            R: '否',
            L: '是',
          };
          return validityTypeMap[row.validityType] || '';
        },
      },
      {
        field: 'productType',
        title: '产品类型',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'manufacturerName',
        title: '生产企业',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '120',
        sortable: false,
      },
      {
        field: 'statusName',
        title: '状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'syncTime',
        title: '同步时间',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'versionNo',
        title: '版本号',
        minWidth: '80',
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
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '产品名称',
        componentProps: {
          placeholder: '请输入产品名称',
        },
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
            placeholder: '',
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
        component: 'Input',
        fieldName: 'manufacturerName',
        labelClass: 'w-[90px]',
        label: '生产企业名称',
        componentProps: {
          placeholder: '请输入生产企业名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=192',
            placeholder: '',
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
    ],
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: {},
    gridEvents: {
      // radioChange: (p: any) => {
      //   console.warn('radioChange', p);
      //   checkedRow.value = {};
      //   checkedRow.value = toRaw(p.row);
      // },
      checkboxChange: ({ records }: { records: any[] }) => {
        console.warn('checkboxChange:', records);
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'DescriptionModal-descriptionModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: DescriptionModalComp,
      // },
    },
  },
);

// 审核通过处理函数
const handleApproval = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择申请！');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认通过勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const ids: CommonType[] = [];
        selectedRows.forEach((row: tableRowType) => {
          ids.push({
            applySyncId: row.applyId,
            status: row.status === 'WA' ? 'WC' : 'PS',
            checkRemark: '',
          });
        });
        const data = {
          ids: JSON.stringify(ids),
        };
        console.warn('data', data);
        await applySyncCheck(data)
          .then((res) => {
            if (res && res.success) {
              // 刷新表格数据
              ChcGridApi.query();
              message.success('操作成功');
            } else {
              message.error(res.msg || '操作失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('确认失败');
      }
    },
  });
};

// 拒绝处理函数
const handleReject = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择申请！');
    return;
  }
  // 重置驳回原因，以防上次输入残留
  // rejectReason.value = '';
  // 有选中数据才弹出确认框

  Modal.confirm({
    title: '请输入驳回原因',
    content: h('textarea', {
      // value: rejectReason.value,
      // 'onUpdate:value': (val: string) => {
      //   console.warn('onUpdate:value', val);
      //   rejectReason.value = val;
      // },
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
        const ids = selectedRows.map((row: tableRowType) => ({
          applySyncId: row.applyId,
          status: 'NO',
          checkRemark: rejectReason,
        }));
        console.warn('ids', ids);
        const params = {
          ids: JSON.stringify(ids),
        };
        const res = await rejectSyncCheck(params);
        if (res && res.success) {
          message.success('成功驳回！');
          // 刷新表格数据
          ChcGridApi.query();
        } else {
          message.error(res.msg || '操作失败');
        }
      } catch {
        message.error('作废失败');
      }
    },
  });
};

// 证照查看
const handleDetail = (row: any) => {
  CertificatesDetailModalApi?.setData({
    // record: row,
    row,
    callback() {
      // 刷新表格数据
      ChcGridApi.query();
      // message.success('变更成功！');
    },
  }).open();
};

onMounted(() => {
  console.warn('urlParams');
  // 触发自动查询
  searchController.sign();
});
</script>
<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[transparent] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <CertificatesDetailModal />
    <ChcGrid class="h-[calc(100%-40px)]">
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
      <template #action="scope">
        <Button
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click.stop="handleDetail(scope.row)"
          :data-testid="`button_detail_${scope.rowIndex}`"
        >
          证照详情
        </Button>
      </template>
    </ChcGrid>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleApproval"
            class="mr-[0.5rem]"
            data-testid="button_approval"
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
        </div>
      </div>
    </template>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
