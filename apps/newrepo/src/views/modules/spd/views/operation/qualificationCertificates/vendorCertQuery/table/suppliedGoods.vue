<script setup lang="ts">
import type { Ref } from 'vue';

import type { CompanyCertRowType, ParentTableType } from '../type';

import { inject, onMounted, reactive, ref, watch } from 'vue';
// import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';

import { Button, Form, FormItem, Input, Select } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

interface FormType {
  productName: string;
  productCertStatus: string;
  certvalid: string;
}

interface SelectOptionType {
  value: string;
  label: string;
}

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
  page?: string;
  status?: string;
}>({
  page: 'Product',
  status: 'WC',
});
const formRef = ref();
const state = reactive<FormType>({
  productName: '',
  productCertStatus: '',
  certvalid: '',
});
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
        field: 'productCode',
        title: '药品编码',
        width: '150',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '100',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '100',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '生产企业',
        width: '110',
        sortable: false,
      },
      {
        field: 'certificateNo',
        title: '注册证号',
        width: '110',
        sortable: false,
      },
      {
        field: 'productCertStatus',
        title: '证照状态',
        width: '110',
        sortable: true,
        formatter: ({ row }: any) => {
          const productCertStatusMap: Record<string, string> = {
            Lost: '缺失',
            WC: '待审',
            AC: '已审',
          };
          return productCertStatusMap[row.productCertStatus] || '';
        },
      },
      {
        field: 'certvalidTo',
        title: '证照效期',
        width: '120',
        sortable: true,
        formatter: ({ row }: any) => {
          if (row.isAlwaysValid && row.isAlwaysValid === 'Y') {
            return '长期有效';
          }
          return row.certvalidTo;
        },
      },
    ],
    id: 'supplierLicense',
    dataTableId: `/productCertAction/queryProductOrg.do?page=${tableSearchExtraParams.page}&status=${tableSearchExtraParams.status}`,
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
        bpartnerId: selectedParentRow?.value?.bpartnerId || 0,
        productName: state.productName,
        productCertStatus: state.productCertStatus,
        certvalid: state.certvalid,
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
const handleSubmit = () => {
  console.warn('查询了');
  ChcGridApi.reload({
    vendorId: selectedParentRow?.value?.bpartnerId,
    bpartnerId: selectedParentRow?.value?.bpartnerId,
    productName: state.productName,
    productCertStatus: state.productCertStatus,
    certvalid: state.certvalid,
  });
};

// select配置项
const productCertStatusOptions = ref<SelectOptionType[]>([
  { value: '', label: '全部' },
  { value: 'WC', label: '待审' },
  { value: 'AC', label: '已审' },
  { value: 'lost', label: '缺失' },
]);

const certvalidOptions = ref<SelectOptionType[]>([
  { value: '', label: '全部' },
  { value: 'I30', label: '30天之内' },
  { value: 'I90', label: '90天之内' },
  { value: 'OI', label: '已过期' },
]);

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab-supplierLicense===>', val, oldVal);
    if (val === props.thisTab.value && selectedParentRow?.value?.bpartnerId) {
      console.warn('inject-supplierLicense===>', selectedParentRow);
      const params = {
        vendorId: selectedParentRow?.value?.bpartnerId,
        bpartnerId: selectedParentRow?.value?.bpartnerId,
        ...state,
      };
      ChcGridApi.reload({
        ...params,
      });
    }
  },
);

defineExpose({
  query() {
    // 子表请求
    console.warn('relatedBreed子表请求被触发===>');
    ChcGridApi.reload({
      vendorId: selectedParentRow?.value?.bpartnerId,
      bpartnerId: selectedParentRow?.value?.bpartnerId,
      ...state,
    });
  },
  clearData() {
    ChcGridApi.grid.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('供应商证照');
});
</script>
<template>
  <div class="h-full">
    <ChcGrid class="flex-1 overflow-hidden">
      <template #toolbar-actions>
        <Form
          style="width: 100%"
          ref="formRef"
          :model="state"
          @submit="handleSubmit"
          name="query_form"
          autocomplete="off"
          layout="inline"
        >
          <FormItem label="药品名称" name="productName">
            <Input
              v-model:value="state.productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              allow-clear
              data-testid="input_productName_suppliedGoods"
            />
          </FormItem>
          <FormItem
            label="证照状态"
            name="productCertStatus"
            class="mr-[0.5rem] w-[240px]"
          >
            <Select
              v-model:value="state.productCertStatus"
              allow-clear
              placeholder="请选择证照状态"
              size="middle"
              class="w-full"
              :options="productCertStatusOptions"
              data-testid="select_productCertStatus_suppliedGoods"
            />
          </FormItem>
          <FormItem
            label="有效期"
            name="certvalid"
            class="mr-[0.5rem] w-[240px]"
          >
            <Select
              v-model:value="state.certvalid"
              allow-clear
              placeholder="请选择有效期"
              size="middle"
              class="w-full"
              :options="certvalidOptions"
              data-testid="select_certvalid_suppliedGoods"
            />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              html-type="submit"
              class="mr-[0.5rem]"
              data-testid="button_query_suppliedGoods"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </FormItem>
        </Form>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
