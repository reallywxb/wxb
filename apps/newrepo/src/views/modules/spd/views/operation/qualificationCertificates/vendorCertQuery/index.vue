<script lang="ts" setup>
import type { ParentTableType } from './type';

import { nextTick, onMounted, provide, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { RadioButton, RadioGroup } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepClone, deepMerge } from '#/utils/util';

import associatedAuthorizationCom from './table/associatedAuthorization.vue'; // 授权企业证照
import authorizationBookCom from './table/authorizationBook.vue'; // 授权书
import productionLicenseCom from './table/productionLicense.vue'; // 生产企业证照
import productLicenseCom from './table/productLicense.vue'; // 产品证照
import suppliedGoodsCom from './table/suppliedGoods.vue'; // 供货商品
import supplierLicenseCom from './table/supplierLicense.vue'; // 供应商证照

const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
// 存储当前选中的父表行数据
const selectedParentRow = ref<null | ParentTableType>(null);
const isFirstLoaded = ref(false); // 是否已初次加载完
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
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
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
      // cellStyle: ({ row }: { row: any }) => {},
    }),
  },
  {
    id: 'vendorCertQuery_parent',
    queryUrl: '/productCertAction/queryBpartnerCert.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      {
        field: 'bpartnerName',
        minWidth: 260,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'supplyProdCnt',
        minWidth: 200,
        sortable: true,
        title: '供货商品数',
        align: 'right',
      },

      {
        field: 'noCertProdCnt',
        minWidth: 200,
        sortable: true,
        title: '无证照商品数',
        align: 'right',
      },
      {
        field: 'thirtyTipCnt',
        minWidth: 200,
        sortable: true,
        title: '30天到期商品数',
        align: 'right',
      },
      {
        field: 'ninetyTipCnt',
        title: '90天到期商品数',
        sortable: true,
        width: '200',
        align: 'right',
      },
      {
        field: 'prodCnt',
        title: '产品证照数',
        sortable: true,
        width: '200',
        align: 'right',
      },
      {
        field: 'vcomCnt',
        width: '200',
        sortable: true,
        title: '供应商证照数',
        align: 'right',
      },
      {
        field: 'mcomCnt',
        width: '200',
        sortable: true,
        title: '生产企业证照数',
        align: 'right',
      },
      {
        field: 'tcomCnt',
        width: '200',
        sortable: true,
        title: '授权企业证照数',
        align: 'right',
      },
      {
        field: 'authCnt',
        width: '200',
        sortable: true,
        title: '授权书数',
        align: 'right',
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=192',
            placeholder: '请选择供应商',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'vendorId',
        label: '供应商',
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: ParentTableType }) => {
        console.warn('radioChange===>', row);
        if (isEmpty(row)) return;
        // 存储选中的行数据
        selectedParentRow.value = deepClone(row);
        // 请求子表  多个子表请求
        handleChildTableQuery();
      },
    },
    // tableSearchExtraParams: {}, // 接口额外参数
    afterFetchFn: (params) => {
      if (isEmpty(params.rows)) {
        selectedParentRow.value = null;
        handleReomoveChildData();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 抽取子表查询逻辑
const handleChildTableQuery = async () => {
  if (!selectedParentRow.value) {
    return;
  }

  console.warn('子表请求 currentTab', currentTab.value);

  // 确保子组件已经渲染
  await nextTick();

  switch (currentTab.value) {
    case TabVal.AssociatedAuthorization: {
      if (
        associatedAuthorizationComRef.value && // 确保bpartnerId存在再调用
        selectedParentRow.value.bpartnerId
      ) {
        associatedAuthorizationComRef.value?.query();
      }
      break;
    }
    case TabVal.AuthorizationBook: {
      if (authorizationBookComRef.value && selectedParentRow.value.bpartnerId) {
        authorizationBookComRef.value?.query();
      }
      break;
    }
    case TabVal.ProductionLicense: {
      if (productionLicenseComRef.value && selectedParentRow.value.bpartnerId) {
        productionLicenseComRef.value?.query();
      }
      break;
    }
    case TabVal.ProductLicense: {
      if (productLicenseComRef.value && selectedParentRow.value.bpartnerId) {
        productLicenseComRef.value?.query();
      }
      break;
    }
    case TabVal.SuppliedGoods: {
      if (
        suppliedGoodsComRef.value && // 确保bpartnerId存在再调用
        selectedParentRow.value.bpartnerId
      ) {
        suppliedGoodsComRef.value?.query();
      }
      break;
    }
    case TabVal.SupplierLicense: {
      if (supplierLicenseComRef.value && selectedParentRow.value.bpartnerId) {
        supplierLicenseComRef.value?.query();
      }
      break;
    }
  }
};

// 清空对应子表的数据
const handleReomoveChildData = () => {
  associatedAuthorizationComRef.value?.clearData();
  authorizationBookComRef.value?.clearData();
  productionLicenseComRef.value?.clearData();
  productLicenseComRef.value?.clearData();
  suppliedGoodsComRef.value?.clearData();
  supplierLicenseComRef.value?.clearData();
};

// 子表组件隐射
const TabVal = {
  SuppliedGoods: 'suppliedGoods', // 供货商品
  ProductLicense: 'productLicense', // 产品证照
  SupplierLicense: 'supplierLicense', // 供应商证照
  ProductionLicense: 'productionLicense', // 生产企业证照
  AssociatedAuthorization: 'authorizationLicense', // 授权企业证照
  AuthorizationBook: 'authorizationBook', // 授权书
} as const;

// 子表头部切换
const headerTabs = ref([
  {
    label: '供货商品',
    value: 'suppliedGoods',
    disabled: false,
  },
  {
    label: '产品证照',
    value: 'productLicense',
    disabled: false,
  },
  {
    label: '供应商证照',
    value: 'supplierLicense',
    disabled: false,
  },
  {
    label: '生产企业证照',
    value: 'productionLicense',
    disabled: false,
  },
  {
    label: '授权企业证照',
    value: 'authorizationLicense',
    disabled: false,
  },
  {
    label: '授权书',
    value: 'authorizationBook',
    disabled: false,
  },
]);

// 子表头部切换默认值
const currentTab = ref<(typeof TabVal)[keyof typeof TabVal]>(
  TabVal.SuppliedGoods,
);

const suppliedGoodsComRef = useTemplateRef<
  InstanceType<typeof suppliedGoodsCom>
>('suppliedGoodsComRef');

const productLicenseComRef = useTemplateRef<
  InstanceType<typeof productLicenseCom>
>('productLicenseComRef');

const authorizationBookComRef = useTemplateRef<
  InstanceType<typeof authorizationBookCom>
>('authorizationBookComRef');

const supplierLicenseComRef = useTemplateRef<
  InstanceType<typeof supplierLicenseCom>
>('supplierLicenseComRef');

const associatedAuthorizationComRef = useTemplateRef<
  InstanceType<typeof associatedAuthorizationCom>
>('associatedAuthorizationComRef');

const productionLicenseComRef = useTemplateRef<
  InstanceType<typeof productionLicenseCom>
>('productionLicenseComRef');

// 定义子表接口入参
provide('currentReport', selectedParentRow);
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden" />
        </template>
        <template #second>
          <div
            class="relative box-border flex h-full w-full flex-col items-start justify-start bg-white"
          >
            <div class="box-border w-full bg-white p-[8.4px_8px]">
              <RadioGroup
                v-model:value="currentTab"
                button-style="solid"
                data-testid="RadioGroup_currentTab"
              >
                <template v-for="item in headerTabs" :key="item.value">
                  <RadioButton
                    :value="item.value"
                    :disabled="item.disabled"
                    :data-testid="`RadioButton_${item.value}`"
                  >
                    {{ item.label }}
                  </RadioButton>
                </template>
              </RadioGroup>
            </div>
            <div class="bg-pink relative box-border w-full flex-1">
              <div class="absolute box-border h-full w-full">
                <!-- <component :is="component"></component> -->
                <suppliedGoodsCom
                  ref="suppliedGoodsComRef"
                  v-show="currentTab === TabVal.SuppliedGoods"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[0] as PageTab"
                />
                <productLicenseCom
                  ref="productLicenseComRef"
                  v-show="currentTab === TabVal.ProductLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[1] as PageTab"
                />
                <supplierLicenseCom
                  ref="supplierLicenseComRef"
                  v-show="currentTab === TabVal.SupplierLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[2] as PageTab"
                />
                <productionLicenseCom
                  ref="productionLicenseComRef"
                  v-show="currentTab === TabVal.ProductionLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[3] as PageTab"
                />
                <associatedAuthorizationCom
                  ref="associatedAuthorizationComRef"
                  v-show="currentTab === TabVal.AssociatedAuthorization"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[4] as PageTab"
                />
                <authorizationBookCom
                  ref="authorizationBookComRef"
                  v-show="currentTab === TabVal.AuthorizationBook"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[5] as PageTab"
                />
              </div>
            </div>
          </div>
        </template>
      </PageSplitLazy>
    </div>
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

/* 父表选中行高亮样式 */
::v-deep(.vxe-row--radio-active) {
  background-color: #d1ecea !important;
}

::v-deep(.vxe-body--row:hover .vxe-cell) {
  background-color: #f0f9ff !important;
}

/* 确保radio列可见 */
::v-deep(.vxe-column--type-radio) {
  display: table-cell !important;
}
</style>
