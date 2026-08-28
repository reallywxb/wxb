<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const summaryData = ref<Record<string, any>>({});

const formSubmit = async () => {
  const formValues = await parentGridApi.formApi.getValues();
  console.warn('formSubmit', formValues);
  // 起始日期是必选项
  if (!formValues.dateFrom) {
    Modal.error({
      title: '提示',
      content: '请选择起始日期',
      width: 280,
      centered: true,
    });
    return;
  }
  parentGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  parentGridApi.query(formValues);
};

const formReset = async () => {
  await parentGridApi.formApi.resetForm();
  const formValues = await parentGridApi.formApi.getValues();
  if (!formValues.dateFrom) {
    Modal.error({
      title: '提示',
      content: '请选择起始日期',
      width: 280,
      centered: true,
    });
    return;
  }
  parentGridApi.formApi.setLatestSubmissionValues(formValues);
  parentGridApi.query(formValues);
};

// 父表
const [ParentGrid, parentGridApi, { handleExport: handleParentExport }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        handleSubmit: formSubmit,
        handleReset: formReset,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'settlementCheck',
      // api地址
      queryUrl: '/baseHandleAction/invokeEngin.do',
      gridColumns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'bpartnercode',
          minWidth: 120,
          sortable: true,
          title: '供应商编码',
        },
        {
          field: 'vendorname',
          minWidth: 120,
          sortable: true,
          title: '供应商名称',
        },
        {
          field: 'productCode',
          title: '药品编码',
          minWidth: 120,
          sortable: true,
        },
        {
          field: 'productname',
          title: '药品名称',
          minWidth: 120,
          sortable: true,
        },
        {
          field: 'productspec',
          title: '规格',
          minWidth: 120,
          sortable: true,
        },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: 120,
          sortable: true,
        },
        {
          field: 'uomname',
          title: '单位',
          width: '110',
          sortable: true,
        },
        {
          field: 'Price',
          title: '采购价',
          width: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: '发货登记数量',
          title: '发货登记数量',
          align: 'right',
          width: '120',
          sortable: true,
        },
        {
          field: '应结算数量',
          title: '应结算数量',
          align: 'right',

          width: '110',
          sortable: true,
        },
        {
          field: '应结算金额',
          title: '应结算金额',
          width: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: '报损出库数量',
          title: '报损出库数量',
          align: 'right',

          width: '120',
          sortable: true,
        },
        {
          field: '期末待结算数量',
          title: '期末待结算数量',
          align: 'right',

          width: '130',
          sortable: true,
        },
        {
          field: '期末待结算金额',
          title: '期末待结算金额',
          width: '130',
          align: 'right',
          sortable: true,
        },
        {
          field: '本期结算上期数量',
          title: '本期结算上期数量',
          align: 'right',
          width: '140',
          sortable: true,
        },
        {
          field: '本期结算上期金额',
          title: '本期结算上期金额',
          width: '140',
          align: 'right',
          sortable: true,
        },
        {
          field: '结算数量',
          title: '结算数量',
          align: 'right',

          width: '110',
          sortable: true,
        },
        {
          field: '结算金额',
          title: '结算金额',
          width: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: '请退入库数量',
          title: '请退入库数量',
          align: 'right',

          width: '120',
          sortable: true,
        },
        {
          field: '请领出库数量',
          title: '请领出库数量',
          align: 'right',

          width: '120',
          sortable: true,
        },
        {
          field: '采退出库数量',
          title: '采退出库数量',
          align: 'right',

          width: '120',
          sortable: true,
        },

        // {
        //   field: 'isWorkflowEnd',
        //   title: '审批是否结束',
        //   formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
        //   width: '130',
        //   sortable: true,
        // },
        // {
        //   field: 'price',
        //   title: '结算开票价',
        //   format: '0.00',
        //   width: '100',
        //   align: 'right',
        //   sortable: true,
        // },
        // {
        //   field: 'pricePO',
        //   title: '结算入库价',
        //   format: '0.00',
        //   width: '100',
        //   align: 'right',
        //   sortable: true,
        // },
        // {
        //   field: 'origPricePo',
        //   title: '采购入库价',
        //   format: '0.00',
        //   width: '100',
        //   align: 'right',
        //   sortable: true,
        // },
        // {
        //   field: 'lineAmt',
        //   title: '结算金额',
        //   format: '0.00',
        //   width: '100',
        //   align: 'right',
        //   sortable: true,
        // },
        // {
        //   field: 'origPricePoAmt',
        //   title: '采购入库金额',
        //   // format: '0.000##',
        //   align: 'right',
        //   width: '120',
        //   sortable: true,
        // },
        // {
        //   field: 'amountAdj',
        //   title: '调价金额',
        //   // format: '0.000##',
        //   width: '100',
        //   sortable: true,
        // },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'date',
          label: $t('fin.settlement.settlementInput.settlementDateRange'),
          // defaultValue: [
          //   dayjs(dayjs().format('YYYY-MM-DD'))
          //     .subtract(7, 'day')
          //     .format('YYYY-MM-DD'),
          //   dayjs(dayjs().format('YYYY-MM-DD')),
          // ],
          defaultValue: ['', dayjs(dayjs().format('YYYY-MM-DD'))],
          formItemClass: 'col-span-1',
        },
        {
          component: 'Input',
          fieldName: 'productname',
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
      ],
      afterFetchFn: (params) => {
        summaryData.value = params.sumary;
        return {
          ...params,
          records: params.rows,
        };
      },
      tableSearchExtraParams: {
        menuId: 'settlement/settlement.checkQuery.xml',
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
  // parentGridApi.formApi.getValues().then((res: any) => {
  //   parentGridApi.query({ ...res });
  // });
});
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
        <span
          class="mr-[1rem]"
          v-for="pair of Object.entries(summaryData)"
          :key="pair[0]"
        >
          <span>{{ pair[0] }}:{{ pair[1] }}</span>
        </span>
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
