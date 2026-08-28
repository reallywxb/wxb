<script setup lang="ts">
import { onMounted } from 'vue';

import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

interface Props {
  title: string;
}
defineOptions({
  name: 'PurchaseRank',
});

withDefaults(defineProps<Props>(), {});

const [ChcGrid] = useSpdGrid(
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
      showCollapseButton: false,
      resetButtonOptions: {
        show: false,
      },
      wrapperClass: 'grid-cols-2',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      minHeight: 50,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
      pagerConfig: {
        enabled: true,
      },
      cellConfig: {
        // height: 30,
      },
    }),
  },
  {
    id: 'purchaseRank',
    // api地址
    queryUrl: '/dashboardAction/queryPurchaseTop.do',
    gridColumns: [
      // { field: 'rank', title: '排名', width: '10%', align: 'center' },
      { field: 'index', fixed: 'left', title: '排名', type: 'seq', width: 50 },
      {
        field: 'productName',
        title: '产品名称',
        width: '15%',
        align: 'center',
      },
      {
        field: 'specModel',
        title: '规格/型号',
        width: '10%',
        align: 'center',
      },
      { field: 'qtyOnHand', title: '现有库存', width: '10%', align: 'center' },
      {
        field: 'purchaseCount',
        title: '近一月采购量',
        width: '15%',
        align: 'center',
      },
      { field: 'supplierName', title: '供应商', width: '15%', align: 'center' },
      { field: 'brandName', title: '品牌', width: '10%', align: 'center' },
      {
        field: 'manufacturer',
        title: '生产企业',
        align: 'center',
        width: '15%',
      },
    ],
    // 表单配置
    formSchema: [],
    gridEvents: {},
    // showCustomBtn: true,
    // showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      return params;
    },
    afterFetchFn: (params: any) => {
      return {
        ...params,
        records: params.data,
      };
    },
  },
);
onMounted(() => {
  // setTimeout(() => {
  //   const arr = [
  //     {
  //       rank: 1,
  //       prodcutName: '一次性使用棉球',
  //       prodcutSpec: '20颗/包 灭菌',
  //       storage: 6357,
  //       purchaseCount: 50_123,
  //       supplierName: '华东医药股份有限公司器材化剂分公司',
  //       brand: '康宝',
  //       componyName: '江苏康宝医疗器械有限公司',
  //     },
  //     {
  //       rank: 2,
  //       prodcutName: '密闭式导针刺伤型静脉留置针(BD)',
  //       prodcutSpec: '18G 383752',
  //       storage: 5321,
  //       purchaseCount: 45_210,
  //       supplierName: '浙江德高医疗科技有限公司',
  //       brand: 'BD',
  //       componyName: 'Becton, Dickinson and Company',
  //     },
  //     {
  //       rank: 3,
  //       prodcutName: '一次性使用无菌注射器带针',
  //       prodcutSpec: '20ml 12#',
  //       storage: 5103,
  //       purchaseCount: 43_593,
  //       supplierName: '浙江龙德医药有限公司',
  //       brand: '龙德',
  //       componyName: '浙江龙德医药有限公司',
  //     },
  //     {
  //       rank: 4,
  //       prodcutName: '医用纱布块',
  //       prodcutSpec: '10*10-12P 灭菌(20片)',
  //       storage: 5009,
  //       purchaseCount: 43_211,
  //       supplierName: '绍兴福清医疗器械有限公司',
  //       brand: '绍兴福清',
  //       componyName: '绍兴福清卫生用品有限公司',
  //     },
  //     {
  //       rank: 5,
  //       prodcutName: '一次性棉签',
  //       prodcutSpec: '11cm(20支)',
  //       storage: 4589,
  //       purchaseCount: 40_758,
  //       supplierName: '浙江省医疗器械有限公司',
  //       brand: '华宝',
  //       componyName: '慈溪市华宝医疗用品工贸发展有限公司',
  //     },
  //   ];
  //   // ChcGridApi.grid.reloadData(arr);
  // }, 500);
});
</script>

<template>
  <Card class="box-border">
    <CardHeader class="py-4">
      <CardTitle class="xl:text-md 2xl:text-lg">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent
      class="relative box-border h-[calc(100%_-_60px)] w-full overflow-auto pt-0"
    >
      <div class="absolute inset-0 h-full w-full p-5 pt-0">
        <ChcGrid class="box-border h-full w-full" />
      </div>
    </CardContent>
  </Card>
</template>
<style lang="less" scoped></style>
