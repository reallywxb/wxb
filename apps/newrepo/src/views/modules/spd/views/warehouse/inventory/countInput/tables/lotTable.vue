<script setup lang="ts">
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { h, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import changeLotModal from '../modals/changeLotModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const hiddenField: string = urlParams?.hiddenField || '';

const fatherTableParams = ref<Record<string, any>>({});

const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// const isFirstLoaded = ref(false); // 是否已初次加载完
const [ChangeLotModal, ChangeLotModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 链接抽离的组件
  connectedComponent: changeLotModal,
  draggable: true,
});

let gridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    type: 'seq',
    title: '序号',
    width: '50',
    align: 'center',
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
    width: '90',
    sortable: true,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    width: '150',
    sortable: true,
  },

  // TODO:字段名重复
  // {
  //   field: 'uomName',
  //   title: '单位',
  //   width: '70',
  //   sortable: true,
  // },
  {
    field: 'qtyUomDiff',
    title: '差异大单位数量',
    width: '130',
    align: 'right',
    visible: !hiddenField.includes('qtyUomDiff'),
  },
  {
    field: 'uomName',
    title: '差异大单位',
    width: '100',
    sortable: true,
  },
  {
    field: 'qtyBaseUomDiff',
    title: '差异小单位数量',
    width: '130',
    align: 'right',
    visible: !hiddenField.includes('qtyBaseUomDiff'),
  },
  {
    field: 'baseUomName',
    title: '差异小单位',
    visible: !hiddenField.includes('baseUomName'),
    width: '100',
    sortable: true,
  },
  {
    field: 'qtyDiff',
    title: '差异数量',
    width: '90',
    align: 'right',
    formatter: ({ cellValue }) => {
      return Math.floor(cellValue) === cellValue
        ? cellValue
        : cellValue.toFixed(2);
    },
  },
  {
    field: 'price',
    title: '采购价',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'lineAmt',
    title: '差异金额',
    width: '100',
    align: 'right',
    sortable: true,
  },
  {
    field: 'lot',
    title: '批号',
    width: '110',
    sortable: true,
  },
  {
    field: 'guaranteeDate',
    title: '效期',
    width: '110',
    sortable: true,
  },
  {
    field: 'productionDate',
    title: '生产日期',
    width: '110',
    visible: false,
    sortable: true,
  },
  {
    field: 'productArea',
    title: '产地',
    width: '110',
    visible: false,
    sortable: true,
  },
  {
    field: 'locatorName',
    title: '货位',
    width: '180',
    sortable: true,
  },
  {
    field: 'vendorCode',
    title: '供应商编码',
    width: 120,
    align: 'center',
    sortable: true,
  },
  {
    field: 'vendorName',
    title: '供应商',
    width: 120,
    sortable: true,
  },
  {
    field: 'storageStatusName',
    title: '库存状态',
    width: '100',
    sortable: true,
  },
  {
    field: 'action',
    fixed: 'right',
    title: '操作',
    width: 150,
    align: 'center',
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            type: 'primary',
            ghost: true,
            onClick: () => {
              console.warn('点击单元格 scope', scope);
              ChangeLotModalApi.setData({
                row: scope.row,
                warehouseId: fatherTableParams.value.warehouseId,
              }).open();
            },
            'data-testid': `button_changeLot_${scope.rowIndex}_lotTable`,
          },
          {
            default: () => '指定批号',
          },
        );
      },
    },
  },
];
gridColumns = gridColumns.filter((item) => {
  if (
    item.field === 'checkbox' ||
    item.field === 'action' ||
    item.field === 'radio'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            defaultValue: '',
          };
        },
      },
    ],
    gridColumns,
    id: 'countInput_lot',
    queryUrl: '/inventoryPlanAction/queryLineLot.do',
    // tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      if (!fatherTableParams.value.inventoryPlanId) {
        return false;
      }
      if (fatherTableParams.value.inventoryPlanId) {
        params.inventoryPlanId = fatherTableParams.value.inventoryPlanId;
      }
      return params;
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
    console.warn('currentTab', val, oldVal);
    if (val === props.thisTab.value) {
      if (fatherTableParams.value.inventoryPlanId) {
        ChcGridApi.reload();
      } else {
        ChcGridApi.grid.remove();
      }
    }
  },
);
defineExpose({
  getData(params: Record<string, any>) {
    // 子表请求
    console.warn('子表损溢结果请求');
    fatherTableParams.value = {};
    fatherTableParams.value = { ...params };
    ChcGridApi.reload();
  },
  clearData() {
    fatherTableParams.value = {};
    ChcGridApi.grid.clearEdit();
    ChcGridApi.grid.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('损溢结果');
  console.warn('urlParams:', urlParams);
});
</script>
<template>
  <div class="h-full">
    <ChangeLotModal />
    <ChcGrid />
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
