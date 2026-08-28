<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

const summaryData = ref<Record<string, any>>({});

// 父表
const [ParentGrid, parentGridApi, { handleExport: handleParentExport }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['settlementDateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
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
      }),
    },
    {
      id: 'settlementDetailQuery',
      // api地址
      queryUrl: '/settlementAction/queryDetail.do',
      gridColumns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'settlementNo',
          title: '结算单号',
          width: '100',
          sortable: true,
        },
        {
          field: 'settlementDate',
          title: '结算时间',
          width: '160',
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
          title: '采购仓库',
          width: '150',
          sortable: true,
        },
        {
          field: 'bpartnerName',
          title: '供应商',
          width: '200',
          sortable: true,
        },
        {
          field: 'endDate',
          title: '截止日期',
          width: '110',
          sortable: true,
        },
        {
          field: 'productCode',
          title: '药品编码',
          width: '110',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          width: '110',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          width: '110',
          sortable: true,
        },
        {
          field: 'manufacturer',
          title: '厂家',
          width: '110',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          width: '110',
          sortable: true,
        },
        {
          field: 'qty',
          title: '数量',
          width: '110',
          sortable: true,
          align: 'right',
        },
        // {
        //   field: 'isWorkflowEnd',
        //   title: '审批是否结束',
        //   formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
        //   width: '130',
        //   sortable: true,
        // },
        {
          field: 'price',
          title: '结算开票价',
          format: '0.00',
          width: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'pricePO',
          title: '结算入库价',
          format: '0.00',
          width: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'origPricePo',
          title: '采购入库价',
          format: '0.00',
          width: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lineAmt',
          title: '结算金额',
          format: '0.00',
          width: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'origPricePoAmt',
          title: '采购入库金额',
          // format: '0.000##',
          align: 'right',
          width: '120',
          sortable: true,
        },
        {
          field: 'amountAdj',
          title: '调价金额',
          // format: '0.000##',
          align: 'right',

          width: '100',
          sortable: true,
        },
        // {
        //   field: 'totalDiffAmt',
        //   title: '尾差金额',
        //   // format: '0.000##',
        //   width: '100',
        //   sortable: true,
        // },
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
          field: 'invoiceRule',
          title: '分票规则',
          width: '110',
          sortable: true,
        },
        {
          field: 'isNeedInvoice',
          title: '需开票',
          width: '80',
          formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
          sortable: true,
        },
        {
          field: 'openStatus',
          title: '开票状态',
          width: '100',
          sortable: true,
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'settlementDateRange',
          label: $t('fin.settlement.settlementInput.settlementDateRange'),
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
              dictUrl:
                '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
              placeholder: '请选择院区',
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
          fieldName: 'departmentId',
          label: '院区',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
              // showSearch: true,
              placeholder: '请选择采购仓库',
              paginate: false,
              immediate: true,
              showChooseAll: '',
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          dependencies: {
            triggerFields: ['departmentId'],
          },
          // defaultValue: '',
          // dependencies: {
          //   triggerFields: ['departmentId'],
          //   trigger(values) {
          //     if (
          //       parentGridApi.formApi?.getFieldComponentRef &&
          //       typeof parentGridApi.formApi?.getFieldComponentRef ===
          //         'function' &&
          //       parentGridApi.formApi?.getFieldComponentRef('warehouseId') &&
          //       parentGridApi.formApi?.getFieldComponentRef('warehouseId')
          //         .params
          //     ) {
          //       parentGridApi.formApi.getFieldComponentRef(
          //         'warehouseId',
          //       ).params.dependencies = {
          //         departmentId: values.departmentId,
          //       };
          //       parentGridApi.formApi
          //         ?.getFieldComponentRef('warehouseId')
          //         ?.fetchApi();
          //       parentGridApi.formApi?.setFieldValue('warehouseId', undefined);
          //     }
          //   },
          // },
          fieldName: 'warehouseId',
          formItemClass: 'pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
          label: '采购仓库',
        },
        {
          component: 'ChcSelect',
          fieldName: 'vendorId',
          label: '供应商',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/vendor.do',
              placeholder: `请选择供应商`,
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
          component: 'Input',
          fieldName: 'settlementNo',
          label: '结算单号',
          componentProps: () => {
            return {
              placeholder: ``,
              defaultValue: '',
            };
          },
        },
        {
          component: 'ChcSelect',
          fieldName: 'isNeedInvoice',
          label: '需开票',
          componentProps: () => {
            return {
              options: [
                { value: '', label: '全部' },
                { value: 'Y', label: '是' },
                { value: 'N', label: '否' },
              ],
              placeholder: ``,
              defaultValue: '',
              paginate: false,
              filterByFrontEnd: true,
              showChooseAll: '',
              immediate: true,
            };
          },
        },
      ],
      afterFetchFn: (params) => {
        summaryData.value.totalAmt = params.rows?.reduce(
          (pre, cur) => pre + cur.lineAmt,
          0,
        );
        setTimeout(() => {
          calculateSummarize();
        }, 200);
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

// function printDetail(row: any) {
//   Modal.confirm({
//     title: '提示',
//     content: '确认打印结算明细吗？',
//     onOk: async () => {
//       try {} catch {
//         message.error('操作失败');
//       }
//     },
//   });
// }
onMounted(() => {
  // 触发自动查询
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '金额汇总',
      value: summaryData.value.totalAmt?.toFixed(2),
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ParentGrid>
      <template #toolbar-actions>
        <!--            <Button type="primary" class="mr-[0.5rem]" @click="handlePrint">-->
        <!--              打印-->
        <!--              <template #icon>-->
        <!--                <SvgPrintFillIcon />-->
        <!--              </template>-->
        <!--            </Button>-->
        <Button
          type="primary"
          @click="handleParentExport"
          class="mr-[0.5rem]"
          data-testid="button_parentExport"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span>金额汇总: {{ summaryData.totalAmt?.toFixed(2) }} 元</span> -->
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
      </template>
    </ParentGrid>
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
