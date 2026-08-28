<script setup lang="ts">
import type { Ref } from 'vue';

import type { ParentTableType, PriceAdjDetailsRowType } from '../type';

import { inject, nextTick, onMounted, reactive, ref } from 'vue';
// import { useRoute } from 'vue-router';

import { ExportActionIcon, SearchActionIcon } from '@vben/chc-icons';
import { isEmpty } from '@vben/utils';

import { Button, Form, FormItem, Input } from 'ant-design-vue';

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
// 定义要 emit 的事件
const emit = defineEmits<{
  (e: 'dataLoaded', row: null | PriceAdjDetailsRowType): void;
}>();
const formRef = ref();
const state = reactive({
  productName: '', // 搜索内容
});
const selectedParentRow = inject<Ref<ParentTableType>>('currentReport'); // 当前选中的父行数据
// const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      pagerConfig: {
        enabled: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      radioChange: ({ row }: { row: PriceAdjDetailsRowType }) => {
        console.warn('明细表 radioChange 触发 emit ===>', row);
        if (row && row.productPriceListAdjId) {
          // 触发结果子表数据加载事件
          emit('dataLoaded', row);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        width: '150',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名',
        width: '150',
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
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '130',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '原零售价',
        sortable: true,
        minWidth: 90,
        align: 'right',
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'priceListNew',
        title: '新零售价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '原采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePONew',
        title: '新采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'qtyAdj',
        title: '调价数量',
        width: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'amountAdj',
        title: '零售调价金额',
        width: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'amountPOAdj',
        title: '进价调价金额',
        width: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'vendorQtyAdj',
        title: '供应商库存调价数量',
        width: '160',
        sortable: true,
        align: 'right',
      },
      {
        field: 'vendorAmountPOAdj',
        title: '供应商库存调价金额',
        width: '160',
        sortable: true,
        align: 'right',
      },
    ],
    id: 'priceAdjDetails',
    dataTableId: '/productAction/queryProductPriceListAdj.do',
    // tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      if (isEmpty(selectedParentRow?.value?.priceListAdjId)) {
        return false;
      }
      return {
        ...params,
        priceListAdjId: selectedParentRow?.value?.priceListAdjId,
      };
    },
    afterFetchFn: (params) => {
      const records = params.rows || [];
      // 数据加载完成后，自动选中第一行并通知父组件
      if (records.length > 0) {
        // 使用 nextTick 确保表格渲染完毕
        nextTick(() => {
          ChcGridApi.grid.setRadioRow(records[0]);
          // emit('dataLoaded', records[0]);  // 防止重复触发
        });
      } else {
        // 如果没有数据，通知父组件
        emit('dataLoaded', null);
      }
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
  ChcGridApi.query({
    priceListAdjId: selectedParentRow?.value?.priceListAdjId || '',
    productName: state.productName,
  });
};

const query = () => {
  const priceListAdjId = selectedParentRow?.value?.priceListAdjId;
  // 如果父表没有选中行，则不查询
  if (!priceListAdjId) {
    // 主动清空数据并通知父组件
    ChcGridApi.grid.loadData([]);
    emit('dataLoaded', null);
    return;
  }

  ChcGridApi.query({
    priceListAdjId,
    productName: state.productName,
  });
};

const clear = () => {
  state.productName = '';
  ChcGridApi.grid.loadData([]);
  // ChcGridApi.grid.remove();
};

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
// watch(
//   () => currentTab.value,
//   (val: string, oldVal: string) => {
//     console.warn('currentTab-priceAdjDetails===>', val, oldVal);
//     if (val === props.thisTab.value) {
//       console.warn('inject-priceAdjDetails===>', selectedParentRow);
//       ChcGridApi.query({
//         priceListAdjId: selectedParentRow?.value?.priceListAdjId || '',
//         productName: state.productName,
//       });
//     }
//   },
// );

defineExpose({ query, clear });

// 初始化加载
onMounted(() => {
  console.warn('药品调价明细');
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
          <FormItem label="药品" name="productName">
            <Input
              v-model:value="state.productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入编码/搜索码/名称"
              allow-clear
              data-testid="input_productName_priceAdjDetails"
            />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              html-type="submit"
              class="mr-[0.5rem]"
              data-testid="button_search_priceAdjDetails"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleExport"
              class="mr-[0.5rem]"
              data-testid="button_export_priceAdjDetails"
            >
              导 出
              <template #icon>
                <ExportActionIcon />
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
