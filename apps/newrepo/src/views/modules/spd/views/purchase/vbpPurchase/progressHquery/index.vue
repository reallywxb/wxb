<script lang="ts" setup>
import { ref } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo, handleShowQty } from '#/utils/util';

import { queryVBPInfoApi } from './api';

const queryVBPInfo = async (id: string) => {
  const params = {
    productType: 'H',
    pageNum: 1,
    pageSize: 100,
    limit: 5000,
  };
  const res = await queryVBPInfoApi(params);

  const record = res.rows || [];
  if (record.length > 0) {
    const selectedData =
      record.find((item: any) => String(item.vbpBatchId) === String(id)) || {};

    baseFormApi.setValues(selectedData);

    searchForm.value = selectedData;
    endDate.value = selectedData.endDate || '';
  } else {
    endDate.value = '';
    baseFormApi.setValues({});
    searchForm.value = {};
  }

  if (id) {
    baseFormApi.updateSchema([
      {
        component: 'Input',
        fieldName: 'typeName',
        label: '集采类型',
        disabled: true,
        dependencies: {
          triggerFields: ['endDate'],
          show: () => {
            return true;
          },
        },
      },
      {
        fieldName: 'beginDate',
        dependencies: {
          triggerFields: ['endDate'],
          show: () => {
            return true;
          },
        },
      },
    ]);
  } else {
    baseFormApi.updateSchema([
      {
        fieldName: 'typeName',
        dependencies: {
          triggerFields: ['endDate'],
          show: () => {
            return false;
          },
        },
      },
      {
        fieldName: 'beginDate',
        dependencies: {
          triggerFields: ['endDate'],
          show: () => {
            return false;
          },
        },
      },
    ]);
  }
};

const searchForm = ref<any>({});

const endDate = ref('');

// 自定义重置
const formReset = async () => {
  await chcGridApi.formApi.resetForm();
  baseFormApi.setValues({
    endDate: '',
  });
  endDate.value = '';
  baseFormApi.updateSchema([
    {
      fieldName: 'typeName',
      dependencies: {
        triggerFields: ['endDate'],
        show: () => {
          return false;
        },
      },
    },
    {
      fieldName: 'beginDate',
      dependencies: {
        triggerFields: ['endDate'],
        show: () => {
          return false;
        },
      },
    },
  ]);
  // const formValues = await chcGridApi.formApi.getValues();
  // console.log(formValues);
  // chcGridApi.formApi.setLatestSubmissionValues(formValues);
  // chcGridApi.query(formValues);
};

