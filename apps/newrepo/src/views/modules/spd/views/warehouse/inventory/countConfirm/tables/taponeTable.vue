<script setup lang="ts">
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Modal as AntModal, Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const globalPrintStore = useGlobalPrintStore();
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const hiddenField: string = urlParams?.hiddenField || '';

const fatherTableParams = ref<Record<string, any>>({});

const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// const isFirstLoaded = ref(false); // 是否已初次加载完
const handleFormSubmit = async () => {
  if (!fatherTableParams.value.inventoryPlanId) return;
  const formValues = await ChcGridApi.formApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.reload(formValues);
};
let gridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    type: 'radio',
    title: '单选',
    width: 50,
    align: 'center',
    visible: false,
  },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
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

  // TODO:重复
  // {
  //   field: 'uomName',
  //   title: '单位',
  //   width: '70',
  //   sortable: true,
  // },
  {
    field: 'qtyBook',
    title: '账存数量',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'qtyUomCount',
    title: '实盘大单位数量',
    width: '130',
    align: 'right',
    sortable: true,
  },
  {
    field: 'uomName',
    title: '实盘大单位',
    width: '100',
    sortable: true,
  },
  {
    field: 'qtyBaseUomCount',
    title: '实盘小单位数量',
    visible: hiddenField.includes('qtyBaseUomCount'),
    width: '130',
    align: 'right',
    sortable: true,
  },
  {
    field: 'baseUomName',
    title: '实盘小单位',
    visible: hiddenField.includes('baseUomName'),
    width: '100',
    sortable: true,
  },
  {
    field: 'qtyCount',
    title: '实盘数量',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'qtyDiff',
    title: '差异数量',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'diffAmt',
    title: '差异金额',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'inventoryReason',
    title: '损溢原因',
    width: '150',
  },
  {
    field: 'description',
    title: '备注',
    width: '150',
    // TODO:未见编辑
    // edit: 'text',
    // autoEdit: 'false',
    sortable: true,
  },
  {
    field: 'unitPackQty',
    title: '包装定数',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'packageQtyBook',
    title: '账存包数',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'packageQtyCount',
    title: '实盘包数',
    width: '90',
    align: 'right',
    sortable: true,
  },
  {
    field: 'packageQtyDiff',
    title: '差异包数',
    width: '90',
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
    title: '存货状态',
    width: '100',
    sortable: true,
  },
  {
    field: 'countUserName',
    title: '完成人',
    width: '100',
    sortable: true,
  },
  {
    field: 'countTime',
    title: '完成时间',
    width: '160',
    sortable: true,
  },
];
gridColumns = gridColumns.filter((item) => {
  if (
    item.type === 'checkbox' ||
    item.field === 'action' ||
    item.type === 'radio'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      handleSubmit: handleFormSubmit,
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
            placeholder: ``,
            defaultValue: '',
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'hasDiff',
        label: '差异',
        defaultValue: true,
        componentProps: () => {
          return {
            defaultValue: true,
          };
        },
      },
    ],
    gridColumns,
    id: 'countConfirm_tapone',
    queryUrl: '/inventoryPlanAction/queryLine.do',
    // tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      const realParams: Record<string, any> = {
        ...params,
        ...fatherTableParams.value,
      };
      realParams.hasDiff =
        realParams.hasDiff === 'Y' || realParams.hasDiff === true ? 'Y' : 'N';
      if (!fatherTableParams.value.inventoryPlanId) {
        return false;
      }
      return realParams;
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
        ChcGridApi.grid.reloadData([]);
      }
    }
  },
);
defineExpose({
  getData(params: Record<string, any>) {
    // 子表请求
    console.warn('子表盘点明细请求');
    fatherTableParams.value = {};
    fatherTableParams.value = { ...params };
    ChcGridApi.reload();
  },
  removeData() {
    fatherTableParams.value = {};
    ChcGridApi.grid.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('盘点明细');
  console.warn('urlParams:', urlParams);
});
const handlePrint = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrint row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const headerId = row.inventoryPlanId;
  AntModal.confirm({
    title: '打印提示',
    content: '确认打印盘点单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryPlanAction/printInventoryPlanDoc.do?id=${JSON.stringify(headerId)}`,
      });
    },
    onCancel() {},
  });
};
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_taponeTable"
        >
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handlePrint"
          class="mr-[0.5rem]"
          data-testid="button_print_taponeTable"
        >
          打印
          <template #icon>
            <SvgPrintFillIcon />
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
