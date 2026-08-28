<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';

import { IconfontBasicView } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

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

const queryParams = reactive({
  bpartnerId: undefined,
  isVendor: 'Y',
});

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
      { title: '序号', type: 'seq', width: 50, align: 'center' },
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
        width: '100',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '证照效期',
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
    id: 'supplierLicense',
    dataTableId: '/companyAction/queryCert.do',
    // tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
        ...queryParams,
        bpartnerId: queryParams.bpartnerId || 0,
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
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn('currentTab-supplierLicense===>', val, oldVal);
    if (val === props.thisTab.value && queryParams.bpartnerId) {
      ChcGridApi.reload({
        ...queryParams,
        bpartnerId: queryParams.bpartnerId,
      });
    }
  },
);
defineExpose({
  query(params: Record<string, any>) {
    // 子表请求
    console.warn('supplierLicense子表请求被触发===>', params);
    Object.assign(queryParams, params);
    ChcGridApi.reload({ ...queryParams });
  },
  remove() {
    Object.assign(queryParams, {
      ...queryParams,
      bpartnerId: undefined,
    });
    ChcGridApi.grid.remove();
  },
  reload() {
    queryParams.bpartnerId = undefined;
    ChcGridApi.grid.reloadData([]);
  },
});
// 初始化加载
onMounted(() => {
  console.warn('供应商证照');
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
          :data-testid="`button_viewImage_${scope.rowIndex}_supplierLicense`"
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
