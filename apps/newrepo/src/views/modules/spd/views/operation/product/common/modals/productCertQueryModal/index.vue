<script lang="ts" setup>
import { nextTick, provide, ref, useTemplateRef } from 'vue';

import { IconfontBasicView } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, RadioButton, RadioGroup } from 'ant-design-vue';

import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import previewImageModelUI from './modal/previewImageModel.vue';
import associatedAuthorizationCom from './table/associatedAuthorization.vue'; // 关联授权书
import associatedProductionCom from './table/associatedProduction.vue'; // 关联生产企业证照
import otherProductsCom from './table/otherProducts.vue'; // 产品其他证照
import relatedBreedCom from './table/relatedBreed.vue'; // 关联品种
import supplierLicenseCom from './table/supplierLicense.vue'; // 供应商证照

const modalData = ref<Record<string, any>>({});

// 存储当前选中的父表行数据
const selectedParentRow = ref<any | null>(null);
const selectedCertNo = ref<string>(''); // 存储选中行的certNo，用于高亮

// 关联图片预览组件
const [previewImageModel, previewImageModelApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImageModelUI,
  draggable: true,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: false,
      },
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
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },

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
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
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
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn', {
        ...params,
        productCode: modalData.value.productCode,
      });
      return {
        ...params,
        productCode: modalData.value.productCode,
      };
    },
    // tableSearchExtraParams: {}, // 接口额外参数
    afterFetchFn: (params) => {
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

// 定义子表接口入参
provide('currentReport', selectedParentRow);

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange：打开状态改变', modalData);
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      // imgUrl.value = modalData.url;
      // console.warn('onOpenChange：打开状态改变', imgUrl.value);
    }
  },
});
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="商品证照一览"
  >
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
            <template #action="scope">
              <Button
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleView(scope.row)"
                :data-testid="`button_viewImage_${scope.rowIndex}`"
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
                    :data-testid="`radioButton_${item.value}`"
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
  </Modal>
</template>
