<script lang="ts" setup>
import { h, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import previewImage from '#/views/modules/spd/views/common/previewImages/index.vue';

import { RouteMappingManager } from '../routeMapping';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const routeManager = new RouteMappingManager(route.name as string);
const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const isMoving = urlParams?.isMoving || '';
// const m = urlParams?.m === 'w2' ? 'w2' : 'w1';
// const isNarcotic = urlParams?.isNarcotic || '';

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi.query({
    ...formValues,
    warehouseId: route.query.warehouseId || formValues?.warehouseId,
    productName: route.query.productName || formValues?.productName,
    lot: route.query.lot || formValues?.lot,
  });
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  if (
    route.query.autoLoad === 'Y' ||
    (route.query.autoLoad as any) === true ||
    route.query.autoLoad === 'true'
  ) {
    searchController.sign(3);
  }
});

/**
 * 通用的批次查询跳转函数
 */
const navigateToDetailQuery = (row: any, options?: any) => {
  router.push({
    path: routeManager.getRoute('storageDetailQuery'),
    query: {
      autoLoad: 'Y',
      warehouseId: row.warehouseId,
      productName: row.productCode ? `=${row.productCode}` : '',
      lot: row.lot ? `=${row.lot}` : '',
      vendorId: row.vendorId,
      isReload: 'Y',
      ...options,
    },
  });
};

