<script setup lang="ts">
// import { useRoute } from 'vue-router';

import type { Ref } from 'vue';

import type { PriceAdjDetailsRowType } from '../type';

import { inject, onMounted, reactive, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { isEmpty } from '@vben/utils';

import { Button, Form, FormItem, Select } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

// const props = withDefaults(
//   defineProps<{
//     thisTab: PageTab;
//   }>(),
//   {},
// );
// const route = useRoute();
// const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

const formState = reactive({
  departmentId: '', // 院区
  warehouseId: '', // 仓库
});

const departmentOptions = ref<any[]>([]);
const warehouseOptions = ref<any[]>([]);
const summaryData = ref({
  amountPOAdjLine: 0,
  amountAdjLine: 0,
});
const selectedDetailRow =
  inject<Ref<PriceAdjDetailsRowType>>('selectedDetailRow'); // 当前选中的父行数据
// const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值

// const footerMethod: VxeGridPropTypes.FooterMethod = ({ columns, data }) => {
//   const sums: (number | string)[] = [];
//   columns.forEach((column, index) => {
//     if (index === 0) {
//       sums.push('合计');
//       return;
//     }
//     // 只对特定列进行计算
//     if (
//       column.field === 'amountPOAdjLine' ||
//       column.field === 'amountAdjLine'
//     ) {
//       const total = data.reduce(
//         (prev, curr) => prev + Number(curr[column.field] || 0),
//         0,
//       );
//       sums.push(handlePriceToFixedTwo(total));
//     } else {
//       sums.push('');
//     }
//   });
//   return [sums];
// };
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
      // showFooter: true,
      // footerMethod,
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '100',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '130',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '110',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '原零售价',
        width: '90',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'priceListNew',
        title: '新零售价',
        width: '90',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '原采购价',
        width: '90',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePONew',
        title: '新采购价',
        width: '90',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'qtyAdjLine',
        title: '调价数量',
        width: '90',
        sortable: true,
      },
      {
        field: 'amountAdjLine',
        title: '零售调价金额',
        width: '120',
        sortable: true,
      },
      {
        field: 'amountPOAdjLine',
        title: '进价调价金额',
        width: '120',
        sortable: true,
      },
      {
        field: 'vendorQtyAdjLine',
        title: '供应商库存调价数量',
        width: '180',
        sortable: true,
      },
      {
        field: 'vendorAmountPOAdjLine',
        title: '供应商库存调价金额',
        width: '180',
        sortable: true,
      },
    ],
    id: 'priceAdjResult',
    dataTableId: 'productAction/queryPriceListAdjDetail.do',
    // tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      if (isEmpty(selectedDetailRow?.value?.productPriceListAdjId)) {
        return false;
      }
      return {
        ...params,
        productPriceListAdjId: selectedDetailRow?.value?.productPriceListAdjId,
      };
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      const records = params.rows || [];
      let totalPO = 0;
      let totalAdj = 0;
      for (const row of records) {
        totalPO += Number(row.amountPOAdjLine || 0);
        totalAdj += Number(row.amountAdjLine || 0);
      }
      summaryData.value.amountPOAdjLine = totalPO;
      summaryData.value.amountAdjLine = totalAdj;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// const summaryOptions = ref<any[]>([
//   {
//     field: 'amountPOAdjLine',
//     title: '进价调价金额汇总',
//     formatter({ cellValue }: any) {
//       return handlePriceToFixedTwo(cellValue);
//     },
//   },
//   {
//     field: 'amountAdjLine',
//     title: '零售调价金额汇总',
//     formatter({ cellValue }: any) {
//       return handlePriceToFixedTwo(cellValue);
//     },
//   },
// ]);

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
// watch(
//   () => currentTab.value,
//   (val: string, oldVal: string) => {
//     console.warn('currentTab-priceAdjResult===>', val, oldVal);
//     if (val === props.thisTab.value) {
//       console.warn('inject-priceAdjResult===>', selectedDetailRow);
//       ChcGridApi.query({
//         productPriceListAdjId:
//           selectedDetailRow?.value?.productPriceListAdjId || '',
//         ...formState,
//       });
//     }
//   },
// );

