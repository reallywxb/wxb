<script setup lang="ts">
import type { Ref } from 'vue';

import type { ParentTableType } from '../type';

import { inject, onMounted, reactive, watch } from 'vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const queryParams = reactive({
  productId: undefined,
});

const selectedParentRow = inject<Ref<ParentTableType>>('currentReport');
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// const isFirstLoaded = ref(false); // 是否已初次加载完
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
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productcode',
        title: '药品编码',
        width: '150',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
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
        width: '100',
        sortable: true,
      },
    ],
    id: 'relatedBreed',
    dataTableId: 'certAction/queryLinkProduct.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      return {
        ...params,
        productId:
          selectedParentRow?.value?.productId || queryParams.productId || 0,
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
    console.warn('currentTab-relatedBreed===>', val, oldVal);
    if (val === props.thisTab.value && selectedParentRow?.value?.productId) {
      console.warn('inject-relatedBreed===>', selectedParentRow);
      ChcGridApi.reload({
        productId: selectedParentRow?.value?.productId,
      });
    }
  },
);
defineExpose({
  query(params: Record<string, any>) {
    // 子表请求
    console.warn('relatedBreed子表请求被触发===>', params);
    Object.assign(queryParams, params);
    ChcGridApi.reload({ ...queryParams });
  },
  remove() {
    ChcGridApi.grid.remove();
  },
  reload() {
    ChcGridApi.grid.reloadData([]);
  },
});
// 初始化加载
onMounted(() => {
  console.warn('关联品种子表');
});
</script>
<template>
  <div class="h-full">
    <ChcGrid />
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