const [ChcGrid, ChcGridApi, { FormModal, LogModal, handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
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
      cellStyle: ({ row }: { row: any }) => {
        if (row.neerGuaranteeDate === 'Y') {
          return { color: 'red' };
        }
        const levelMin = row.levelMin || 0;

        if (
          row.qtyAvailable &&
          (row.qtyAvailable < levelMin ||
            row.storageStatus === 'D' ||
            row.storageStatus === 'R')
        ) {
          return { color: 'red' };
        }
        return {};
      },
    }),
  },
  {
    id: 'lotQuery',
    // api地址
    queryUrl: '/storageAction/queryStorageLot.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '140',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        width: '150',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '150',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  navigateToDetailQuery(scope.row);
                },
                'data-testid': `button_lot_${scope.rowIndex}_lotQuery`,
              },
              { default: () => scope.row.lot },
            );
          },
        },
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '在库数量',
        width: 90,
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  navigateToDetailQuery(scope.row);
                },
                'data-testid': `button_qty_on_hand_${scope.rowIndex}_lotQuery`,
              },
              { default: () => scope.row.qtyOnHand },
            );
          },
        },
      },
      {
        field: 'qtyOnHandMPackage',
        title: '在库中包数',
        width: 100,
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格', scope.row);
                },
                'data-testid': `button_qty_on_hand_mpackage_${scope.rowIndex}_lotQuery`,
              },
              { default: () => scope.row.qtyOnHandMPackage },
            );
          },
        },
      },
      {
        field: 'qtyMoving',
        title: '在途数量',
        width: 90,
        align: 'right',
        visible: isMoving === 'N',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  navigateToDetailQuery(scope.row);
                },
                'data-testid': `button_qty_moving_${scope.rowIndex}_lotQuery`,
              },
              { default: () => scope.row.qtyMoving },
            );
          },
        },
      },
      {
        field: 'qtyBundleOnHand',
        title: '库存整件数量',
        width: 120,
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格', scope);
                  router.push({
                    path: '/warehouse/package/query',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      lot: scope.row.lot ? `=${scope.row.lot}` : '',
                      vendorId: scope.row.vendorId,
                      // locatorId:data.data.locatorId,
                      storageStatus: scope.row.storageStatus,
                      packageStatus: 'S',
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_qty_bundle_on_hand_${scope.rowIndex}_lotQuery`,
              },
              { default: () => scope.row.qtyBundleOnHand },
            );
          },
        },
      },
      {
        field: 'qtyScatterOnHand',
        title: '库存散件数量',
        width: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyBundleMoving',
        title: '在途整件数量',
        width: 120,
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格', scope);
                  router.push({
                    path: '/warehouse/package/query',
                    query: {
                      autoLoad: 'Y',
                      warehouseId: scope.row.warehouseId,
                      productName: `=${scope.row.productCode}`,
                      lot: scope.row.lot ? `=${scope.row.lot}` : '',
                      vendorId: scope.row.vendorId,
                      // locatorId:data.data.locatorId,
                      storageStatus: scope.row.storageStatus,
                      packageStatus: 'S',
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_qty_bundle_moving_${scope.rowIndex}_lotQuery`,
              },
              { default: () => scope.row.qtyBundleMoving },
            );
          },
        },
      },
      {
        field: 'qtyScatterMoving',
        title: '在途散件数量',
        width: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageConditionName',
        title: '存储条件',
        width: '100',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '75',
        align: 'right',
        formatter: ({ cellValue }: { cellValue: number }) => {
          return handlePriceToFixedTwo(cellValue);
        },
        sortable: true,
      },
      {
        field: 'isFee',
        title: '计费',
        width: '70',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isBulkPurchase',
        title: '带量采购',
        width: '90',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'insurancePaymentTypeName',
        title: '医保支付类别',
        width: '120',
        sortable: true,
      },
      {
        field: 'insurancePaymentRate',
        title: '医保自付比例',
        width: '120',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '注册证号',
        width: '100',
        sortable: true,
      },
      {
        field: 'isNarcotic',
        title: '麻精',
        width: '70',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isDisinfectant',
        title: '消毒液',
        width: '70',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        fixed: 'right',
        title: '操作',
        minWidth: 200,
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: `请选择院区`,
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              const defaultWarehouseId = route.query.warehouseId
                ? Number.parseFloat(route.query.warehouseId as string)
                : '';
              if (isEmpty(defaultWarehouseId)) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                );
              } else {
                ChcGridApi.formApi?.setFieldValue('departmentId', '');
              }

              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        defaultValue: route.query.warehouseId
          ? Number.parseFloat(route.query.warehouseId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                );
              } else {
                const defaultWarehouseId = route.query.warehouseId
                  ? Number.parseFloat(route.query.warehouseId as string)
                  : '';
                if (isEmpty(defaultWarehouseId)) {
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
                  );
                } else {
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    defaultWarehouseId,
                  );
                }
              }

              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return {
                ...res,
                rows: undefined,
                records: (res.rows || []).map((item: any) => ({
                  ...item,
                  id: Number.parseFloat(item.id),
                })),
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: route.query.productName || '',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '药品组',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/productAction/productControlLevelList.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productCategoryId',
        label: '药品类别',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        defaultValue: route.query.lot || '',
      },
      {
        component: 'Input',
        fieldName: 'certificateNo',
        label: '注册证号',
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isBulkPurchase',
        label: '带量采购',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isNarcotic',
        label: '麻精',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isDisinfectant',
        label: '消毒液',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'storageStatus',
        label: '库存状态',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },

      {
        component: 'Checkbox',
        fieldName: 'isShowZero',
        label: '显示零库存',
        defaultValue: false,
        // componentProps: () => {
        //   return {

        //     defaultValue: true,
        //     checked: true,
        //   };
        // },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn params', params);
      params.isShowZero = params.isShowZero ? 'Y' : undefined;
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn params', params);

      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImage,
  draggable: true,
});

const openLotCert = async (row) => {
  console.warn('openLotCert row', row);
  row.loading = true;
  try {
    const res = await requestFormClient.get(
      `/storageAction/viewInspectReport.do?siteCode=${row.productServerCode}&productCode=${row.productCode}&lot=${row.lot}&index=0`,
    );
    const imageList = (res?.filePaths || []).map((item: any, index: number) => {
      return {
        path: item?.path,
        id: index,
      };
    });

    previewImageModalApi
      .setData({
        imageList,
      })
      .open();
  } catch (error) {
    console.warn('openLotCert error', error);
  } finally {
    row.loading = false;
  }
};
const goLotTrace = (row: any) => {
  console.warn('goLotTrace row', row);
  router.push({
    path: '/warehouse/storage/productTrace',
    query: {
      autoLoad: 'Y',
      warehouseId: row.warehouseId,
      productName: `=${row.productCode}`,
      vendorId: row.vendorId,
      lot: `=${row.lot}`,
      // asiPrice: obj.data.price,
      isReload: 'Y',
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <LogModal />
    <FormModal />
    <PreviewImageModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="goLotTrace(scope.row)"
        >
          批号追溯
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="openLotCert(scope.row)"
        >
          检验报告
          <template #icon>
            <IconfontBasicView />
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
</style>
