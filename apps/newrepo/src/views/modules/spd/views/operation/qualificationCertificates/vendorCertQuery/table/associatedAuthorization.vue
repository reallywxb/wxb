<script setup lang="ts">
import type { Ref } from 'vue';

import type { CompanyCertRowType, ParentTableType } from '../type';

import { inject, onMounted, reactive, ref, watch } from 'vue';
// import { useRoute } from 'vue-router';

import { IconfontBasicView, SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Form, FormItem, Input, Select } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import previewImageCom from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
// const route = useRoute();
// const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

// 表格查询字符串参数
const tableSearchExtraParams = reactive<{
  companyType?: string;
  isVendor?: string;
}>({
  isVendor: 'Y',
  companyType: 'T',
});

const formState = reactive({
  certNo: '', // 证照号码
  certvalid: '', // 有效期
});
// const fatherTableParams = ref<Record<string, any>>({});
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
      // {
      //   field: 'isVendor',
      //   title: '是否供应商',
      //   width: '100',
      //   sortable: false,
      //   formatter: ({ row }: any) => {
      //     const validityTypeMap: Record<string, string> = {
      //       N: '否',
      //       Y: '是',
      //     };
      //     return validityTypeMap[row.isVendor] || '';
      //   },
      // },
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
      // {
      //   field: 'validityType',
      //   title: '是否长期',
      //   width: '70',
      //   sortable: false,
      //   formatter: ({ row }: any) => {
      //     const validityTypeMap: Record<string, string> = {
      //       R: '否',
      //       L: '是',
      //     };
      //     return validityTypeMap[row.validityType] || '';
      //   },
      // },
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
        field: 'checkUser',
        title: '审核人',
        width: '90',
        sortable: true,
      },
      {
        field: 'checkTime',
        title: '审核时间',
        width: '110',
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
    id: 'associatedAuthorization',
    dataTableId: `/companyAction/queryCert.do?isVendor=${tableSearchExtraParams.isVendor}&companyType=${tableSearchExtraParams.companyType}`,
    // tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      // const newParams: Record<string, any> = {
      //   ...params,
      //   ...fatherTableParams.value,
      //   ...formState,
      // }
      // return newParams;
      return {
        ...params,
        vendorId: selectedParentRow?.value?.bpartnerId || 0,
        bpartnerId: selectedParentRow?.value?.bpartnerId || 0,
        certNo: formState.certNo || '',
        certvalid: formState.certvalid || '',
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
    console.warn('currentTab-associatedAuthorization===>', val, oldVal);
    if (val === props.thisTab.value && selectedParentRow?.value?.bpartnerId) {
      console.warn('inject-associatedAuthorization===>', selectedParentRow);
      const params = {
        vendorId: selectedParentRow?.value?.bpartnerId,
        bpartnerId: selectedParentRow?.value?.bpartnerId,
      };
      ChcGridApi.reload({
        ...params,
      });
    }
  },
);

const handleSearch = () => {
  ChcGridApi.reload({
    vendorId: selectedParentRow?.value?.bpartnerId,
    bpartnerId: selectedParentRow?.value?.bpartnerId,
    ...formState,
  });
};

const [PreviewImageModal, PreviewImageModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImageCom,
  draggable: true,
});
const handleLicenseDetail = (row: any) => {
  console.warn('row', row);
  PreviewImageModalApi?.setData({
    imageList: row.filePaths,
    callback() {
      // 刷新表格数据
      // ChcGridApi.query({
      //   vendorId: selectedParentRow?.value?.bpartnerId,
      //   bpartnerId: selectedParentRow?.value?.bpartnerId,
      //   ...formState,
      // });
    },
  }).open();
};
const certvalidOptions = ref<{ label: string; value: string }[]>([
  { value: '', label: '全部' },
  { value: 'I30', label: '30天之内' },
  { value: 'I90', label: '90天之内' },
  { value: 'OI', label: '已过期' },
]);

defineExpose({
  query() {
    // 子表请求
    console.warn('associatedAuthorization子表请求被触发===>');
    // fatherTableParams.value = {};
    // fatherTableParams.value = { ...params };
    // ChcGridApi.query();
    ChcGridApi.reload({
      vendorId: selectedParentRow?.value?.bpartnerId,
      bpartnerId: selectedParentRow?.value?.bpartnerId,
      ...formState,
    });
  },
  clearData() {
    ChcGridApi.grid.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('授权企业证照');
});
</script>
<template>
  <div class="h-full">
    <PreviewImageModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Form
          style="width: 100%"
          :model="formState"
          @submit="handleSearch"
          name="query_form"
          autocomplete="off"
          layout="inline"
        >
          <FormItem label="证照号码" name="certNo">
            <Input
              v-model:value="formState.certNo"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入证照号码"
              allow-clear
              data-testid="input_certNo_associatedAuthorization"
            />
          </FormItem>
          <FormItem
            label="有效期"
            name="certvalid"
            class="mr-[0.5rem] w-[240px]"
          >
            <Select
              v-model:value="formState.certvalid"
              allow-clear
              placeholder="请选择有效期"
              size="middle"
              class="w-full"
              :options="certvalidOptions"
              data-testid="select_certvalid_associatedAuthorization"
            />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              html-type="submit"
              class="mr-[0.5rem]"
              data-testid="button_query_associatedAuthorization"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </FormItem>
        </Form>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleLicenseDetail(scope.row)"
          :data-testid="`button_viewLicense_${scope.rowIndex}_associatedAuthorization`"
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