// 父表
const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      handleReset: formReset,
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
      cellStyle(scope: any) {
        if (
          scope.column.field === 'totalQty' &&
          (Number(scope.row.totalQty) < Number(scope.row.planQty) ||
            !scope.row.totalQty)
        ) {
          return {
            color: 'red',
          };
        }
        if (
          scope.column.field === 'nowPercent' &&
          (Number(scope.row.nowPercent) < Number(scope.row.planPercent) ||
            !scope.row.nowPercent)
        ) {
          return {
            color: 'red',
          };
        }
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/batchVBPAction/queryData.do',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'batchName',
        title: '批次',
        width: '80',
        sortable: true,
      },
      {
        field: 'batchType',
        title: '集采类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'beginDate',
        title: '开始时间',
        width: '100',
        sortable: true,
      },
      {
        field: 'endDate',
        title: '结束时间',
        width: '100',
        sortable: true,
      },

      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '80',
        sortable: true,
      },
      {
        field: 'productStyleName',
        title: '剂型',
        // hidden: type !== 'D',
        visible: false,
        width: '80',
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        // hidden: type !== 'Y',
        visible: false,
        width: '100',
        sortable: true,
      },
      {
        field: 'qtyType',
        title: '使用量类型',
        width: '100',
        sortable: true,
        // format: function (v) {
        //   return v == 'Q' ? '数量' : v == 'A' ? '金额' : v;
        // },
        formatter({ row }: any) {
          if (row.qtyType === 'Q') return '数量';
          return row.qtyType === 'A' ? '金额' : row.qtyType;
        },
      },
      {
        field: 'qtyPlaned',
        title: '约定使用量',
        width: '100',
        align: 'right',
        formatter({ row }: any) {
          return handleShowQty(row.qtyPlaned);
        },
        sortable: true,
      },
      {
        field: 'baseUomName',
        title: '使用单位',
        // hidden: isHc,
        visible: false,
        width: '90',
        sortable: true,
      },
      {
        field: 'monthPlanQty',
        title: '计划月均使用量',
        width: '150',
        formatter({ row }: any) {
          return handleShowQty(row.monthPlanQty);
        },
        sortable: true,

        align: 'right',
      },
      {
        field: 'planQty',
        title: '计划使用量',
        formatter({ row }: any) {
          return handleShowQty(row.planQty);
        },
        width: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'totalQty',
        title: '实际使用量',
        width: '100',
        // color: function (v, item) {
        //   console.log(v, item);
        //   console.log(Number(v) < Number(item.planQty));
        //   if (!v || Number(v) < Number(item.planQty)) {
        //     return 'red';
        //   }
        // },
        formatter({ row }: any) {
          return handleShowQty(row.totalQty);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'notVpbTotalQty',
        title: '非中标品种使用量',
        // format: '0.##',
        formatter({ row }: any) {
          return handleShowQty(row.notVpbTotalQty);
        },
        width: '130',
        align: 'right',
      },
      {
        field: 'planPercent',
        title: '计划进度',
        width: '120',
        sortable: true,
        // format: function (v) {
        //   return v ? (v * 100).toFixed(2) + '%' : '';
        // },
        formatter({ row }: any) {
          return row.planPercent
            ? `${(row.planPercent * 100).toFixed(2)}%`
            : '';
        },
        align: 'right',
      },
      {
        field: 'nowPercent',
        title: '实际进度',
        width: '120',
        sortable: true,
        // color: function (v, item) {
        //   if (v < item.planPercent) {
        //     return 'red';
        //   }
        // },

        // format: function (v) {
        //   return v ? (v * 100).toFixed(2) + '%' : '0%';
        // },
        formatter({ row }: any) {
          return row.nowPercent
            ? `${(row.nowPercent * 100).toFixed(2)}%`
            : '0%';
        },
        align: 'right',
      },
      {
        field: 'timePercent',
        title: '时间进度',
        width: '120',
        sortable: true,
        // format: function (v) {
        //   return v ? (v * 100).toFixed(2) + '%' : '0%';
        // },
        formatter({ row }: any) {
          return row.timePercent
            ? `${(row.timePercent * 100).toFixed(2)}%`
            : '0%';
        },
        align: 'right',
      },
      {
        field: 'price',
        title: '中选价格',
        width: '100',
        align: 'right',
        // format: '0.00##',
        formatter({ row }: any) {
          return row.price ? handlePriceToFixedTwo(row.price) : '0.00';
        },
        sortable: true,
      },
      { field: 'remark', title: '备注', width: '100', sortable: true },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/batchVBPAction/list.do?limit=5000&productType=H',
            // showSearch: true,
            placeholder: '请选择批次',
            onChange: (v: any) => {
              queryVBPInfo(v);
            },
            allowClear: true,
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
        fieldName: 'batchId',
        label: '批次',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,

            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '执行中' },
              { value: 'N', label: '未执行' },
              { value: 'CO', label: '已结束' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: 'Y',
        fieldName: 'status',
        label: '状态',
      },

      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        componentProps: {
          placeholder: '请输入药品名称',
        },
      },
    ],
    beforeFetchFn: (params) => {
      return {
        ...params,
        productType: 'H',
        endDate: endDate.value || '',
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

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    // colon: true,
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      // class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  compact: true,
  showCollapseButton: false,
  // id: 'BaseForm',
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'typeName',
      label: '集采类型',
      disabled: true,
      componentProps: () => {
        return {
          placeholder: '请选择批次',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'beginDate',
      label: '开始日期',
      disabled: true,
    },
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      label: '结束日期',
      componentProps: () => {
        return {
          showTime: true,
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          async onChange(v: any) {
            // 如果存在开始日期，且结束日期小于开始日期，提示错误
            const formValues = await baseFormApi.getValues();
            if (formValues.beginDate && v && v < formValues.beginDate) {
              message.error('结束日期不能小于开始日期');
              baseFormApi.setValues({
                endDate: '',
              });
              return;
            }
            endDate.value = v || '';
          },
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-5',
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <div>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleExport"
              data-testid="button_print"
            >
              <template #icon>
                <ExportActionIcon />
              </template>
              导出
            </Button>

            <div class="mt-[10px] w-full bg-[#f5f5f5] p-[5px] pt-[15px]">
              <BaseForm />
            </div>
          </div>
        </template>
      </ChcGrid>
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
