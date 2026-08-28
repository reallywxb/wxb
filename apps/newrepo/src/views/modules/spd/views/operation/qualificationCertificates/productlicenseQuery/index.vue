<script lang="ts" setup>
import type { ParentTableType } from './type';

import { nextTick, onMounted, provide, ref, useTemplateRef } from 'vue';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, RadioButton, RadioGroup } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';
import PreviewImageCom from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue';

import associatedAuthorizationCom from './table/associatedAuthorization.vue'; // 关联授权书
import associatedProductionCom from './table/associatedProduction.vue'; // 关联生产企业证照
import otherProductsCom from './table/otherProducts.vue'; // 产品其他证照
import relatedBreedCom from './table/relatedBreed.vue'; // 关联品种
import supplierLicenseCom from './table/supplierLicense.vue'; // 供应商证照

const userStore = useUserStore();

// 存储当前选中的父表行数据
const selectedParentRow = ref<null | ParentTableType>(null);
const selectedCertNo = ref<string>(''); // 存储选中行的certNo，用于高亮
const isFirstLoaded = ref(false); // 是否已初次加载完
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  // ChcGridApi.query();
  // isFirstLoaded.value = true;
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});

// 关联图片预览组件
const [previewImageModel, previewImageModelApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: PreviewImageCom,
  draggable: true,
});

// 父表
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [],
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
    id: 'productlicenseQueryParent',
    queryUrl: '/certAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'bpartnerName',
        minWidth: 150,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'certNo',
        minWidth: 150,
        sortable: true,
        title: '证照号码',
      },

      {
        field: 'productName',
        minWidth: 150,
        sortable: true,
        title: '产品名称',
      },
      {
        field: 'manufacturerName',
        minWidth: 200,
        sortable: true,
        title: '生产企业',
      },
      {
        field: 'certDate',
        title: '发证日期',
        sortable: true,
        width: '100',
      },
      {
        field: 'certValidTo',
        title: '有效日期',
        sortable: true,
        width: '100',
      },
      {
        field: 'productTypeName',
        width: '100',
        sortable: true,
        title: '产品类型',
      },
      {
        field: 'certTypeName',
        width: '100',
        sortable: true,
        title: '证照类型',
      },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: '备注',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 130,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'certNo',
        label: '证照号码',
        componentProps: {
          placeholder: '请输入证照号码',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000477',
            placeholder: '',
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
        fieldName: 'certType',
        label: '证照类型',
      },
      {
        component: 'Input',
        fieldName: 'manufacturerName',
        label: '生产企业名称',
        labelClass: 'w-[90px]',
        componentProps: {
          placeholder: '请输入生产企业名称',
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '发证日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'week')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '产品名称',
        componentProps: {
          placeholder: '请输入产品名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'productCode',
        label: '产品编码',
        componentProps: {
          placeholder: '请输入产品编码',
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'certValid',
        label: '有效日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'week')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=192',
            placeholder: '',
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
        fieldName: 'bpartnerId',
        label: '供应商',
      },
    ],
    gridEvents: {
      checkboxChange: ({ row, checked }: { checked: boolean; row: any }) => {
        console.warn('checkboxChange===>', checked, row);
      },
      radioChange: ({ row }: { row: ParentTableType }) => {
        console.warn('radioChange', row);
        if (row) {
          // 存储选中的行数据
          selectedParentRow.value = row;
          selectedCertNo.value = row.certNo;
          // 请求子表  多个子表请求
          handleChildTableQuery();
        } else {
          // 父表没数据，子表要清空
          selectedParentRow.value = null;
          selectedCertNo.value = '';
          // 清空子表数据
          handleChildTableRemove();
        }
      },
      // 添加行样式处理选中行高亮
      rowStyle: ({ row }: { row: any }) => {
        if (selectedCertNo.value && row.certNo === selectedCertNo.value) {
          return {
            backgroundColor: 'red',
          };
        }
        return {};
      },
    },
    // tableSearchExtraParams: {}, // 接口额外参数
    afterFetchFn: (params) => {
      // 清空子表数据
      handleReloadChildTable();
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
      if (associatedAuthorizationComRef.value) {
        // 确保productId存在再调用
        if (selectedParentRow.value.productId) {
          associatedAuthorizationComRef.value?.leftQuery({
            productId: selectedParentRow.value.productId,
          });
        }
        // 即使没有authorizeId也应该调用，让子组件自己处理空值情况
        associatedAuthorizationComRef.value?.rightQuery({
          authorizeId: selectedParentRow.value.authorizeId || '',
        });
      }
      break;
    }
    case TabVal.AssociatedProduction: {
      if (
        associatedProductionComRef.value &&
        selectedParentRow.value.manufacturerId
      ) {
        associatedProductionComRef.value?.query({
          manufacturerId: selectedParentRow.value.manufacturerId,
        });
      }
      break;
    }
    case TabVal.OtherProducts: {
      if (otherProductsComRef.value && selectedParentRow.value.productId) {
        otherProductsComRef.value?.query({
          productId: selectedParentRow.value.productId,
        });
      }
      break;
    }
    case TabVal.RelatedBreed: {
      if (relatedBreedComRef.value && selectedParentRow.value.productId) {
        relatedBreedComRef.value?.query({
          productId: selectedParentRow.value.productId,
        });
      }
      break;
    }
    case TabVal.SupplierLicense: {
      if (supplierLicenseComRef.value && selectedParentRow.value.bpartnerId) {
        supplierLicenseComRef.value?.query({
          bpartnerId: selectedParentRow.value.bpartnerId,
          isVendor: 'Y',
        });
      }
      break;
    }
  }
};

