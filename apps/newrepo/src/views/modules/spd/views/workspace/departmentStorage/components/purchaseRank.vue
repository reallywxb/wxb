<script setup lang="ts">
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
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // maxHeight: '100%',
      proxyConfig: {
        autoLoad: true,
      },
      pagerConfig: {
        enabled: false,
      },
    }),
  },
  {
    id: 'purchaseRank',
    // api地址
    queryUrl: '/dashboardAction/queryConsumeTop.do',
    gridColumns: [
      {
        title: '排名',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      { field: 'productName', title: '产品名称', minWidth: 250 },
      { field: 'specModel', title: '规格', minWidth: 150 },
      { field: 'qtyOnHand', title: '现有库存', width: 100, align: 'center' },
      { field: 'consumeCount', title: '近一月消耗量', width: 100 },
      // { field: 'supplierName', title: '供应商', width: 70 },
      // { field: 'brandName', title: '品牌', width: 100 },
      { field: 'manufacturer', title: '生产企业', minWidth: 150 },
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
// onMounted(() => {
//   setTimeout(() => {
//     const arr: any[] = [
//       {
//         rank: 1,
//         prodcutName: '纱布叠片',
//         prodcutSpec: '8*8-8P 十片灭菌',
//         storage: 231,
//         purchaseCount: 1250,
//         supplierName: '泰州博元医疗科技有限公司',
//         brand: '康宝',
//         componyName: '江苏康宝医疗器械有限公司',
//       },
//       {
//         rank: 2,
//         prodcutName: '一次性使用灭菌橡胶外科手套',
//         prodcutSpec: '7# 有粉',
//         storage: 150,
//         purchaseCount: 1193,
//         supplierName: '南京康医健商贸有限公司',
//         brand: '华新',
//         componyName: '上海华新医材有限公司',
//       },
//       {
//         rank: 3,
//         prodcutName: '脑棉片',
//         prodcutSpec: '2.5*8(灭菌带线）',
//         storage: 155,
//         purchaseCount: 1112,
//         supplierName: '南京百奥生物科技有限公司',
//         brand: '飘安',
//         componyName: '河南飘安集团有限公司',
//       },
//       {
//         rank: 4,
//         prodcutName: '彭氏多功能手术解剖器',
//         prodcutSpec: '2500mm',
//         storage: 150,
//         purchaseCount: 1050,
//         supplierName: '江苏普渡医疗科技有限公司',
//         brand: '舒友',
//         componyName: '浙江舒友仪器设备有限公司',
//       },
//       {
//         rank: 5,
//         prodcutName: '一次性使用灭菌橡胶外科手套',
//         prodcutSpec: '6.5# 无粉',
//         storage: 80,
//         purchaseCount: 982,
//         supplierName: '苏高新健康产业发展（苏州）有限公司',
//         brand: '华新',
//         componyName: '上海华新医材有限公司',
//       },
//       {
//         rank: 6,
//         prodcutName: '无菌保护套（无影灯罩套）',
//         prodcutSpec: '直径：12cm',
//         storage: 130,
//         purchaseCount: 953,
//         supplierName: '南京立腾医疗科技有限公司',
//         brand: '振德',
//         componyName: '绍兴振德医用敷料有限公司',
//       },
//       {
//         rank: 7,
//         prodcutName: '一次性使用医用棉垫',
//         prodcutSpec: '60*60 无纺布',
//         storage: 123,
//         purchaseCount: 911,
//         supplierName: '上海乾昱隆医疗科技有限公司',
//         brand: '康宝',
//         componyName: '江苏康宝医疗器械有限公司',
//       },
//       {
//         rank: 8,
//         prodcutName: '一次性使用手术电极（舒友）',
//         prodcutSpec: 'SY-03X-A',
//         storage: 119,
//         purchaseCount: 897,
//         supplierName: '南京曼科医疗设备有限公司',
//         brand: '舒友',
//         componyName: '浙江舒友仪器设备有限公司',
//       },
//       {
//         rank: 9,
//         prodcutName: '医用手术巾',
//         prodcutSpec: '3*10-8p/3片 灭菌',
//         storage: 134,
//         purchaseCount: 857,
//         supplierName: '盐城市瑞麟辰辉医疗器械有限公',
//         brand: '振德',
//         componyName: '振德医疗用品股份有限公司',
//       },
//       {
//         rank: 10,
//         prodcutName: '一次性使用灭菌橡胶外科手套',
//         prodcutSpec: '6# 有粉',
//         storage: 120,
//         purchaseCount: 830,
//         supplierName: '南京纳瑞升贸易有限公司',
//         brand: '华新',
//         componyName: '上海华新医材有限公司',
//       },
//     ];
//     // 随机5个数据

//     ChcGridApi.grid.reloadData(arr);
//   }, 500);
// });
</script>

<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="py-4">
      <CardTitle class="text-lg">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent class="flex flex-1 flex-wrap p-5 pt-0">
      <ChcGrid class="h-full w-full" />
    </CardContent>
  </Card>
</template>
