<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Modal as AntModal, Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const orderType = urlParams?.orderType || '';
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

const fatherFormSchema = [
  {
    component: 'DateGroup',
    fieldName: 'dateRange',
    label: '出库时间',
    defaultValue: [],
    formItemClass: 'col-span-1',
  },
  {
    component: 'ChcSelect',
    fieldName: 'departmentId',
    label: '院区',
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
    label: '发货仓库',
    formItemClass: `col-span-1`,
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do',
        placeholder: '请选择发货仓库',
        triggerFields: ['departmentId', 'regionId'],
        paginate: false,
        showChooseAll: '',
        immediate: false,
        labelField: 'name',
        valueField: 'id',
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
    component: 'Input',
    fieldName: 'inoutNo',
    label: '出库单号',
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'isPrinted',
    label: '已打印',
    formItemClass: `col-span-1`,
    componentProps: () => {
      return {
        placeholder: '',
        paginate: false,
        showChooseAll: '',
        options: [
          { value: '', label: '全部' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
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
  {
    component: 'Input',
    fieldName: 'invoiceNo',
    label: '发票号',
    componentProps: () => {
      return {
        placeholder: '',
      };
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
];

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
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
    id: 'outPrint',
    // api地址
    queryUrl: `/inoutAction/query.do?page=poOutput&orderType=${encodeURIComponent(
      orderType,
    )}`,
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
        field: 'inoutNo',
        title: '出库单号',
        width: '110',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        width: '110',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '出库日期',
        width: '160',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        width: 200,
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
        title: '发货仓库',
        width: 200,
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        width: 150,
        sortable: true,
        align: 'right',
      },
      {
        field: 'createdByName',
        title: '操作人',
        width: 150,
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        // width: '150',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: fatherFormSchema,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        if (isEmpty(row)) {
          SonChcGridApi?.grid?.remove();
        } else {
          SonChcGridApi.reload();
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        SonChcGridApi.grid.remove();
      }

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
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      // {
      //   field: 'modelNo',
      //   title: '型号',
      //   width: '200',
      //   sortable: true,
      // },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '200',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '90',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '出库数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '价格',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceAsi',
        title: '批次进价',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmtPriceAsi',
        title: '批次进价金额',
        width: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '120',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '120',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '120',
        sortable: true,
      },
      {
        field: 'taxInvoiceDate',
        title: '发票日期',
        minWidth: '120',
        sortable: true,
      },
    ],
    id: 'outPrint_son',
    queryUrl: '/inoutAction/queryDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      const row = ChcGridApi.grid.getRadioRecord(true);
      params.inoutId = !isEmpty(row) && row?.inoutId ? row.inoutId : 0;
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handlePrint = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrint row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const inoutId = row.inoutId;
  AntModal.confirm({
    title: '打印提示',
    content: '确认打印出库单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/spdPrintReportAction/printPRInOutDocByInout?id=${inoutId}`,
      });
    },
    onCancel() {},
  });
};
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
              @click="handlePrint"
              class="mr-[0.5rem]"
              data-testid="button_print"
            >
              打 印
              <template #icon>
                <SvgPrintFillIcon />
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

<style lang="less" scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>
