<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import rejectModalUI from './addModal/rejectModal.vue';
import { approveWorkflow } from './api.ts';

const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  page: urlParamsObj?.page || '',
  readOnly: urlParamsObj?.readOnly,
};

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
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
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },

      { field: 'productSpec', title: '规格', minWidth: '90', sortable: true },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },
      { field: 'uomName', title: '单位', minWidth: '60', sortable: true },
      {
        field: 'qtyOrdered',
        title: '退货数量',
        sortable: true,
        align: 'right',
        minWidth: '90',
      },
      {
        field: 'priceActual',
        title: '退货价格',
        minWidth: '90',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceActual);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'lineAmt',
        title: '金额',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
        minWidth: '70',
      },
      {
        field: 'pricePO',
        title: '购进价格',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
        minWidth: '90',
      },
      {
        field: 'lot',
        title: '批号',
        sortable: true,
        minWidth: '100',
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        sortable: true,
        minWidth: '100',
      },
      {
        field: 'productArea',
        title: '产地',
        sortable: true,
        minWidth: '110',
      },
      {
        field: 'vendorName',
        title: '供应商',
        sortable: true,
        align: 'right',
        minWidth: '180',
      },
      {
        field: 'returnReason',
        title: '退回原因',
        width: 150,
        sortable: true,
      },
      { field: 'description', title: '备注', minWidth: '150' },
    ],
    id: 'child',
    queryUrl: `/orderAction/queryLine.do?specShowType=from&returnType=4`,
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }

      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const toWarehouseParams = ref<any>({});
const departmentId = ref<number | string>('');

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
    queryUrl: '/orderAction/query.do?orderType=PR&returnType=4',
    gridColumns: [
      {
        type: 'radio',
        minWidth: 40,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },

      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '采退单号',
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '采退时间',
      },
      {
        field: 'bpartnerName',
        minWidth: 160,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 200,
        sortable: true,
        title: '仓库',
      },
      {
        field: 'totalAmt',
        title: '金额',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
        minWidth: '100',
      },
      {
        field: 'docStatusName',
        minWidth: 120,
        sortable: true,
        title: '单据状态',
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        visible: userStore.userInfo.isProductControlLevel,
        title: '商品组',
      },
      {
        field: 'receiptTypeName',
        title: '采购类型',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        minWidth: '120',
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
        field: 'completeUserName',
        minWidth: 100,
        sortable: true,
        title: '审核人',
      },
      {
        field: 'completeTime',
        minWidth: 160,
        title: '审核时间',
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
        label: '采退时间',
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
            dictUrl: '/baseHandleAction/userOrgList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择机构',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,

            showChooseAll: '-1',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          show: () => {
            return userStore.userInfo.isSaas;
          },
        },
        fieldName: 'orgId',
        label: '机构',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            onChange(val: any) {
              departmentId.value = val;
            },
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,

            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',

            // showSearch: true,
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            onChange(val: any, option: any) {
              const warehouseType = option.warehouseType;
              toWarehouseParams.value = {};
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  toWarehouseParams.value[`level${i}`] = 'Y';
                }
              }
              ChcGridApi.formApi?.setFieldValue(
                'toWarehouseId',
                option.parentId || undefined,
              );
              // extParams.value.bpartnerId_text = option.name;
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
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
              console.warn(
                ChcGridApi.formApi.getFieldComponentRef('warehouseId'),
                55,
              );
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '仓库',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,

            showChooseAll: '-1',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '采退单号',
        componentProps: {
          placeholder: '请输入编码/拼音码/名称',
        },
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
              { value: 'DR', label: '新建' },
              { value: 'WU', label: '待复核' },
              { value: 'WA', label: '待审批' },
              { value: 'NA', label: '未批准' },
              { value: 'CO', label: '已确认' },
              { value: 'VO', label: '已作废' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'docStatus',
        label: '状态',
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
          roleGridApi.grid.remove();
          selectRow.value = {};
          // roleGridApi.query({ orderId: row.orderId });
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

const [rejectModal, rejectModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUI,
  draggable: true,
});

const selectRow = ref<any>({});

const handleApproval = () => {
  if (!selectRow.value.orderId) {
    message.warning('请先选择批准的数据');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认批准吗？`,
    onOk: () => {
      try {
        const params = {
          returnOrderId: JSON.stringify([selectRow.value.orderId]),
        };
        approveWorkflow(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('批准成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
        ChcGridApi.query();
      } catch {
        message.error('批准失败');
      }
    },
  });
};
const rejectOrders = ref<Array<number | string>>([]);

const handleReject = () => {
  if (!selectRow.value.orderId) {
    message.warning('请先选择拒绝的数据');
    return;
  }
  rejectOrders.value = [selectRow.value.orderId];
  rejectModalApi.open();
};

const handleRejectClose = () => {
  console.warn('handleRejectClose');
  ChcGridApi.query();
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
          <rejectModal
            :reject-orders="rejectOrders"
            @close="handleRejectClose"
          />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <div v-if="urlParams.page === 'confirm'">
                <Button
                  type="primary"
                  @click="handleApproval"
                  class="mr-[0.5rem]"
                  data-testid="button_approval"
                >
                  批准
                </Button>
                <Button
                  type="primary"
                  @click="handleReject"
                  data-testid="button_reject"
                >
                  拒绝
                </Button>
              </div>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid />
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
