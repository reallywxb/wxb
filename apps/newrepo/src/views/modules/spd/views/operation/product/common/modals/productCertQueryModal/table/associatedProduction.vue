<script setup lang="ts">
import type { Ref } from 'vue';

import type { ParentTableType } from '../type';

import { inject, onMounted, reactive, watch } from 'vue';

import { IconfontBasicView } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import previewImageUi from '../modal/previewImageModel.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const queryParams = reactive({
  manufacturerId: undefined,
});
const selectedParentRow = inject<Ref<ParentTableType>>('currentReport');
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// const isFirstLoaded = ref(false); // 是否已初次加载完
const [PreviewImageModal, PreviewImageModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: previewImageUi,
});
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
        enabled: false,
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.neerGuaranteeDate === 'Y') {
          return { color: 'red' };
        }
        return {};
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'certTypeName',
        title: '证照类型',
        width: '150',
        sortable: true,
      },
      {
        field: 'certNo',
        title: '证照号码',
        width: '150',
        sortable: true,
      },
      {
        field: 'certDate',
        title: '发证日期',
        width: '150',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '证照效期',
        width: '150',
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
        width: '130',
      },
    ],
    id: 'associatedProduction',
    dataTableId: '/companyAction/queryCert.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
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
const openPreviewImage = (row: any) => {
  console.warn('openLotCert row', row);
  PreviewImageModalApi.setData({
    imageList: row.filePaths,
  }).open();
};
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab-associatedProduction===>', val, oldVal);
    if (val === props.thisTab.value) {
      console.warn('selectedParentRow', selectedParentRow?.value);
      ChcGridApi.query({
        manufacturerId: selectedParentRow?.value?.manufacturerId,
      });
    }
  },
);
defineExpose({
  query(params: Record<string, any>) {
    // 子表请求
    console.warn('关联生产企业证照子表请求被触发===>', params);
    Object.assign(queryParams, params);
    ChcGridApi.query({ ...queryParams });
  },
  remove() {
    ChcGridApi.grid.remove();
  },
});
// 初始化加载
onMounted(() => {
  console.warn('关联生产企业证照子表');
});
</script>
<template>
  <div class="h-full">
    <PreviewImageModal />
    <ChcGrid>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="openPreviewImage(scope.row)"
          :data-testid="`button_viewImage_${scope.rowIndex}_associatedProduction`"
        >
          查看图片
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