// 清空对应自组加数据逻辑
const handleChildTableRemove = () => {
  switch (currentTab.value) {
    case TabVal.AssociatedAuthorization: {
      associatedAuthorizationComRef.value?.remove();
      break;
    }
    case TabVal.AssociatedProduction: {
      associatedProductionComRef.value?.remove();
      break;
    }
    case TabVal.OtherProducts: {
      otherProductsComRef.value?.remove();
      break;
    }
    case TabVal.RelatedBreed: {
      relatedBreedComRef.value?.remove();
      break;
    }
    case TabVal.SupplierLicense: {
      supplierLicenseComRef.value?.remove();
      break;
    }
  }
};

const handleReloadChildTable = () => {
  associatedAuthorizationComRef.value?.reload();
  associatedProductionComRef.value?.reload();
  otherProductsComRef.value?.reload();
  relatedBreedComRef.value?.reload();
  supplierLicenseComRef.value?.reload();
};

// 子表组件隐射
const TabVal = {
  SupplierLicense: 'supplierLicense',
  RelatedBreed: 'relatedBreed',
  AssociatedProduction: 'associatedProduction',
  AssociatedAuthorization: 'associatedAuthorization',
  OtherProducts: 'otherProducts',
} as const;

// 子表头部切换
const headerTabs = ref([
  {
    label: '供应商证照',
    value: 'supplierLicense',
    disabled: false,
  },
  {
    label: '关联品种',
    value: 'relatedBreed',
    disabled: false,
  },
  {
    label: '关联生产企业证照',
    value: 'associatedProduction',
    disabled: false,
  },
  {
    label: '关联授权书',
    value: 'associatedAuthorization',
    disabled: false,
  },
  {
    label: '产品其他证照',
    value: 'otherProducts',
    disabled: false,
  },
]);

const currentTab = ref<(typeof TabVal)[keyof typeof TabVal]>(
  TabVal.SupplierLicense,
);

const supplierLicenseComRef = useTemplateRef<
  InstanceType<typeof supplierLicenseCom>
>('supplierLicenseComRef');

const otherProductsComRef = useTemplateRef<
  InstanceType<typeof otherProductsCom>
>('otherProductsComRef');

const relatedBreedComRef =
  useTemplateRef<InstanceType<typeof relatedBreedCom>>('relatedBreedComRef');

const associatedAuthorizationComRef = useTemplateRef<
  InstanceType<typeof associatedAuthorizationCom>
>('associatedAuthorizationComRef');

const associatedProductionComRef = useTemplateRef<
  InstanceType<typeof associatedProductionCom>
>('associatedProductionComRef');

const handleView = (row: any) => {
  console.warn('row', row);
  previewImageModelApi
    .setData({
      imageList: row.filePaths,
    })
    .open();
};

// 监听tab切换，重新查询子表数据
// watch(currentTab, (newVal, oldVal) => {
//   if (newVal !== oldVal) {
//     // 确保组件已经渲染
//     nextTick(() => {
//       handleChildTableQuery();
//     });
//   }
// });

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
          <previewImageModel />

          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleExport"
                class="mr-[0.5rem]"
                data-testid="button_export_productlicenseQuery"
              >
                导 出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleView(scope.row)"
                :data-testid="`button_view_${scope.rowIndex}_productlicenseQuery`"
              >
                查看图片
                <template #icon>
                  <IconfontBasicView />
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
              <RadioGroup v-model:value="currentTab" button-style="solid">
                <template v-for="item in headerTabs" :key="item.value">
                  <RadioButton
                    :value="item.value"
                    :disabled="item.disabled"
                    :data-testid="`radioButton_${item.value}_productlicenseQuery`"
                  >
                    {{ item.label }}
                  </RadioButton>
                </template>
              </RadioGroup>
            </div>
            <div class="bg-pink relative box-border w-full flex-1">
              <div class="absolute box-border h-full w-full">
                <!-- <component :is="component"></component> -->
                <supplierLicenseCom
                  ref="supplierLicenseComRef"
                  v-show="currentTab === TabVal.SupplierLicense"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[0] as PageTab"
                />
                <relatedBreedCom
                  ref="relatedBreedComRef"
                  v-show="currentTab === TabVal.RelatedBreed"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[1] as PageTab"
                />
                <associatedProductionCom
                  ref="associatedProductionComRef"
                  v-show="currentTab === TabVal.AssociatedProduction"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[2] as PageTab"
                />
                <associatedAuthorizationCom
                  ref="associatedAuthorizationComRef"
                  v-if="currentTab === TabVal.AssociatedAuthorization"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[3] as PageTab"
                />
                <otherProductsCom
                  ref="otherProductsComRef"
                  v-show="currentTab === TabVal.OtherProducts"
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
