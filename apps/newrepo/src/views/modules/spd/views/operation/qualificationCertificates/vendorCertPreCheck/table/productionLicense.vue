<script setup lang="ts">
import type { Ref } from 'vue';

import type { CompanyCertRowType, ParentTableType } from '../type';

import { h, inject, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  IconfontBasicView,
  SearchActionIcon,
  SvgCloseIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Input, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import productionDetail from '../modal/productionDetail.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

// 表格查询字符串参数
const tableSearchExtraParams = reactive<{
  companyType?: string;
  isVendor?: string;
  page?: string;
  status?: string;
}>({
  page: 'CompanyCert',
  status: urlParams.status || 'WC',
  isVendor: 'N',
  companyType: 'M',
});

const certNo = ref(''); // 证照号码
const selectedParentRow = inject<Ref<ParentTableType>>('currentReport'); // 当前选中的父行数据
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   if (row.neerGuaranteeDate === 'Y') {
      //     return { color: 'red' };
      //   }
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: CompanyCertRowType[] }) => {
        console.warn('checkboxChange:', records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records, checked }: any) => {
        console.warn('checkboxAll:', checked, records);
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
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
        sortable: true,
      },
      {
        field: 'companyType',
        title: '企业类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'isVendor',
        title: '是否供应商',
        width: '70',
        sortable: false,
        formatter: ({ row }: any) => {
          const validityTypeMap: Record<string, string> = {
            N: '否',
            Y: '是',
          };
          return validityTypeMap[row.isVendor] || '';
        },
        visible: false,
      },
      {
        field: 'certType',
        title: '证照类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'certNo',
        title: '证照号码',
        width: '100',
        sortable: true,
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
        formatter: ({ row }: any) => {
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
        field: 'principal',
        title: '委托人',
        width: '100',
        sortable: true,
      },
      {
        field: 'principalMobile',
        title: '委托人手机',
        width: '150',
        sortable: true,
      },
      {
        field: 'scope',
        title: '范围',
        width: '70',
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
    id: 'productionLicense',
    dataTableId: `/productCertAction/querySyncApply.do?page=${tableSearchExtraParams.page}&status=${tableSearchExtraParams.status}&isVendor=${tableSearchExtraParams.isVendor}&companyType=${tableSearchExtraParams.companyType}`,
    // tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      // if (isBelowLimit === 'Y' && !params.sort) {
      //   params.sort = 'asi.GuaranteeDate';
      //   params.dir = 'asc';
      // }
      return {
        ...params,
        vendorId: selectedParentRow?.value?.bpartnerId || 0,
        certNo: certNo.value || '',
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

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab-supplierLicense===>', val, oldVal);
    if (val === props.thisTab.value) {
      console.warn('inject-supplierLicense===>', selectedParentRow);
      const params = {
        vendorId: selectedParentRow?.value?.bpartnerId,
        certNo: certNo.value,
      };
      ChcGridApi.reload({ ...params });
    }
  },
);

const handleSearch = () => {
  ChcGridApi.reload({
    vendorId: selectedParentRow?.value?.bpartnerId,
    certNo: certNo.value,
  });
};

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
        const ids: any[] = [];
        selectedRows.forEach((row: any) => {
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
        await requestFormClient
          .post('/productSyncAction/applyCheck.do', params)
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
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
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
      'data-testid': 'textarea_reject_reason_productionLicense',
    }),
    onOk: async () => {
      const rejectReason = (
        document.querySelector('#reject-reason') as HTMLTextAreaElement
      )?.value;
      try {
        const ids = selectedRows.map((row: any) => ({
          applySyncId: row.applyId,
          status: 'NO',
          checkRemark: rejectReason,
        }));
        console.warn('ids', ids);
        const params = {
          ids: JSON.stringify(ids),
        };
        const res = await requestFormClient.post(
          '/productSyncAction/applyCheck.do',
          params,
        );
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
const [ProductionDetailModal, ProductionDetailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: productionDetail,
  draggable: true,
});
const handleLicenseDetail = (row: any) => {
  console.warn('row', row);
  ProductionDetailModalApi?.setData({
    row,
    callback() {
      // 刷新表格数据
      ChcGridApi.query({
        vendorId: selectedParentRow?.value?.bpartnerId,
        certNo: certNo.value,
      });
    },
  }).open();
};

defineExpose({
  query() {
    // 子表请求
    console.warn('relatedBreed子表请求被触发===>');
    ChcGridApi.reload({
      vendorId: selectedParentRow?.value?.bpartnerId,
      certNo: certNo.value,
    });
  },
  clearData() {
    ChcGridApi.grid.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('生产企业证照');
});
</script>
<template>
  <div class="h-full">
    <ProductionDetailModal />
    <ChcGrid>
      <template #toolbar-actions>
        <label for="certNo">证照号码:&nbsp;&nbsp;</label>
        <Input
          v-model:value="certNo"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入证件号码"
          @keyup.enter="handleSearch"
          allow-clear
          data-testid="input_certNo_productionLicense"
        />
        <Button
          type="primary"
          @click="handleSearch"
          class="mr-[0.5rem]"
          data-testid="button_search_productionLicense"
        >
          查询
          <template #icon>
            <SearchActionIcon />
          </template>
        </Button>
        <Button
          v-if="false"
          type="primary"
          @click="handleApproval"
          class="mr-[0.5rem]"
          data-testid="button_approve_productionLicense"
        >
          通过
          <template #icon>
            <SvgSquareTickIcon />
          </template>
        </Button>
        <Button
          v-if="false"
          type="primary"
          @click="handleReject"
          class="mr-[0.5rem]"
          data-testid="button_reject_productionLicense"
        >
          拒绝
          <template #icon>
            <SvgCloseIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleLicenseDetail(scope.row)"
          :data-testid="`button_view_license_${scope.rowIndex}_productionLicense`"
        >
          证照详情
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
