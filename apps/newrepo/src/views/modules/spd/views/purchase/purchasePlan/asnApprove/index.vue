<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import priceDiffConfirmModalComp from './modals/priceDiffConfirmModal.vue';

interface PurchaseWarehouse {
  allowPRUpdateVendor: 'N' | 'Y';
  id: number;
  isBPartnerProductControl: 'N' | 'Y';
  isLPackageQtyPO: 'N' | 'Y';
  isNoProtocolPo: 'N' | 'Y';
  isUseMonthlyWO: 'N' | 'Y';
  linkBpartnerId: number;
  name: string;
  parentId: number;
  warehouseType: string;
}

const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page || route.query?.page || '';
console.warn('page:', page);
const isProductControlLevel = computed(() => {
  return userStore?.userInfo?.isProductControlLevel || false;
});

console.warn('userStore', userStore);

console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
const searchController = new LazySearch(3, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  // 获取url参数
  const formValues = await fatherGridApi.formApi?.getValues();
  fatherGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  fatherGridApi.query({ ...formValues });
  isFirstLoaded.value = true;
});
onMounted(() => {
  searchController.sign(3);
});

const fatherGridColumns: any[] = [
  {
    type: 'radio',
    title: '单选',
    width: '50',
    align: 'center',
    visible: false,
  },
  {
    type: 'seq',
    title: '序号',
    width: '50',
    align: 'center',
  },
  {
    field: 'orderNo',
    title: '订单号',
    width: '100',
    sortable: true,
  },
  {
    field: 'asnNo',
    title: '配送单号',
    width: '110',
    sortable: true,
  },
  {
    field: 'dateArrived',
    title: '到货时间',
    width: '100',
    sortable: true,
  },
  {
    field: 'bpartnerName',
    title: '供应商',
    width: '150',
    sortable: true,
  },
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
    field: 'applyBPartnerName',
    title: '直配仓库',
    width: '150',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: '金额',
    width: '150',
    sortable: true,
  },
  {
    field: 'productControlLevelName',
    title: '管控类型',
    hidden: !isProductControlLevel.value,
    width: '100',
    sortable: true,
  },
  {
    field: 'receiptTypeName',
    title: '采购类型',
    width: '150',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    // width: '150',
    sortable: true,
  },
].filter((item) => {
  if (item?.hidden === true) {
    return false;
  }
  return true;
});
const fatherGridCheckedRow = ref<Record<string, any>>({});
const [FatherGrid, fatherGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateRange', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
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
      // cellStyle: ({ row, column }: { column: any; row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'asnApprove',
    // api地址
    queryUrl: '/asnAction/query.do?page=query&asnType=PO&isApproved=N',
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '配送时间',
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'bpartnerId',
        label: '供应商',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
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
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              fatherGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              searchController.sign(1);
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '采购仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择采购仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              const levelOneRows: PurchaseWarehouse[] =
                res?.rows?.filter(
                  (item: PurchaseWarehouse) => item.warehouseType === '1',
                ) || [];

              const firstOption = levelOneRows[0];
              fatherGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(firstOption?.id) ? '' : firstOption?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: levelOneRows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            nextTick(() => {
              const cond = !!(
                fatherGridApi.formApi?.getFieldComponentRef &&
                typeof fatherGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                fatherGridApi.formApi?.getFieldComponentRef('warehouseId')
              );
              console.warn('isFieldComponentRefExist warehouseId', cond);
              if (cond) {
                const refInst = fatherGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ) as unknown as SelectComponentRef;
                if (refInst && refInst.params) {
                  fatherGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    undefined,
                  );
                  refInst.params.dependencies = {
                    departmentId: values?.departmentId || -1,
                    regionId: values?.departmentId || -1,
                  };
                  refInst?.fetchApi();
                }
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'applyBPartnerId',
        label: '直配仓库',
        componentProps: () => {
          return {
            dictUrl:
              'baseHandleAction/warehouseBPartner.do?level2=Y&accessAll=Y',
            placeholder: '请选择直配仓库',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        label: '配送单号',
        componentProps: () => {
          return {
            placeholder: '请输入配送单号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '订单号',
        componentProps: () => {
          return {
            placeholder: '请输入订单号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'invoiceNo',
        label: '发票号',
        componentProps: () => {
          return {
            placeholder: '请输入发票号',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isCrossDocking',
        label: '直配',
        componentProps: () => {
          return {
            placeholder: '请选择直配',
            paginate: false,
            showChooseAll: '',

            allowClear: true,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '商品组',
        defaultValue: [''],
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000244',
            placeholder: '请选择商品组',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: false,
            labelField: 'name',
            valueField: 'id',
            mode: 'multiple',
            maxTagCount: 2,
            onChange(value: any[]) {
              console.warn('productControlLevel onChange', value);
              if (value.includes('')) {
                fatherGridApi.formApi?.setFieldValue('productControlLevel', [
                  '',
                ]);
              }
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        if (isEmpty(row)) {
          fatherGridCheckedRow.value = {};
          sonGridApi.grid.remove();
        } else {
          fatherGridCheckedRow.value = toRaw(row);
          sonGridApi.reload();
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      if (isEmpty(params.rows)) {
        sonGridApi.grid.remove();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 拒绝
const handleReject = async () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  if (isEmpty(row)) {
    message.error('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '提醒',
    content: '确认拒绝吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await requestFormClient.post('/asnAction/rejectAsn.do', {
          asnId: row.asnId,
        });
        if (res?.success) {
          message.success('拒绝成功');
          const formValues = await fatherGridApi.formApi.getValues();
          fatherGridApi.query({ ...formValues });
        }
        throw res;
      } catch (error) {
        console.error(error);
      }
    },
  });
};
// 受理
const handleApprove = async () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  if (isEmpty(row)) {
    message.error('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '提醒',
    content: '确认受理吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await requestFormClient.post('/asnAction/approve.do', {
          asnId: row.asnId,
        });
        if (res?.success) {
          message.success('受理成功');
          const formValues = await fatherGridApi.formApi.getValues();
          fatherGridApi.query({ ...formValues });
        }
        throw res;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

// 子表
const sonGridCheckedRow = ref<Record<string, any>>({});
const [
  SonGrid,
  sonGridApi,
  { priceDiffConfirmModalApi, PriceDiffConfirmModal },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      handleSubmit: async () => {
        if (!isEmpty(fatherGridCheckedRow.value)) {
          const formValues = await sonGridApi.formApi.getValues();
          sonGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          sonGridApi.reload(formValues);
        }
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      pagerConfig: {
        enabled: false,
      },
      seqConfig: {
        seqMethod: ({ rowIndex }: { rowIndex: number }) => {
          return rowIndex + 1;
        },
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.error) {
          return {
            color: 'red',
          };
        }
        return {};
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
          };
        },
      },
    ],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: '50',
        align: 'center',
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        width: '50',
        align: 'center',
      },
      {
        field: 'deliveryNo',
        title: '随货清单号',
        width: 120,
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
        width: '130',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '130',
        sortable: true,
        visible: false, //  TODO:medicine cancel 型号
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'marketingAuthorizationHolder',
        title: '上市许可持有人',
        width: '130',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
      {
        field: 'replenishPackageQty',
        title: '定数',
        width: '80',
        sortable: true,
        align: 'right',
        formatter: ({ cellValue, row }) => {
          return row.isPackaged === 'Y' ? cellValue : '/';
        },
        visible: false, //  TODO:medicine cancel 定数
      },
      {
        field: 'packageCountArrived',
        title: '到货包数',
        width: '100',
        visible: false, //  TODO:medicine cancel 到货包数
      },
      {
        field: 'qtyArrived',
        title: '到货数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyInvoiced',
        title: '开票数量',
        width: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'orderPrice',
        title: '订单价',
        width: '110',
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceActual',
        title: '配送价',
        width: '110',
        sortable: true,
        align: 'right',
      },
      {
        field: 'discountPrice',
        title: '折扣价',
        width: '110',
        sortable: true,
        align: 'right',
      },
      {
        field: 'lot',
        title: '批号',
        width: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '110',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '验收货位',
        width: '120',
        sortable: true,
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        width: '100',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '100',
        sortable: true,
      },
      {
        field: 'isPriceDiff',
        title: '价格差异',
        width: '90',
        sortable: true,

        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isPriceDiffConfirmed',
        title: '价格差异确认',
        width: '120',
        sortable: true,

        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'priceDiffComments',
        title: '价格差异说明',
        width: '120',
        sortable: true,
      },
      {
        field: 'error',
        title: '异常说明',
        width: '200',
        sortable: false,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
        sortable: true,
      },
    ],
    id: 'asnApprove_son',
    queryUrl: '/asnAction/queryDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,

    beforeFetchFn: (params) => {
      params.asnId = fatherGridCheckedRow.value.asnId;
      return { ...params };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('子表格 radioChange', row);
        sonGridCheckedRow.value = isEmpty(row) ? {} : toRaw(row);
      },
    },
    customModals: {
      'PriceDiffConfirmModal-priceDiffConfirmModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: priceDiffConfirmModalComp,
        },
      ),
    },
  },
);
const priceDiffConfirmButtonVisible = computed(() => {
  if (isEmpty(sonGridCheckedRow.value)) {
    return false;
  }
  if (
    sonGridCheckedRow.value.isPriceDiff === 'Y' &&
    sonGridCheckedRow.value.isPriceDiffConfirmed !== 'Y'
  ) {
    return true;
  }
  return false;
});
const handlePriceDiffConfirm = () => {
  const row = sonGridApi.grid.getRadioRecord(true);
  if (isEmpty(row)) {
    message.error('请选择确认的记录！');
    return;
  }
  priceDiffConfirmModalApi
    ?.setData({
      row: toRaw(row),
      callback: async () => {
        const formValues = await sonGridApi?.formApi.getValues();
        sonGridApi.query({
          ...formValues,
        });
      },
    })
    ?.open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PriceDiffConfirmModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <FatherGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              danger
              class="mr-[0.5rem]"
              data-testid="button_reject"
              @click="handleReject"
            >
              拒绝
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              data-testid="button_approve"
              @click="handleApprove"
            >
              受理
            </Button>
          </template>
        </FatherGrid>
      </template>
      <template #second>
        <SonGrid>
          <template #toolbar-actions>
            <Button
              v-show="priceDiffConfirmButtonVisible"
              type="primary"
              class="mr-[0.5rem]"
              data-testid="button_priceDiffConfirm_sonGrid"
              @click="handlePriceDiffConfirm"
            >
              价格差异确认
            </Button>
          </template>
        </SonGrid>
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
