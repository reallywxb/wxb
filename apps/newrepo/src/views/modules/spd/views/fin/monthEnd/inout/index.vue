<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  getInoutAction,
  reaccount,
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
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      cellClassName({ column }: any) {
        return column.field === 'inoutId' ? 'highlight' : null;
      },
    }),
  },
  {
    id: 'monthEndInout',
    // api地址
    queryUrl: 'finInoutAction/query.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'dateAcct',
        title: '记账日期',
        minWidth: '100',
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
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        color: 'red',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '业务类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '80',
        align: 'right',
        summary: true,
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'endQty',
        title: '结余数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        minWidth: '90',
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'amt',
        title: '进价金额',
        minWidth: '110',
        align: 'right',
        summary: true,
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'priceDiffAmt',
        title: '价差金额',
        minWidth: '90',
        align: 'right',
        summary: true,
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        minWidth: '90',
        align: 'right',
        format: '0.00####',
        sortable: true,
      },
      {
        field: 'amtPriceList',
        title: '零售价金额',
        minWidth: '110',
        align: 'right',
        format: '0.00####',
        summary: true,
        sortable: true,
      },
      {
        field: 'inoutNo',
        title: '出入库单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'inoutLineId',
        title: '出入库单行号',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'monthEndId',
        title: '月结单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'finInoutId',
        title: '记账流水号',
        minWidth: '100',
        sortable: true,
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
              return { ...res, rows: undefined, records: res.rows || [] };
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
            dictUrl:
              '/baseHandleAction/refList.do?id=FIN_InOut.MovementType&exclude=MT,MR',
            // showSearch: true,
            placeholder: '请选择业务类型',
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
        fieldName: 'movementType',
        label: '业务类型',
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
        fieldName: 'inoutId',
        label: '出入库单号',
        componentProps: () => {
          return {
            placeholder: '请输入',
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {
      async cellClick({ column, row: { inoutId } }: any) {
        if (column.field === 'inoutId') {
          try {
            const { rows } = await getInoutAction({
              inoutId,
            });

            if (rows?.length > 0) {
              const [{ movementType }] = rows;

              const lastChar = movementType ? movementType.slice(-1) : '';

              if (movementType === 'PAJ') {
                // 库存调价单
                router.push({
                  path: '/fin/finQuery/pajQuery',
                  query: {
                    inoutNo: inoutId,
                  },
                });
              } else if (lastChar === '+') {
                // 入库单
                router.push({
                  path: '/fin/finQuery/receiveQuery',
                  query: {
                    inoutNo: inoutId,
                  },
                });
              } else if (lastChar === '-') {
                // 出库单
                router.push({
                  path: '/fin/finQuery/shipmentQuery',
                  query: {
                    inoutNo: inoutId,
                  },
                });
              } else message.error(`不支持的业务类型：${movementType}`);
            } else message.error(`业务单据未找到：${inoutId}`);
          } catch (error: Error) {
            message.error('接口调用失败,', error.message);
          }
        }
      },
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
      fieldName: 'inoutId',
      label: '出入库单号',
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
        return reaccount({
          dateFrom: `${dateFrom} 00:00:00`,
          dateTo: `${dateTo} 23:59:59`,
          ...extra,
        });
      },
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
