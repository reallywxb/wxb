<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  changeDateAcct,
  reaccountInvoice,
} from '#/views/modules/spd/views/fin/monthEnd/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';

// const route = useRoute();

// route.query.showPriceList === 'Y' || route.query.showPriceList === 'y';
const router = useRouter();
const userStore = useUserStore();
const departmentId = ref<number | string>('');
// 父表
const [Grid, gridApi, { handleExport: handleParentExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      cellClassName({ column }: any) {
        return column.field === 'invoiceId' ? 'highlight' : null;
      },
    }),
  },
  {
    id: 'monthEndInvoice',
    // api地址
    queryUrl: 'finInvoiceAction/query.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'invoiceId',
        title: '发票单号',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'dateAcct',
        title: '记账日期',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '100',
        summary: true,
        align: 'right',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        minWidth: '80',
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'amt',
        title: '进价金额',
        minWidth: '110',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'invoicePriceDiffAmt',
        title: '发票价差金额',
        minWidth: '120',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        minWidth: '80',
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'amtPriceList',
        title: '零售价金额',
        minWidth: '110',
        summary: true,
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'isRejectDoc',
        title: '是否红冲',
        minWidth: '100',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
        sortable: true,
      },
      {
        field: 'isAdjustDoc',
        title: '是否调价',
        minWidth: '100',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
        sortable: true,
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
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'invoiceLineId',
        title: '发票行号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'monthEndNo',
        title: '月结单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'finInvoiceId',
        title: '记账流水号',
        minWidth: '100',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 100,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '记账日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
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
            labelField: 'name',
            valueField: 'id',
            onChange(val: any) {
              departmentId.value = val;
            },
            afterFetch(res: any) {
              if (!departmentId.value) {
                gridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                gridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do',
            // showSearch: true,
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            onChange(val: any, option: any) {
              console.warn(val, option);
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            if (
              gridApi.formApi?.getFieldComponentRef &&
              typeof gridApi.formApi?.getFieldComponentRef === 'function' &&
              gridApi.formApi?.getFieldComponentRef('warehouseId') &&
              gridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              gridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              gridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
              gridApi.formApi?.setFieldValue('warehouseId', undefined);
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
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/productAction/productControlLevelList.do',
            // showSearch: true,
            placeholder: '请选择',
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: 1_000_007,
        fieldName: 'productControlLevel',
        label: userStore.userInfo?.['管控类型'] || '商品组',
      },
      {
        component: 'Input',
        fieldName: 'taxInvoiceNo',
        label: '发票号',
        componentProps: () => {
          return {
            placeholder: '请输入',
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'invoiceId',
        label: '发票单号',
        componentProps: () => {
          return {
            placeholder: '请输入',
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {
      cellClick({ column, row: { invoiceId } }: any) {
        if (column.field === 'invoiceId') {
          router.push({
            path: '/fin/invoice/invoiceQuery',
            query: {
              invoiceId,
            },
          });
        }
      },
    },
    beforeFetchFn: (params) => {
      console.warn('params', params);
      // 处理 dateTo 字段
      if (params.dateTo) {
        // 使用 dayjs 解析并设置为当天最后一秒
        params.dateTo = dayjs(params.dateTo)
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss');
      }

      // 可选:同时处理 dateFrom 确保为当天开始
      // if (params.dateFrom) {
      //   params.dateFrom = dayjs(params.dateFrom)
      //     .startOf('day')
      //     .format('YYYY-MM-DD HH:mm:ss');
      // }
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
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: childGridApi,
  },
);

// 父表 对话框
const [ReaccountingFormModal, reaccountingFormModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  confirmText: '过账',
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

/**
 * 页面弹窗表单配置
 */
const reaccountingFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'DatePicker',
      fieldName: 'dateFrom',
      label: '开始日期',
      rules: 'required',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'dateTo',
      label: '结束日期',
      rules: 'required',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/warehouse.do',
          // showSearch: true,
          placeholder: '请选择仓库',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // defaultValue: 1_000_007,
      fieldName: 'warehouseId',
      label: '仓库',
      // rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'invoiceId',
      label: '发票单号',
      // rules: 'required',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

function reaccounting() {
  reaccountingFormModalApi
    .setData({
      title: '重新记账',
      form: {
        dateFrom: dayjs()
          .subtract(1, 'month')
          .add(1, 'day')
          .format('YYYY-MM-DD'),
      },
      submit: ({ dateFrom, dateTo, ...extra }: any) => {
        return reaccountInvoice({
          dateFrom: `${dateFrom} 00:00:00`,
          dateTo: `${dateTo} 23:59:59`,
          ...extra,
        });
      },
    })
    .open();
}

// 父表 对话框
const [ModificationFormModal, modificationFormModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  confirmText: '过账',
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

/**
 * 页面弹窗表单配置
 */
const modificationFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      disabled: true,
      component: 'Input',
      fieldName: 'invoiceId',
      label: '发票单号',
    },
    {
      disabled: true,
      component: 'Input',
      fieldName: 'taxInvoiceNo',
      label: '发票号码',
    },
    {
      disabled: true,
      component: 'Input',
      fieldName: 'dateAcct',
      label: '原记账日期',
    },
    {
      component: 'DatePicker',
      fieldName: 'newDateAcct',
      label: '新记账日期',
      rules: 'required',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD HH:mm:ss',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          showTime: true,
        };
      },
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

function adjustBillingPeriod({ invoiceId, taxInvoiceNo, dateAcct }: any) {
  modificationFormModalApi
    .setData({
      title: '修改记账日期',
      form: {
        invoiceId,
        taxInvoiceNo,
        dateAcct,
      },
      submit: (params: any) => changeDateAcct(params),
    })
    .open();
}

onMounted(() => {
  gridApi.formApi.getValues().then((res: any) => {
    gridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ReaccountingFormModal
      :form-options="reaccountingFormOptions"
      :after-submit="gridApi.query"
    />
    <ModificationFormModal
      :form-options="modificationFormOptions"
      :after-submit="gridApi.query"
    />
    <Grid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="reaccounting"
          data-testid="button_reaccounting"
        >
          重新记账
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
        <Button
          type="primary"
          @click="handleParentExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
          <!--              <template #icon>-->
          <!--                <ExportActionIcon />-->
          <!--              </template>-->
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="adjustBillingPeriod(scope.row)"
          :data-testid="`button_adjustBillingPeriod_${scope.rowIndex}`"
        >
          调整账期
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
::v-deep(.vxe-grid--table-container .vxe-table--column.highlight) {
  color: #006afc;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
