<script setup lang="ts">
import type { Ref } from 'vue';

import type { ParentTableType } from '../type';

import { inject, onMounted, reactive } from 'vue';

import { IconfontBasicView } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import previewImageUi from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const queryLeftParam = reactive({
  productId: undefined,
});

const queryRightParam = reactive({
  authorizeId: undefined,
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
// 左表
const [ChcGridLeft, ChcGridLeftApi] = useSpdGrid(
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
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'authorizeCompanyName',
        title: '授权企业',
        width: '130',
        sortable: true,
      },
      {
        field: 'certDate',
        title: '开始日期',
        width: '100',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '结束日期',
        width: '100',
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
    id: 'associatedAuthorization_left',
    dataTableId: '/authorizeAction/queryLinkAuthorize.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      return {
        ...params,
        productId:
          selectedParentRow?.value?.productId || queryLeftParam.productId || 0,
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

// 右表
const [ChcGridRight, ChcGridRightApi] = useSpdGrid(
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
    gridEvents: {},
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'authorizeCompanyName',
        title: '授权企业',
        width: '130',
        sortable: true,
      },
      {
        field: 'toAuthorizeCompanyName',
        title: '被授权企业',
        width: '130',
        sortable: true,
      },
      {
        field: 'certDate',
        title: '开始日期',
        width: '100',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '结束日期',
        width: '100',
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
    id: 'associatedAuthorization_right',
    dataTableId: '/authorizeLineAction/queryLinkAuthorizeLine.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      return {
        ...params,
        authorizeId:
          selectedParentRow?.value?.authorizeId ||
          queryRightParam.authorizeId ||
          0,
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
const openPreviewImage = (row: any) => {
  console.warn('openLotCert row', row);
  PreviewImageModalApi.setData({
    imageList: row.filePaths,
  }).open();
};
defineExpose({
  leftQuery(params: Record<string, any>) {
    // 子表请求
    console.warn('子表左侧请求被触发===>', params);
    Object.assign(queryLeftParam, params);
    ChcGridLeftApi.reload({ ...queryLeftParam });
  },
  rightQuery(params: Record<string, any>) {
    // 子表请求
    console.warn('子表右侧请求被触发===>', params);
    Object.assign(queryRightParam, params);
    ChcGridRightApi.reload({ ...queryRightParam });
  },
  remove() {
    ChcGridLeftApi.grid.remove();
    ChcGridRightApi.grid.remove();
  },
  reload() {
    ChcGridLeftApi.grid.reloadData([]);
    ChcGridRightApi.grid.reloadData([]);
  },
});
// 初始化加载
onMounted(() => {
  console.warn('关联授权子表', currentTab.value, props.thisTab);
  console.warn('selectedParentRow', selectedParentRow?.value);
  ChcGridLeftApi.reload({
    productId: selectedParentRow?.value?.productId || 0,
  });
  if (selectedParentRow?.value?.authorizeId) {
    ChcGridRightApi.reload({
      authorizeId: selectedParentRow?.value?.authorizeId || 0,
    });
  } else {
    console.warn('invalid param');
  }
});
</script>
<template>
  <div class="h-full">
    <PreviewImageModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="true"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
      class="authorization-split"
    >
      <template #first>
        <ChcGridLeft>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="openPreviewImage(scope.row)"
              :data-testid="`button_viewImage_left_${scope.rowIndex}_associatedAuthorization`"
            >
              查看图片
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ChcGridLeft>
      </template>
      <template #second>
        <ChcGridRight>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="openPreviewImage(scope.row)"
              :data-testid="`button_viewImage_right_${scope.rowIndex}_associatedAuthorization`"
            >
              查看图片
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ChcGridRight>
      </template>
    </PageSplitLazy>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

/* :v-deep(.pane-1st) {
  width: 40%;
} */
</style>
