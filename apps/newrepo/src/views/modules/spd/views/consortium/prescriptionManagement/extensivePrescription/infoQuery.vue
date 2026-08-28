<script lang="ts" setup>
import type { ActionKey, PageType } from './type';

import { computed, h, onMounted, unref } from 'vue';
import { useRoute } from 'vue-router';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { createActionBtn } from './actionStrategy';
import {
  getStatusColor,
  queryCommonFormOptions,
  queryGridColumns,
} from './index';
import { executeAction, getPageStrategy } from './pageStrategy';
import { PageEnum } from './type';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);

/**
 * 外延处方编辑|签收|发放
 * basic(编辑) sign(签收) send(发放)
 */
const route = useRoute();

/**
 * Router 默认可能复用组件实例
 * 让pageType 成为响应式的(使用computed),依赖它的配置自动更新
 */
const pageType = computed(() => {
  const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
  console.warn('urlParams', urlParams);
  return (urlParams.type || 'edit') as PageType;
});

// url 根据页面类型动态切换查询接口
const queryPageUrl = computed(() => {
  return pageType.value === 'sign'
    ? '/prescriptionAction/queryByDeliveryNo'
    : '/prescriptionAction/query';
});

// PreStatus 状态查询参数
const queryPreStatus = computed(() => {
  // 待收(签收)2   待取(发放)3
  // return pageType.value === 'sign' ? '2' : pageType.value === 'send' ? '3' : '';
  if (pageType.value === 'sign') return '2';
  if (pageType.value === 'send') return '3';
  return '';
});

// 构建表格列
const gridColumns = computed(() => {
  // 获取静态列
  const staticColumns = queryGridColumns(pageType.value) || [];
  const strategy = getPageStrategy(pageType.value);

  const actionKey = strategy.actionButtons || [];
  // 定义操作列
  const actionColumn = {
    fixed: 'right',
    title: '操作',
    minWidth: pageType.value === PageEnum.EDIT ? 80 : 160,
    align: 'center',
    field: 'action',
    slots: {
      default: ({ row, rowIndex }: { row: any; rowIndex: number }) => {
        // 遍历生成按钮 VNode
        const buttons = actionKey.map((key) => {
          return createActionBtn(key, rowIndex, () => handleAction(row, key));
        });
        return buttons.length > 0
          ? h('div', { class: 'flex justify-center gap-2' }, buttons)
          : null;
      },
    },
  };
  return [...staticColumns, actionColumn];
});

// 按钮的跳转逻辑
const handleAction = async (row: any, key: ActionKey) => {
  const formValues = await chcGridApi.formApi.getValues();
  // 执行对应页面类型的操作
  await executeAction(pageType.value, key, {
    row,
    formValues,
    refreshTable,
    props,
  });
};

// 选中的行数量
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      fieldMappingTime: [['dateRange', ['beginDate', 'endDate'], 'YYYY-MM-DD']],
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: false,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle({ row, column }: { column: any; row: any }) {
        if (column.field === 'preStatus') {
          const code = row.preStatus;
          const color = getStatusColor(code);
          return color ? { color } : {};
        }
      },
    }),
  },
  {
    id: 'extensivePrescriptionGrid',
    // api地址
    queryUrl: unref(queryPageUrl),
    // 表单配置
    formSchema: queryCommonFormOptions(pageType.value),
    gridColumns: unref(gridColumns), // 使用 unref 或 .value 确保传入的是数组，而不是 Ref 对象
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      return {
        ...params,
        PreStatus: queryPreStatus.value,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {},
  },
);

const refreshTable = () => {
  console.warn('refreshTable');
  chcGridApi.formApi.getValues().then((values) => {
    chcGridApi.query(values);
  });
  // chcGridApi.query();
};

// watch(pageType, () => {
//   chcGridApi.reload();
// });

onMounted(() => {
  // getMockData().then((res) => {
  // console.log('res', res);
  // chcGridApi.grid.reloadData(res.rows);
  // });
  chcGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <ChcGrid />
  </div>
</template>

<style lang="less" scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
