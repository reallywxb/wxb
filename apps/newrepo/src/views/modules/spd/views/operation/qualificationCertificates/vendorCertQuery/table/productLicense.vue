<script setup lang="ts">
import type { Ref } from 'vue';

import type { ParentTableType, ProductCertRowType } from '../type';

import { inject, onMounted, reactive, ref, watch } from 'vue';

import { IconfontBasicView, SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Form, FormItem, Input, Select } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import PreviewImageCom from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue'; // 查看图片

import relatedGoodsCom from '../modal/relatedGoods.vue'; //  关联商品
import ReviewRecordCom from '../modal/reviewRecord.vue'; // 审核记录

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const formState = reactive({
  productName: '', // 产品名称
  certNo: '', // 证照号码
  certvalid: '', // 有效期
});

const selectedParentRow = inject<Ref<ParentTableType>>('currentReport'); // 当前选中的父行数据
const currentTab = defineModel<string>('currentTab', { required: true }); // 当前所在tab的value值
// 弹框组件
const [RelatedGoodsModal, RelatedGoodsModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: relatedGoodsCom,
});
const [PreviewPictureModal, PreviewPictureModalApi] = useVbenModal({
  draggable: true,
  closable: true,
  connectedComponent: PreviewImageCom,
});
const [ReviewRecordModal, ReviewRecordModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: ReviewRecordCom,
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
        enabled: true,
      },
      stripe: false,
      // cellStyle: ({ row }: { row: any }) => {
      //   if (row.neerGuaranteeDate === 'Y') {
      //     return { color: 'red' };
      //   }
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        console.warn('checkboxChange:', records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records, checked }: any) => {
        console.warn('checkboxAll:', checked, records);
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'productName',
        title: '产品名',
        width: '150',
        sortable: false,
      },
      {
        field: 'certType',
        title: '证照类型',
        width: '110',
        sortable: false,
      },
      {
        field: 'certNo',
        title: '证照号',
        width: '110',
        sortable: false,
      },
      {
        field: 'certDate',
        title: '开始时间',
        width: '110',
        sortable: true,
      },
      {
        field: 'certValidTo',
        title: '证照效期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productType',
        title: '产品类型',
        width: '110',
        sortable: false,
      },
      {
        field: 'manufacturerName',
        title: '生产企业',
        width: '110',
        sortable: false,
      },
      {
        field: 'checkUser',
        title: '审核人',
        width: '90',
        sortable: false,
      },
      {
        field: 'checkTime',
        title: '审核时间',
        width: '110',
        sortable: false,
      },
      {
        field: 'description',
        title: '备注',
        width: '120',
        sortable: false,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: '280',
      },
    ],
    formSchema: [],
    id: 'productLicense',
    dataTableId: '/certAction/query.do',
    // tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      return {
        ...params,
        vendorId: selectedParentRow?.value?.bpartnerId || 0,
        bpartnerId: selectedParentRow?.value?.bpartnerId || 0,
        productName: formState.productName,
        certNo: formState.certNo,
        certvalid: formState.certvalid,
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

// 查询
const handleSearch = () => {
  ChcGridApi.reload({
    vendorId: selectedParentRow?.value?.bpartnerId,
    bpartnerId: selectedParentRow?.value?.bpartnerId,
    productName: formState.productName,
    certNo: formState.certNo,
    certvalid: formState.certvalid,
  });
};

// 查看图片
const handlePreviewPictrue = (row: ProductCertRowType) => {
  PreviewPictureModalApi.setData({
    imageList: row.filePaths,
  }).open();
};

// 审查记录
const handleReviewRecord = (row: ProductCertRowType) => {
  ReviewRecordModalApi.setData({
    searchId: row.productId,
  }).open();
};

// 关联商品
const handleRelatedGoods = (row: any) => {
  console.warn('openLotCert row', row);
  RelatedGoodsModalApi.setData({
    searchId: row.productId,
    callback() {
      // ChcGridApi.query({
      //   vendorId: queryParams.vendorId,
      //   productName: queryParams.productName,
      //   certNo: queryParams.certNo,
      // });
    },
  }).open();
};
const certvalidOptions = ref<{ label: string; value: string }[]>([
  { value: '', label: '全部' },
  { value: 'I30', label: '30天之内' },
  { value: 'I90', label: '90天之内' },
  { value: 'OI', label: '已过期' },
]);

// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: string, oldVal: string) => {
    console.warn(
      'currentTab-productLicense===>',
      val,
      oldVal,
      selectedParentRow,
    );
    if (val === props.thisTab.value && selectedParentRow?.value?.bpartnerId) {
      ChcGridApi.reload({
        vendorId: selectedParentRow?.value?.bpartnerId,
        bpartnerId: selectedParentRow?.value?.bpartnerId,
        ...formState,
      });
    }
  },
);

// 初始化加载
onMounted(() => {
  console.warn('产品证照');
});

defineExpose({
  query() {
    // 子表请求
    console.warn('productLicense子表请求被触发===>', selectedParentRow?.value);
    // Object.assign(queryParams, params);
    ChcGridApi.reload({
      vendorId: selectedParentRow?.value?.bpartnerId,
      bpartnerId: selectedParentRow?.value?.bpartnerId,
    });
  },
  clearData() {
    ChcGridApi.grid.remove();
  },
});
</script>
<template>
  <div class="h-full">
    <!-- 查看图片 -->
    <PreviewPictureModal />
    <!-- 审查记录 -->
    <ReviewRecordModal />
    <!-- 关联商品 -->
    <RelatedGoodsModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Form
          style="width: 100%"
          :model="formState"
          @submit="handleSearch"
          name="query_form"
          autocomplete="off"
          layout="inline"
        >
          <FormItem label="证照号码" name="certNo">
            <Input
              v-model:value="formState.certNo"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入证照号码"
              allow-clear
              data-testid="input_certNo_productLicense"
            />
          </FormItem>
          <FormItem label="产品名称" name="productName">
            <Input
              v-model:value="formState.productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入产品名称"
              allow-clear
              data-testid="input_productName_productLicense"
            />
          </FormItem>
          <FormItem
            label="有效期"
            name="certvalid"
            class="mr-[0.5rem] w-[240px]"
          >
            <Select
              v-model:value="formState.certvalid"
              allow-clear
              placeholder="请选择有效期"
              size="middle"
              class="w-full"
              :options="certvalidOptions"
              data-testid="select_certvalid_productLicense"
            />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              html-type="submit"
              class="mr-[0.5rem]"
              data-testid="button_query_productLicense"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </FormItem>
        </Form>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handlePreviewPictrue(scope.row)"
          :data-testid="`button_viewPicture_${scope.rowIndex}_productLicense`"
        >
          查看图片
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleReviewRecord(scope.row)"
          :data-testid="`button_viewRecord_${scope.rowIndex}_productLicense`"
        >
          审查记录
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleRelatedGoods(scope.row)"
          :data-testid="`button_relatedGoods_${scope.rowIndex}_productLicense`"
        >
          关联商品
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
  /* display: none; */
}
</style>
