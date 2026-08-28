<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import addModalUi from './modals/addModal.vue';

const userStore = useUserStore();

const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

console.warn('urlParams', urlParams);

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});
const [AddModal, addModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addModalUi,
  draggable: true,
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      showCollapseButton: false,
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
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'productyp',
    // api地址
    queryUrl: '/ygcgProductAction/queryYPProducts.do',
    gridColumns: [
      {
        type: 'radio',
        width: 50,
        align: 'center',
        title: '单选',
        visible: false,
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },
      { field: 'orgName', title: '医院', width: '150', sortable: true },
      { field: 'goodsId', title: '产品Id', width: '10%', sortable: true },
      { field: 'productName', title: '通用名', width: '10%', sortable: true },
      { field: 'goodsName', title: '商品名', width: '10%', sortable: true },
      { field: 'provinceId', title: '省标代码', width: '10%', sortable: true },
      { field: 'medicinemodel', title: '剂型', width: '10%', sortable: true },
      { field: 'outlookc', title: '规格', width: 90, sortable: true },
      { field: 'factor', title: '转换比', width: 90, sortable: true },
      {
        field: 'materialName',
        title: '包装材质',
        width: '10%',
        sortable: true,
      },
      { field: 'unit', title: '单位', width: 90, sortable: true },
      {
        field: 'companyIdSc',
        title: '生产企业编码',
        width: '10%',
        sortable: true,
      },
      {
        field: 'companyNameSc',
        title: '生产企业名称',
        width: '10%',
        sortable: true,
      },
      {
        field: 'purchaseType',
        title: '采购类别',
        width: '10%',
        sortable: true,
      },
      { field: 'sourceName', title: '来源名称', width: '10%', sortable: true },
      { field: 'middlePack', title: '中包装', width: '10%', sortable: true },
      { field: 'maxPack', title: '大包装', width: '10%', sortable: true },
      {
        field: 'companyIdPs',
        title: '配送企业编号',
        width: '10%',
        sortable: true,
      },
      {
        field: 'companyNamePs',
        title: '配送企业名称',
        width: '10%',
        sortable: true,
      },
      { field: 'price', title: '采购限价', width: '10%', sortable: true },
      {
        field: 'purchasePrice',
        title: '采购价格',
        width: 90,
        sortable: true,
      },
      {
        field: 'filingApplyId',
        title: '备案申请编号',
        width: '10%',
        sortable: true,
      },
      {
        field: 'filingAuditCount',
        title: '临时备案审批数量',
        width: '160',
        sortable: true,
      },
      { field: 'isUsing', title: '是否使用', width: 90, sortable: true },
      { field: 'addTime', title: '添加时间', width: '10%', sortable: true },
      { field: 'lastUpDateTime', title: '更新时间', width: '10%' },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '医院',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/orgList.do',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       autoChooseFirstOption: true,
      //       dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
      //       placeholder: `请选择仓库`,
      //       paginate: false,
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       mode: 'multiple',
      //       maxTagCount: 1,
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'warehouseId',
      //   label: '仓库',
      // },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '名称',
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
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
// TODO: 获取数据 旧项目无数据
const handleAdd = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院');
  }
  addModalApi
    .setData({
      orgId: formValues.orgId,
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <AddModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          获取
        </Button>

        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
