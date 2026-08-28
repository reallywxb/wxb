<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { IconfontBasicView, SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import { columns } from './gridOptions';
import approvalModalUi from './modal/approvalModal/index.vue';
import { ChcSelect } from '@vben/chc-ui';
import { isEmpty } from '@vben/utils';
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

const [cols, gridColumns] = handleCommonGridColumns(columns);
const orderId = ref<number | string>('');
const userStore = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  // isPackaged: ['Y', 'y'].includes(urlParamsObj?.isPackaged),
  showStorage: urlParamsObj?.showStorage || 'N',
  isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
};
const isFirstLoaded = ref(false); // 是否已初次加载完
const hospitalId = ref(null);
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
  isFirstLoaded.value = true;
});
const [RoleGrid, roleGridApi, { FormModal: RoleFormModal }] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
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
        { field: 'productSpec', title: '规格', width: '150', sortable: true },
        {
          field: 'modelNo',
          title: '型号',
          width: '150',
          sortable: true,
          visible: false,
        },
        { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
        { field: 'uomName', title: '单位', width: '72', sortable: true },
        {
          field: 'qtyAutoPlaned',
          title: '自动计划数量',
          align: 'right',
          width: '120',
          sortable: true,
        },
        {
          field: 'qtyOrdered',
          title: '申请数量',
          align: 'right',

          width: '120',
          sortable: true,
        },
        {
          field: 'qtyOnHand',
          title: '库存数量',
          align: 'right',

          width: '120',
          sortable: true,
        },
        {
          field: 'qtyOnHandFrom',
          title: '上级库库存',
          aline: 'right',

          visible: !(urlParams.showStorage === 'N'),
          width: 90,
        },
        {
          field: 'qtyApplied',
          title: '月度计划数量',
          align: 'right',
          visible: !(urlParams.isUseMonthlyWO === 'N'),
          width: '120',
        },
        {
          field: 'monthQtyOrdered',
          title: '本月请领数量',
          align: 'right',
          visible: !(urlParams.isUseMonthlyWO === 'N'),
          width: '120',
        },
        {
          field: 'qtyLeft',
          title: '剩余数量',
          align: 'right',
          visible: !(urlParams.isUseMonthlyWO === 'N'),
          width: '120',
        },
        {
          field: 'description',
          title: '备注',
          width: '150',
        },
      ],
      cellStyle(scope: any) {
        if (
          (scope.column.field === 'qtyApplied' ||
            scope.column.field === 'qtyOrdered') &&
          urlParams.isUseMonthlyWO === 'Y' &&
          (!scope.row.qtyApplied || scope.row.qtyOrdered > scope.row.qtyLeft)
        ) {
          return {
            color: 'red',
          };
        }
      },
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'childTable',
    dataTableId: `/orderAction/queryLine.do?page=woInput&specShowType=${urlParams.specShowType}`,
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
        orderId: parentTableParams.value.orderId,
        productName: productCode.value,
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
const [ChcGrid, ChcGridApi, { FormModal, LogModal }] = useSpdGrid(
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
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        highlight: false,
        trigger: 'row',
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    dataTableId: '/orderAction/query.do?orderType=WO&page=workflowApproveLog',
    id: 'parentTable',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
        label: '单选',
      },
      ...gridColumns,
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/hospitalAction/queryHospList?dataType=all',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'hospitalName',
            valueField: 'orgId',
            onChange(val: any, option: any) {
              console.warn('hospitalId', val, option);
              hospitalId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res?.data || [] };
            },
          };
        },
        fieldName: 'hospitalId',
        label: '医院',
      },
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';
            },
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['hospitalId'],
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },

        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            warehouseIdExtraParams.value.hospitalId = values?.hospitalId;
            if (cond) {
              const departmentIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('departmentId');
              if (departmentIdRef) {
                if (values?.hospitalId) {
                  departmentIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  const selectOptions = await departmentIdRef.fetchApi();
                  // 选第一个不是全部的id
                  const item = selectOptions.filter(
                    (o: Record<string, any>) => !isEmpty(o?.id),
                  )?.[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'departmentId',
                    item?.id || undefined,
                  );
                } else {
                  if (!isFirstLoaded.value) {
                    searchController.sign(1);
                  }
                  departmentIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('departmentId', undefined);
                }
              }
            }
          },
        },
      },
      {
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            placeholder: '请选择申请仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            extraParams: warehouseIdExtraParams.value,
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
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
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
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
        component: 'ChcSelect',
        label: '上级仓库',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            placeholder: '请选择上级仓库',
            paginate: false,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['toWarehouseId'],
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
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
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
    ],
    cols,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value = { orderId: row.orderId };
          orderId.value = row.orderId;
          // console.log('父表选中行，触发子表查询', parentTableParams.value);
          roleGridApi.reload({ orderId: row.orderId });
        } else {
          parentTableParams.value = {};
          orderId.value = '';
          roleGridApi.grid.remove();
        }
      },
    },
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    beforeFetchFn: (params: any) => {
      if (!params.hospitalId) {
        message.warning('医院必选，请选择医院');
        return false;
      }
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: roleGridApi,
  },
);

const productCode = ref('');
const handleSearch = (e: any) => {
  console.warn('handleSearch', e.target.value, productCode.value);
  roleGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: productCode.value,
  });
};

const [approvalModal, approvalModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: approvalModalUi,
  draggable: true,
});

const orderData = ref<any>({});

const handleView = (row: any) => {
  orderData.value = row;

  approvalModalApi.open();
};

onMounted(() => {
  console.warn('onMounted', userStore.userInfo, searchController);
  // 触发自动查询
  // searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <approvalModal :order-data="orderData" />
        <LogModal />
        <FormModal />
        <ChcGrid>
          <template #action="scope">
            <Button
              type="primary"
              style="background-color: #b17a33d4"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleView(scope.row)"
              data-testid="button_view_approval"
            >
              查看审批流程
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <RoleFormModal />
        <RoleGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productCode"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              @keyup.enter="handleSearch"
              allow-clear
              data-testid="input_product_code"
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
          <!-- <template #toolbar-tools> </template> -->
        </RoleGrid>
      </template>
    </PageSplit>
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
