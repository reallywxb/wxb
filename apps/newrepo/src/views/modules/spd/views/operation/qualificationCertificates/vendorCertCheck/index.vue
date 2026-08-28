<script lang="ts" setup>
import type { ParentTableType } from './type';

import { h, nextTick, onMounted, provide, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { SvgCloseIcon, SvgSquareTickIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Button,
  message,
  Modal,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
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
  ChcGridApi.query();
  isFirstLoaded.value = true;
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
    id: 'vendorCertPreCheck_parent',
    queryUrl: '/productCertAction/queryBpartnerApply.do',
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
        minWidth: 150,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'productWCCnt',
        minWidth: 200,
        sortable: true,
        title: '待审核产品证照数',
        align: 'right',
      },

      {
        field: 'vendorCertWCCnt',
        minWidth: 200,
        sortable: true,
        title: '待审核供应商证照数',
        align: 'right',
      },
      {
        field: 'manufCertWCCnt',
        minWidth: 200,
        sortable: true,
        title: '待审核生产企业证照数',
        align: 'right',
      },
      {
        field: 'authCertWCCnt',
        title: '待审核授权企业证照数',
        sortable: true,
        width: '200',
        align: 'right',
      },
      {
        field: 'authorizeWCCnt',
        title: '待审核授权书数',
        sortable: true,
        width: '200',
        align: 'right',
      },
      {
        field: 'productItemCount',
        width: '200',
        sortable: true,
        title: '供货商品数',
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
        if (isEmpty(row)) {
          return;
        }
        // 存储选中的行数据
        selectedParentRow.value = deepClone(row);
        // 请求子表  多个子表请求
        handleChildTableQuery();
      },
      // 添加行样式处理选中行高亮
      // rowStyle: ({ row }: { row: any }) => {
      // },
    },
    // tableSearchExtraParams: {}, // 接口额外参数
    afterFetchFn: (params) => {
      if (isEmpty(params.rows)) {
        selectedParentRow.value = null;
        // 清空全部子表
        associatedAuthorizationComRef.value?.clearData();
        productionLicenseComRef.value?.clearData();
        productLicenseComRef.value?.clearData();
        supplierLicenseComRef.value?.clearData();
        authorizationBookComRef.value?.clearData();
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
        productLicenseComRef.value?.query({
          vendorId: selectedParentRow.value.bpartnerId,
        });
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

// 子表组件隐射
const TabVal = {
  ProductLicense: 'productLicense', // 产品证照
  SupplierLicense: 'supplierLicense', // 供应商证照
  ProductionLicense: 'productionLicense', // 生产企业证照
  AssociatedAuthorization: 'authorizationLicense', // 授权企业证照
  AuthorizationBook: 'authorizationBook', // 授权书
} as const;

// 子表头部切换
const headerTabs = ref([
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
  TabVal.ProductLicense,
);

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

// 全部通过
const handleAllPass = () => {
  // 先检查是否有选中的行数据
  // const records = ChcGridApi.grid.getCheckboxRecords();
  console.warn('records===>', selectedParentRow.value);
  if (!selectedParentRow.value) {
    message.warning('请选择供应商');
  }
  const bpartnerId = selectedParentRow.value?.bpartnerId;
  if (!bpartnerId) {
    message.warning('缺少供应商编码');
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: '确认通过？',
    onOk: async () => {
      try {
        const params = {
          vendorId: bpartnerId,
          status: urlParams?.status === 'WA' ? 'WC' : 'PS',
          checkRemark: '',
        };
        console.warn('params===>', params);
        await requestFormClient
          .post('/productSyncAction/checkByVendor.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success('批准成功！');
              // 刷新表格数据
              ChcGridApi.query();
            } else {
              message.error(res.msg || '操作失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('确认失败');
      }
    },
  });
};
// 全部拒绝
const handleAllReject = () => {
  // 先检查是否有选中的行数据
  // const records = ChcGridApi.grid.getCheckboxRecords();
  console.warn('records===>', selectedParentRow.value);
  if (!selectedParentRow.value) {
    message.warning('请选择供应商');
  }
  const bpartnerId = selectedParentRow.value?.bpartnerId;
  if (!bpartnerId) {
    message.warning('缺少供应商编码');
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '请输入驳回原因',
    content: h('textarea', {
      id: 'reject-reason',
      placeholder: '',
      rows: 4,
      style: {
        width: '100%',
        padding: '6px 10px',
        border: '1px solid #e6e6e6',
        color: '#333',
        outline: 'none',
      },
      'data-testid': 'textarea_reject_reason',
    }),
    onOk: async () => {
      try {
        const rejectReason = (
          document.querySelector('#reject-reason') as HTMLTextAreaElement
        )?.value;
        const params = {
          vendorId: bpartnerId,
          status: 'NO',
          checkRemark: rejectReason,
        };
        console.warn('params===>', params);
        await requestFormClient
          .post('productSyncAction/checkByVendor.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success('驳回成功！');
              // 刷新表格数据
              ChcGridApi.query();
            } else {
              message.error(res.msg || '操作失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('确认失败');
      }
    },
  });
};

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
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleAllPass"
                data-testid="button_all_pass"
              >
                全部通过
                <template #icon>
                  <SvgSquareTickIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleAllReject"
                data-testid="button_all_reject"
              >
                全部拒绝
                <template #icon>
                  <SvgCloseIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
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
                <productLicenseCom
                  ref="productLicenseComRef"
                  v-show="currentTab === TabVal.ProductLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[0] as PageTab"
                />
                <supplierLicenseCom
                  ref="supplierLicenseComRef"
                  v-show="currentTab === TabVal.SupplierLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[1] as PageTab"
                />
                <productionLicenseCom
                  ref="productionLicenseComRef"
                  v-show="currentTab === TabVal.ProductionLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[2] as PageTab"
                />
                <associatedAuthorizationCom
                  ref="associatedAuthorizationComRef"
                  v-show="currentTab === TabVal.AssociatedAuthorization"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[3] as PageTab"
                />
                <authorizationBookCom
                  ref="authorizationBookComRef"
                  v-show="currentTab === TabVal.AuthorizationBook"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[4] as PageTab"
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
