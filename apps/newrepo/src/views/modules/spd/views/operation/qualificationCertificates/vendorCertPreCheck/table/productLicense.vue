<script setup lang="ts">
import type { Ref } from 'vue';

import type { ParentTableType } from '../type';

import { h, inject, onMounted, reactive, ref, watch } from 'vue';

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

import productDetail from '../modal/productDetail.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

// 表格查询字符串参数
const queryParamsStr = ref<{
  page?: string;
  status?: string;
}>({
  page: 'Product',
  status: 'WA',
});

// 表格查询body参数
const queryParams = reactive({
  vendorId: undefined, // 父表ID
  productName: undefined, // 产品名称
  certNo: undefined, // 证照号码
});
const selectCheckedRows = ref<any[]>([]);
const selectedParentRow = inject<Ref<ParentTableType>>('currentReport'); // 当前选中的父行数据
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值

const [ProductDetailModal, ProductDetailModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: productDetail,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      pagerConfig: {
        enabled: true,
      },
      stripe: false,
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
      checkboxChange: ({ records }: { records: any[] }) => {
        console.warn('checkboxChange:', records);
        selectCheckedRows.value = records;
      },
      // 全选/全不选事件
      checkboxAll: ({ records, checked }: any) => {
        console.warn('checkboxAll:', checked, records);
        selectCheckedRows.value = records;
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'productName',
        title: '产品名',
        width: '150',
        sortable: false,
      },
      {
        field: 'certType',
        title: '证照类型',
        width: '110',
        sortable: false,
      },
      {
        field: 'certNo',
        title: '证照号',
        width: '110',
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
        formatter: ({ row }: any) => {
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
        width: '110',
        sortable: false,
      },
      {
        field: 'manufacturerName',
        title: '生产企业',
        width: '110',
        sortable: false,
      },
      {
        field: 'description',
        title: '备注',
        width: '120',
        sortable: false,
      },
      {
        field: 'statusName',
        title: '状态',
        width: '70',
        sortable: true,
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
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: '100',
      },
    ],
    formSchema: [],
    id: 'productLicense',
    dataTableId: `/productCertAction/querySyncApply.do?page=${queryParamsStr.value.page}&status=${queryParamsStr.value.status}`,
    tableSearchExtraParams: queryParams,
    beforeFetchFn: (params) => {
      console.warn('productLicense beforeFetchFn', params);
      return {
        ...params,
        ...queryParams,
        vendorId: selectedParentRow?.value?.bpartnerId || 0,
        certNo: queryParams.certNo || '',
        productName: queryParams.productName || '',
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

// 查询
const handleSearch = () => {
  ChcGridApi.reload({
    vendorId: queryParams.vendorId,
    productName: queryParams.productName,
    certNo: queryParams.certNo,
  });
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
        const ids: any[] = [];
        selectCheckedRows.value.forEach((row: any) => {
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
      'data-testid': 'textarea_reject_reason_productLicense',
    }),
    onOk: async () => {
      const rejectReason = (
        document.querySelector('#reject-reason') as HTMLTextAreaElement
      )?.value;
      try {
        const ids = selectCheckedRows.value.map((row: any) => ({
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

// 证照查看
const handleLicenseDetail = (row: any) => {
  console.warn('openLotCert row', row);
  ProductDetailModalApi.setData({
    row,
    callback() {
      ChcGridApi.query({
        vendorId: queryParams.vendorId,
        productName: queryParams.productName,
        certNo: queryParams.certNo,
      });
    },
  }).open();
};

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab-productLicense===>', val, oldVal);
    if (val === props.thisTab.value && selectedParentRow?.value?.bpartnerId) {
      ChcGridApi.reload({
        vendorId: selectedParentRow?.value?.bpartnerId,
        productName: queryParams.productName,
        certNo: queryParams.certNo,
      });
    }
  },
);

// 初始化加载
onMounted(() => {
  console.warn('产品证照');
});

defineExpose({
  query(params: Record<string, any>) {
    // 子表请求
    console.warn('productLicense子表请求被触发===>', params);
    Object.assign(queryParams, params);
    ChcGridApi.reload({ ...queryParams });
  },
  clearData() {
    queryParams.vendorId = undefined;
    ChcGridApi.grid.loadData([]);
    ChcGridApi.grid.clearCheckboxRow();
  },
});
</script>
<template>
  <div class="h-full">
    <ProductDetailModal />
    <ChcGrid>
      <template #toolbar-actions>
        <label for="certNo">证照号码:&nbsp;&nbsp;</label>
        <Input
          v-model:value="queryParams.certNo"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入证件号码"
          @keyup.enter="handleSearch"
          allow-clear
          data-testid="input_certNo_productLicense"
        />
        <label for="productName">产品名称:&nbsp;&nbsp;</label>
        <Input
          v-model:value="queryParams.productName"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入产品名称"
          @keyup.enter="handleSearch"
          allow-clear
          data-testid="input_productName_productLicense"
        />
        <Button
          type="primary"
          @click="handleSearch"
          class="mr-[0.5rem]"
          data-testid="button_search_productLicense"
        >
          查询
          <template #icon>
            <SearchActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleApproval"
          class="mr-[0.5rem]"
          data-testid="button_approval_productLicense"
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
          data-testid="button_reject_productLicense"
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
          :data-testid="`button_view_license_${scope.rowIndex}_productLicense`"
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
  /* display: none; */
}
</style>
