<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgCopyIcon,
  SvgPrintFillIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { copyPlan } from './api';
import LazySearch from '#/utils/LazySearch';
const globalPrintStore = useGlobalPrintStore();
const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
};

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },

      { field: 'productSpec', title: '规格', width: '90', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '60', sortable: true },
      {
        field: 'qtyOrdered',
        title: '申请退货数量',
        sortable: true,
        align: 'right',
        width: '150',
      },
      {
        field: 'packageCountOrdered',
        title: '申请包数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyDelivered',
        title: '实发数量',
        align: 'right',
        width: '90',
      },
      {
        field: 'qtyReceived',
        title: '实收数量',
        align: 'right',
        width: '90',
      },
      {
        field: 'qtyRejected',
        title: '拒收数量',
        align: 'right',
        width: '90',
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: '90',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceActual',
        title: '成本价',
        width: '90',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceActual);
        },
        align: 'right',
      },
      {
        field: 'lineStatusName',
        title: '状态',
        width: '80',
      },
      {
        field: 'comments',
        title: '关闭说明',
        width: '120',
      },
      { field: 'description', title: '备注', width: '150' },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: `/orderAction/queryLine.do?specShowType=${urlParams.specShowType}`,
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
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
// 二级仓库下拉请求的额外入参
const secondaryWarehouseExtraParams = ref<{
  level2: number | string;
  level3: number | string;
  level4: number | string;
}>({
  level2: '',
  level3: '',
  level4: '',
});
const searchController = new LazySearch(1, async () => {
  await nextTick();
  // ChcGridApi.formApi.getValues().then((res: any) => {
  //   ChcGridApi.query({ ...res });
  // });
});
const isFirstLoaded = ref(true);
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/orderAction/queryNew.do?orderType=WR&page=query',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },

      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 160,
        sortable: true,
        title: '申请仓库',
      },
      {
        field: 'toWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '上级仓库',
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        sortable: true,
        width: '100',
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '商品组',
        visible: userStore.userInfo.isProductControlLevel,
      },
      {
        field: 'docStatusName',
        title: '单据状态',
        width: '120',
        sortable: true,
      },

      {
        field: 'createdByName',
        minWidth: 90,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 160,
        title: '创建时间',
        sortable: true,
      },

      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
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
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length && isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  res.rows[0].id,
                );

                if (ChcGridApi.formApi?.getFieldComponentRef('warehouseId')) {
                  ChcGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ).params.dependencies = {
                    departmentId: res.rows[0].id,
                    regionId: res.rows[0].id,
                  };
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        fieldName: 'warehouseId',
        label: '申请仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            triggerFields: ['departmentId', 'regionId'],

            placeholder: '请选择申请仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length && isFirstLoaded.value) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
                const warehouseType = firstOption.warehouseType;
                Object.entries(secondaryWarehouseExtraParams.value).forEach(
                  ([key, value]) => {
                    secondaryWarehouseExtraParams.value[
                      key as keyof typeof secondaryWarehouseExtraParams.value
                    ] = '';
                    console.warn('key', key, 'value', value);
                  },
                );
                if (warehouseType && warehouseType > 1) {
                  for (let i = 1; i < warehouseType; i++) {
                    secondaryWarehouseExtraParams.value[
                      `level${i}` as keyof typeof secondaryWarehouseExtraParams.value
                    ] = 'Y';
                  }
                }
                ChcGridApi.formApi?.setFieldValue(
                  'toWarehouseId',
                  firstOption.parentId || undefined,
                );
              }

              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              const warehouseType = option.warehouseType;
              Object.entries(secondaryWarehouseExtraParams.value).forEach(
                ([key, value]) => {
                  secondaryWarehouseExtraParams.value[
                    key as keyof typeof secondaryWarehouseExtraParams.value
                  ] = '';
                  console.warn('key', key, 'value', value);
                },
              );
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  secondaryWarehouseExtraParams.value[
                    `level${i}` as keyof typeof secondaryWarehouseExtraParams.value
                  ] = 'Y';
                }
              }
              ChcGridApi.formApi?.setFieldValue(
                'toWarehouseId',
                option.parentId || undefined,
              );
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },

      {
        fieldName: 'toWarehouseId',
        label: '上级仓库',
        component: 'ChcSelect',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',

        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择上级仓库',
            paginate: false,
            allowClear: true,
            showChooseAll: '',
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['warehouseId'],
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
              if (isFirstLoaded.value) {
                isFirstLoaded.value = false;
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'toWarehouseId',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
              // ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入编码/拼音码/名称',
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          selectRow.value = row;
          roleGridApi.reload({ orderId: row.orderId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          selectRow.value = {};
          roleGridApi.grid.remove();
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleSearch = () => {
  roleGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
  });
};

const selectRow = ref<any>({});

// 复制处理函数
const handleCopy = () => {
  if (!selectRow.value.orderId) return message.warn('请选择要复制的数据');
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认复制库房请退单吗？`,
    onOk: async () => {
      try {
        await copyPlan({ orderId: selectRow.value.orderId })
          .then((res) => {
            if (res && res.success) {
              console.warn('复制', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('复制成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('复制失败');
      }
    },
  });
};

const handlePrint = () => {
  if (!selectRow.value.orderId) {
    message.warn('请选择要打印的请退单');
    return;
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印请退单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printApplyDoc.do?id=${JSON.stringify(selectRow.value.orderId)}`,
      });
    },
    onCancel() {},
  });
};
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
                @click="handleCopy"
                class="mr-[0.5rem]"
                data-testid="button_copy_orderReturnQuery"
              >
                复制
                <template #icon>
                  <SvgCopyIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_print_orderReturnQuery"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_product_name_orderReturnQuery"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search_orderReturnQuery"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
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
</style>
