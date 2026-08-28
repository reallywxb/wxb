<script lang="ts" setup>
import { computed, onMounted, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgCopyIcon,
  SvgPrintFillIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

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
const route = useRoute();
// 是否从追溯查询页面跳转
const isFromTraceSearchPage = computed(() => {
  return route.query.from === 'traceSearch';
});

const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  isSelf: urlParamsObj?.isSelf || '',
  showStorage: urlParamsObj?.showStorage || 'N',
  showPrice: urlParamsObj?.showPrice || 'Y',
  isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
};

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});
const searchController = new LazySearch(1, async () => {
  await nextTick();
  // isFirstLoaded.value = true;
  // ChcGridApi.formApi.getValues().then((res: any) => {
  //   ChcGridApi.query({ ...res });
  // });
});
const isFirstLoaded = ref(false);
onMounted(async () => {
  // 触发自动查询 如果从追溯查询页面跳转则触发自动查询
  if (isFromTraceSearchPage.value) {
    const formValues = await ChcGridApi?.formApi?.getValues();
    ChcGridApi?.query(formValues);
  }
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
        enabled: true,
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
        field: 'currentPricePo',
        title: '价格',
        visible: urlParams.showPrice !== 'N',
        width: '72',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentPricePo);
        },
        align: 'right',
        sortable: true,
      },
      {
        field: 'markCode',
        title: '中标编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'qtyAutoPlaned',
        title: '自动计划数量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        align: 'right',
        title: '申请数量',
        width: '90',
        sortable: true,
      },
      {
        field: 'currentPriceAmt',
        title: '金额',
        visible: urlParams.showPrice !== 'N',
        width: '72',

        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentPriceAmt);
        },
        align: 'right',
        sortable: true,
      },
      {
        field: 'isCrossDocking',
        minWidth: 100,
        sortable: true,
        title: '直配',
        formatter({ row }: any) {
          return row.sourceType === 'A' ? '是' : '否';
        },
      },
      {
        field: 'qtyPicking',
        title: '拣货中数量',
        align: 'right',
        width: '100',
      },
      {
        field: 'qtyCancelled',
        title: '取消数量',
        align: 'right',
        width: '90',
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
        field: 'lineStatusName',
        title: '状态',
        align: 'right',
        width: '80',
      },
      {
        field: 'packageCountOrdered',
        title: '申请包数',
        align: 'right',

        width: '90',
      },
      {
        field: 'comments',
        title: '关闭说明',
        width: '120',
      },
      {
        field: 'qtyOnHand',
        title: '库存数量',
        align: 'right',
        width: '90',
      },
      {
        field: 'qtyOnHandFrom',
        title: '上级库库存',
        visible: urlParams.showStorage !== 'N',
        align: 'right',
        width: '100',
      },
      {
        field: 'qtyApplied',
        title: '月度计划数量',
        visible: urlParams.isUseMonthlyWO !== 'N',
        width: '120',
      },
      {
        field: 'monthQtyOrdered',
        title: '本月请领数量',
        visible: urlParams.isUseMonthlyWO !== 'N',
        width: '120',
      },
      {
        field: 'qtyLeft',
        title: '剩余数量',
        visible: urlParams.isUseMonthlyWO !== 'N',
        width: '90',
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
      },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/orderAction/queryLine.do?page=woInput&specShowType=from',
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
      stripe: false,
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
    queryUrl:
      'orderAction/queryNew.do?isSameLevelMv=N&orderType=WO&page=query&isSurgery=N&productControlLevel=',
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
        minWidth: 90,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },
      // {
      //   field: 'deliveryPlanDate',
      //   minWidth: 160,
      //   sortable: true,
      //   title: '要求送达时间',
      // },
      {
        field: 'toWarehouseName',
        minWidth: 160,
        sortable: true,
        title: '申请仓库',
      },
      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: '上级仓库',
      },

      {
        field: 'currentTotalPoAmt',
        minWidth: 150,
        sortable: true,
        title: '金额',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentTotalPoAmt);
        },
        visible: urlParams.showPrice !== 'N',
      },
      {
        field: 'sourceType',
        minWidth: 100,
        sortable: true,
        title: '自动计划',
        formatter({ row }: any) {
          return row.sourceType === 'A' ? '是' : '否';
        },
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '管控类型',
        visible: urlParams.isProductControlLevel,
      },
      {
        field: 'docStatusName',
        minWidth: 100,
        sortable: true,
        title: '单据状态',
      },
      {
        field: 'processStatusName',
        title: '处理状态',
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
        field: 'completeUserName',
        title: '审批人',
        width: '150',
        sortable: true,
      },
      {
        field: 'created',
        minWidth: 160,
        title: '创建时间',
      },

      {
        field: 'description',
        minWidth: 150,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          isFromTraceSearchPage.value
            ? null
            : dayjs(dayjs().format('YYYY-MM-DD'))
                .subtract(7, 'day')
                .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        // defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            showSearch: true,
            filterByFrontEnd: true,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',

            afterFetch(res: any) {
              if (res.rows?.length && isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  res.rows[0].id,
                );

                if (ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')) {
                  ChcGridApi.formApi.getFieldComponentRef(
                    'toWarehouseId',
                  ).params.dependencies = {
                    departmentId: res.rows[0].id,
                    regionId: res.rows[0].id,
                  };
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('toWarehouseId')
                    ?.fetchApi();
                }
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
              if (res.rows?.length && isFirstLoaded.value) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue(
                  'toWarehouseId',
                  firstOption.id,
                );
                const warehouseType = Number(firstOption.warehouseType);

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
                  'warehouseId',
                  firstOption?.parentId || undefined,
                );
                if (ChcGridApi.formApi?.getFieldComponentRef('warehouseId')) {
                  ChcGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ).params.dependencies = {
                    toWarehouseId: firstOption?.id,
                  };
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }
              }
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
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
                'warehouseId',
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
              ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'toWarehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
            }
          },
        },
      },

      {
        fieldName: 'warehouseId',
        label: '上级仓库',
        component: 'ChcSelect',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择上级仓库',
            paginate: false,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['toWarehouseId'],
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                isFirstLoaded.value = true;
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['toWarehouseId'],
          trigger(values) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                toWarehouseId: values.toWarehouseId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              // ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        defaultValue: isFromTraceSearchPage.value
          ? route.query?.orderNo
          : undefined,
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000566',
            placeholder: '请选择来源类别',
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
        fieldName: 'priorityType',
        label: '来源类别',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000572',
            placeholder: '请选择处理状态',
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
        fieldName: 'processStatus',
        label: '处理状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isSelf',
        label: '当前用户',
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
          roleGridApi.grid.remove();
          selectRow.value = {};
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
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
  if (!selectRow.value.orderId) return message.warn('请选择要复制的请领单');
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认复制库房请领单吗？`,
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
    message.warn('请选择要打印的请领单');
    return;
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印请领单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderDoc.do?id=${JSON.stringify(selectRow.value.orderId)}`,
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
                data-testid="button_copy"
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
                data-testid="button_print"
              >
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
                打印
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
                data-testid="input_product_name"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search"
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