// 查询
const handleSearch = () => {
  ChcGridApi.query({
    productPriceListAdjId:
      selectedDetailRow?.value?.productPriceListAdjId || '',
    ...formState,
  });
};

// 获取院区和仓库列表
const getDepartmentOptions = async () => {
  const params = {
    type: 0,
    includeRegion: 'Y',
  };
  const res = await requestFormClient.post(
    '/baseHandleAction/departmentList.do',
    params,
  );
  console.warn('getDepartmentOptions===>', res);
  if (res && res.success) {
    departmentOptions.value = [
      {
        id: '',
        name: '全部',
      },
      ...(res.rows || []),
    ];
  }
};

const getWarehouseOptions = async (departmentId?: string) => {
  const params = {
    readWrite: 'Y',
    departmentId,
    regionId: departmentId,
  };
  formState.warehouseId = '';
  const res = await requestFormClient.post(
    '/baseHandleAction/warehouse.do',
    params,
  );
  console.warn('getWarehouseOptions===>', res);
  if (res && res.success) {
    warehouseOptions.value = [
      {
        id: '',
        name: '全部',
      },
      ...(res.rows || []),
    ];
  }
};

const query = () => {
  const productPriceListAdjId = selectedDetailRow?.value?.productPriceListAdjId;

  // 如果没有依赖ID，则不发起请求并清空表格
  if (!productPriceListAdjId) {
    ChcGridApi.grid.loadData([]);
    summaryData.value.amountPOAdjLine = 0;
    summaryData.value.amountAdjLine = 0;
    return;
  }
  console.warn(`调价结果：使用 ID [${productPriceListAdjId}] 查询数据`);
  ChcGridApi.query({
    productPriceListAdjId,
    ...formState,
  });
};

const clear = () => {
  formState.departmentId = '';
  formState.warehouseId = '';
  ChcGridApi.grid.loadData([]);
  summaryData.value.amountPOAdjLine = 0;
  summaryData.value.amountAdjLine = 0;
};

defineExpose({
  query,
  clear,
});
// 初始化加载
onMounted(() => {
  console.warn('priceAdjResult===>');
  if (departmentOptions.value.length === 0) {
    getDepartmentOptions();
  }
  if (warehouseOptions.value.length === 0) {
    getWarehouseOptions();
  }
});
</script>
<template>
  <div class="h-full">
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
          <FormItem
            label="院区"
            name="departmentId"
            class="mr-[0.5rem] w-[240px]"
          >
            <Select
              v-model:value="formState.departmentId"
              allow-clear
              placeholder="请选择院区"
              size="middle"
              class="w-full"
              :field-names="{ label: 'name', value: 'id' }"
              :options="departmentOptions"
              data-testid="select_department_priceAdjResult"
              @change="getWarehouseOptions"
            />
          </FormItem>
          <FormItem
            label="仓库"
            name="warehouseId"
            class="mr-[0.5rem] w-[240px]"
          >
            <Select
              v-model:value="formState.warehouseId"
              allow-clear
              placeholder="请选择仓库"
              size="middle"
              class="w-full"
              :field-names="{ label: 'name', value: 'id' }"
              :options="warehouseOptions"
              data-testid="select_warehouse_priceAdjResult"
            />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              html-type="submit"
              class="mr-[0.5rem]"
              data-testid="button_search_priceAdjResult"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </FormItem>
        </Form>
      </template>
      <template #bottom>
        <ul class="flex items-center justify-end">
          <li class="mr-[1rem]">
            <span class="mr-[0.5rem] font-bold">
              零售调价金额汇总:
            </span>
            <span>{{
              handlePriceToFixedTwo(summaryData.amountAdjLine)
            }}</span>
          </li>
          <li class="mr-[1rem]">
            <span class="mr-[0.5rem] font-bold">
             进价调价金额汇总:
            </span>
            <span>{{
              handlePriceToFixedTwo(summaryData.amountPOAdjLine)
            }}</span>
          </li>
        </ul>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

:deep(.vxe-buttons--wrapper) {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}
</style>
