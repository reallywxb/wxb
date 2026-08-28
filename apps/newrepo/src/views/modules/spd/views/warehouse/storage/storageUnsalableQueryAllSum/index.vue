<script lang="ts" setup>
import { h, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { RouteMappingManager } from '../routeMapping';

const userStore = useUserStore();
console.warn('userStore', userStore);
const router = useRouter();
const route = useRoute();

const routeManager = new RouteMappingManager(route.name as string);
const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as any) || {}; // 路由给过来的参数
const isShowLot = urlParams?.isShowLot || 'Y'; // 默认显示批号效期

onMounted(() => {
  isFirstLoaded.value = true;
});
const qtyOnHand = ref<number>(0);
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
const getWareHouseOptionsWhenDepartmentChange = (options: {
  departmentId: number | string;
  formApi: any;
  url: string;

  warehouseFieldName: string;
}) => {
  const {
    url,
    formApi,
    warehouseFieldName = 'warehouseId',
    departmentId,
  } = options;
  nextTick(() => {
    const c = isFieldComponentRefExist('warehouseId');
    console.warn(
      'getWareHouseOptionsWhenDepartmentChange isFieldComponentRefExist warehouseId',
      c,
    );
    if (c) {
      const refInst = formApi?.getFieldComponentRef(
        warehouseFieldName,
      ) as unknown as SelectComponentRef;
      if (refInst && refInst.params) {
        refInst.params.dictUrl = `${url}&regionId=${departmentId || -1}`;
        if (typeof refInst?.fetchApi === 'function') {
          refInst.fetchApi();
        }
        formApi.setFieldValue(warehouseFieldName, undefined);
      }
    }
  });
};

const [ChcGrid, ChcGridApi, { FormModal, LogModal, handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi?.getValues();
        ChcGridApi.formApi?.setLatestSubmissionValues(toRaw(formValues));
        // 如果没有选择院区，不允许查询
        if (isEmpty(formValues?.departmentId)) {
          message.error('请选择院区！');
          return;
        }
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      // checkboxConfig: {
      //   highlight: false,
      // },
      // radioConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'storageUnsalableQueryAllSum',
    // api地址
    queryUrl: `/storageAction/queryStorageUnsalable.do?isShowLot=${isShowLot}`,
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '120',
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
        // color: 'red',
        minWidth: '200',
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
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'qtyAll',
        title: '库存数量',
        width: '100',
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
                    path: routeManager.getRoute('storageLotQuery'),
                    query: {
                      productName: scope.row.productCode,
                      autoLoad: 'true',
                    },
                  });
                },
                'data-testid': `button_qty_all_${scope.rowIndex}`,
              },
              { default: () => scope.row.qtyAll },
            );
          },
        },
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '100',
        sortable: true,
      },
      // {
      //   field: 'lot',
      //   title: '批号',
      //   width: '100',
      //   visible: isShowLot === 'N',
      //   sortable: true,
      // },
      // {
      //   field: 'guaranteeDate',
      //   title: '效期',
      //   width: '100',
      //   visible: isShowLot === 'N',
      //   sortable: true,
      // },
      {
        field: 'price',
        title: '价格',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageConditionName',
        title: '存储条件',
        minWidth: '100',
        sortable: true,
      },
      // {
      //   field: 'storageStatusName',
      //   title: '库存状态',
      //   visible: isShowLot === 'N',
      //   width: '120',
      //   sortable: true,
      // },
      {
        field: 'salesQty',
        title: '销量',
        width: '80',
        align: 'right',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '业务时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: `请选择院区`,
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              getWareHouseOptionsWhenDepartmentChange({
                url: '/baseHandleAction/warehouse.do?readWrite=Y',
                departmentId: -1,
                formApi: ChcGridApi.formApi,
                warehouseFieldName: 'warehouseId',
              });
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            paginate: false,
            showChooseAll: '',
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            // defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            nextTick(() => {
              getWareHouseOptionsWhenDepartmentChange({
                url: '/baseHandleAction/warehouse.do?readWrite=Y',
                departmentId: values?.departmentId || -1,
                formApi: ChcGridApi.formApi,
                warehouseFieldName: 'warehouseId',
              });
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
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
        fieldName: 'productType',
        label: '商品分类',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000380',
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
        fieldName: 'productControlLevel',
        label: '药品组',
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
        component: 'InputNumber',
        fieldName: 'salesqty',
        label: '消耗阈值',
        defaultValue: 0,
        componentProps: () => {
          return {
            // allowClear: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isAllSale',
        label: '全院销量',
        defaultValue: 'N',
        componentProps: () => {
          return {
            options: [
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            // defaultValue: 'N',
            paginate: false,
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isIncludeMo',
        label: '包含调拨',
        defaultValue: 'N',
        componentProps: () => {
          return {
            options: [
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            // defaultValue: 'N',
            paginate: false,
            immediate: true,
          };
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      qtyOnHand.value = 0;
      (params.rows || []).forEach((item: any) => {
        qtyOnHand.value += Number.parseInt(item.qtyAll as string);
      });
      console.warn('getTableArrDataFn:', qtyOnHand.value);
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '数量汇总',
      value: qtyOnHand.value,
      noUnit: true,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <LogModal />
    <FormModal />
    <ChcGrid>
      <template #toolbar-tools>
        <!-- <span>数量汇总：{{ qtyOnHand }}</span> -->
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
      </template>
      <template #toolbar-actions>
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
</style>
