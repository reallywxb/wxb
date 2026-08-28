<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';
import { isArray } from 'lodash-es';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page || route.query?.page || '';
console.warn('page:', page);
const isProductControlLevel = computed(() => {
  return userStore?.userInfo?.isProductControlLevel || false;
});
// const isSaas = computed(() => {
//   return userStore?.userInfo?.isSaas || false;
// });
console.warn('userStore', userStore);

console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
});

const fatherFormSchema = [
  {
    component: 'DateGroup',
    fieldName: 'dateRange',
    label: '采退时间',
    defaultValue: [],
    formItemClass: '',
  },
  {
    component: 'ChcSelect',
    fieldName: 'orgId',
    label: '机构',
    defaultValue: '',
    formItemClass: '',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/userOrgList.do',
        placeholder: '请选择机构',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        autoChooseFirstOption: true,
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
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        placeholder: '请选择院区',
        allowClear: true,
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          ChcGridApi.formApi?.setFieldValue(
            'departmentId',
            isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
          );
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
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
        placeholder: '请选择仓库',
        triggerFields: ['departmentId', 'regionId'],
        paginate: false,
        showChooseAll: true,
        immediate: false,
        labelField: 'name',
        valueField: 'id',
        allowClear: true,
        afterFetch(res: any) {
          ChcGridApi.formApi?.setFieldValue(
            'warehouseId',
            isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
          );
          if (!isFirstLoaded.value) {
            searchController.sign(2);
          }
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    dependencies: {
      triggerFields: ['departmentId', 'regionId'],
      trigger(values: any) {
        nextTick(() => {
          const cond =
            ChcGridApi.formApi?.getFieldComponentRef &&
            typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
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
            ChcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
          }
        });
      },
    },
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
    component: 'Input',
    fieldName: 'orderNo',
    label: '采退单号',
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'docStatus',
    label: '状态',
    componentProps: () => {
      return {
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        mode: 'multiple',
        maxTagCount: 2,
        allowClear: true,
        options: [
          { value: 'DR', label: '新建' },
          { value: 'WU', label: '待复核' },
          { value: 'WA', label: '待审批' },
          { value: 'NA', label: '未批准' },
          { value: 'CO', label: '已确认' },
          { value: 'VO', label: '已作废' },
        ],
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
].filter((formItem) => {
  if (formItem.fieldName === 'docStatus') {
    // 状态
    return page !== 'approve' && page !== 'confirm';
  }
  if (formItem.fieldName === 'orgId') {
    // 机构
    formItem.formItemClass = userStore?.userInfo?.isSaas ? '' : 'hidden';
    return true;
  }
  return true;
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
    title: '采退单号',
    width: '150',
    sortable: true,
  },
  {
    field: 'dateOrdered',
    title: '采退时间',
    width: '130',
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
    width: '120',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: '金额',
    width: '100',
    align: 'right',
    sortable: true,
    formatter({ cellValue }: any) {
      return handlePriceToFixedTwo(cellValue);
    },
  },
  {
    field: 'docStatusName',
    title: '单据状态',
    width: '120',
    sort: true,
    formatter: ({ row, cellValue }: { cellValue: any; row: any }) => {
      if (row.processStatus === 'C') {
        return `${cellValue}(${row.processStatusName})`;
      }
      return cellValue;
    },
  },
  {
    field: 'productControlLevelName',
    title: '管控类型',
    visible: isProductControlLevel.value,
    width: '100',
    sortable: true,
  },
  {
    field: 'receiptTypeName',
    title: '采购类型',
    width: '100',
    sortable: true,
  },
  {
    field: 'invoiceMethodName',
    title: '开票方式',
    width: '100',
    sortable: true,
  },
  {
    field: 'createdByName',
    title: '创建人',
    width: '100',
    sortable: true,
  },
  {
    field: 'created',
    title: '创建时间',
    width: '130',
  },
  {
    field: 'completeUserName',
    title: '审批人',
    width: '100',
    sort: true,
  },
  {
    field: 'completeTime',
    title: '审批时间',
    width: '140',
  },
  {
    field: 'rejectReason',
    title: '退回原因',
    width: 150,
  },
  {
    field: 'description',
    title: '备注',
    width: '150',
  },
].filter((item) => {
  if (
    item.field === 'action' ||
    item.type === 'radio' ||
    item.type === 'checkbox'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      // showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
      cellStyle: ({ row, column }: { column: any; row: any }) => {
        if (
          column.field === 'isWorkflowEnd' &&
          row.isWorkflowEnd &&
          row.isWorkflowEnd === 'N'
        ) {
          return {
            color: '#F581B1',
          };
        }
        return {};
      },
    }),
  },
  {
    id: 'orderQuery',
    // api地址
    queryUrl: `/orderAction/query.do?orderType=PR`,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: fatherFormSchema,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        if (!isEmpty(row) && row?.orderId) {
          parentTableParams.value.orderId = row.orderId;
          SonChcGridApi.query({
            orderId: row.orderId,
          });
        } else {
          SonChcGridApi.grid.remove(SonChcGridApi.grid.getFullData());
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      console.warn('beforeFetchFn params', params);
      if (page === 'reject') {
        params.docStatus = 'NA';
      } else if (page === 'confirm') {
        params.docStatus = 'WU';
      }
      if (isArray(params.docStatus)) {
        // params.docStatus = JSON.stringify(params.docStatus);
        params.docStatus = params.docStatus
          .map((item: any) => `'${item}'`)
          .join(',');
      }
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      // if (isEmpty(params.rows)) {
      //   SonChcGridApi.grid.remove();
      // }

      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [SonChcGrid, SonChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [],
    gridColumns: [
      {
        type: 'seq',
        title: '序号',
        width: '50',
        align: 'center',
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保药品编码',
        width: '150',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '120',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '150',
        sortable: true,
      },
      // {
      //   field: 'modelNo',
      //   title: '型号',
      //   width: '150',
      //   sortable: true,
      // },
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
        field: 'qtyOrdered',
        title: '退货数量',
        align: 'right',
        width: '80',
      },
      {
        field: 'priceActual',
        title: '退货价格',
        width: 120,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: '90',
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '购进价格',
        width: 120,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },

      {
        field: 'lot',
        title: '批号',
        width: 120,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: 90,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '100',
      },
      {
        field: 'invoiceDate',
        title: '发票日期',
        minWidth: '120',
      },
      {
        field: 'productArea',
        title: '产地',
        width: 90,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'returnReason',
        title: '退货原因',
        width: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
      },
    ],
    id: 'orderQuery_son',
    queryUrl: '/orderAction//queryLine.do?specShowType=from',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      // const row = ChcGridApi.grid.getRadioRecord(true);
      // if (!isEmpty(row) && row?.orderId) {
      //   params.orderId = row.orderId;
      // }
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
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
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
      </template>
      <template #second>
        <SonChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
