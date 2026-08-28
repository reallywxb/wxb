<script lang="ts" setup>
import { h, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import inOutDetailModal from './modals/inOutDetailModal.vue';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const isNarcotic = urlParams?.isNarcotic || '';
// 是否是科室库库存进销存页面
const isDepartmentWarehouse =
  route?.meta?.menuPageId === 'spd.web.wms.deption.storage.dailyEndGroupQuery';

const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  ChcGridApi.query({ ...formValues });
});
onMounted(() => {
  //   科室库库存进销存页面自动查询取消
  if (!isDepartmentWarehouse) {
    searchController.sign(3);
  }
});
const parentTableParams = ref({
  warehouseId: undefined,
  productId: undefined,
  dateFrom: '',
  dateTo: '',
});
const [InOutDetailModal, InOutDetailModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  draggable: true,
  connectedComponent: inOutDetailModal,
});

// 子表
const sonTableSummaryRow = ref<any[]>([]);
const [RoleGrid, roleGridApi, { handleExport: handleSonExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      showFooter: true,
      footerMethod: () => {
        return sonTableSummaryRow.value;
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', field: 'seq', width: 50, align: 'center' },
      {
        field: 'documentNo',
        title: '单据号',
        width: '120',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '日期',
        // width: '120',
        sortable: true,
      },
      {
        field: 'name',
        title: '业务对象',
        width: '160',
        sortable: true,
      },
      {
        field: 'movementTypeName',
        title: '业务类型',
        width: '120',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '单据类型',
        width: '120',
        sortable: true,
      },
      {
        field: 'inQty',
        title: '入库数量',
        width: '90',
        align: 'right',
        sortable: true,
        // summary: true,
      },
      {
        field: 'outQty',
        title: '出库数量',
        width: '90',
        align: 'right',
        sortable: true,
        // summary: true,
      },
      {
        field: 'endQty',
        title: '结余数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        width: '70',
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
        field: 'priceAsi',
        title: '批次进价',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'realName',
        title: '经办人',
        minWidth: '150',
        sortable: true,
      },
    ],
    id: 'dailyEndGroupQuery_son',
    formSchema: [
      // {
      //   component: 'Input',
      //   fieldName: 'productName2',
      //   label: '药品',
      //   componentProps: {
      //     placeholder: '编码/拼音码/名称',
      //   },
      // },
      {
        label: '单据类型',
        fieldName: 'docType',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/list.OrderType',
            placeholder: '请选择单据类型',
            allowClear: true,
          };
        },
      },
    ],
    tableSearchExtraParams: {
      summaryCols: 'inQty,outQty',
    },
    queryUrl: '/dailyEndAction/queryDailyDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.productId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    afterFetchFn: (params) => {
      params.rows.forEach((item: any, index: number) => {
        item.seq = index + 1;
      });
      if (params.summaryRow) {
        sonTableSummaryRow.value = [
          {
            ...params.summaryRow,
            seq: '合计',
          },
        ];
      }
      console.warn('子表 afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const fatherTableSummaryRow = ref<any[]>([]);
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
      showFooter: true,
      footerMethod: () => {
        return fatherTableSummaryRow.value;
      },
    }),
  },
  {
    id: 'dailyEndGroupQuery',
    queryUrl: '/dailyEndAction/queryDailyEndGroup.do',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false, align: 'center' },
      { title: '序号', field: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        // color: 'red',
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        width: '150',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '150',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'qtyOnHandLeft',
        title: '可用库存',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'beginQty',
        title: '期初数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'beginPOAmt',
        title: '期初进价金额',
        width: '120',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'beginPriceListAmt',
        title: '期初零售价金额',
        width: '130',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'inStockQty',
        title: '总入库数量',
        width: '100',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('inStockQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_inStockQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.inStockQty },
            );
          },
        },
      },
      {
        field: 'POQty',
        title: '采购入库数量',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('POQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_POQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.POQty },
            );
          },
        },
      },
      {
        field: 'POAmt',
        title: '采购入库金额',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('POAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_POAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.POAmt },
            );
          },
        },
      },
      {
        field: 'MIQty',
        title: '调拨入库数量',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('MIQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_MIQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.MIQty },
            );
          },
        },
      },
      {
        field: 'MIAmt',
        title: '调拨入库金额',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('MIAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_MIAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.MIAmt },
            );
          },
        },
      },
      {
        field: 'SRQty',
        title: '科退入库数量',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('SRQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_SRQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.SRQty },
            );
          },
        },
      },
      {
        field: 'SRAmt',
        title: '科退入库金额',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('SRAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_SRAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.SRAmt },
            );
          },
        },
      },
      {
        field: 'PSRQty',
        title: '销退入库数量',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('PSRQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_PSRQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.PSRQty },
            );
          },
        },
      },
      {
        field: 'PSRAmt',
        title: '销退入库金额',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('PSRAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_PSRAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.PSRAmt },
            );
          },
        },
      },
      {
        field: 'IIQty',
        title: '报溢入库数量',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('IIQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_IIQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.IIQty },
            );
          },
        },
      },
      {
        field: 'IIAmt',
        title: '报溢入库金额',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('IIAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_IIAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.IIAmt },
            );
          },
        },
      },
      {
        field: 'inStockPOAmt',
        title: '入库进价金额',
        width: '120',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'inStockPriceListAmt',
        title: '入库零售价金额',
        align: 'right',
        width: '130',
        // summary: true,
        sortable: true,
      },
      {
        field: 'outStockQty',
        title: '总出库数量',
        width: '120',
        align: 'right',
        // hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('outStockQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_outStockQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.outStockQty },
            );
          },
        },
      },
      {
        field: 'PRQty',
        title: '采退出库数量',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('PRQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_PRQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.PRQty },
            );
          },
        },
      },
      {
        field: 'PRAmt',
        title: '采退出库金额',
        width: '120',
        align: 'right',
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('PRAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_PRAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.PRAmt },
            );
          },
        },
      },
      {
        field: 'MOQty',
        title: '调拨出库数量',
        width: '120',
        align: 'right',
        // hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('MOQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_MOQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.MOQty },
            );
          },
        },
      },
      {
        field: 'MOAmt',
        title: '调拨出库金额',
        width: '120',
        align: 'right',
        // hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('MOAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_MOAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.MOAmt },
            );
          },
        },
      },
      {
        field: 'SOQty',
        title: '科领出库数量',
        width: '120',
        align: 'right',
        // hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('SOQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_SOQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.SOQty },
            );
          },
        },
      },
      {
        field: 'SOAmt',
        title: '科领出库金额',
        width: '120',
        align: 'right',
        //  hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('SOAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_SOAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.SOAmt },
            );
          },
        },
      },
      {
        field: 'PSOQty',
        title: '销售出库数量',
        width: '120',
        align: 'right',
        //  hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('PSOQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_PSOQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.PSOQty },
            );
          },
        },
      },
      {
        field: 'PSOAmt',
        title: '销售出库金额',
        width: '120',
        align: 'right',
        // hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('PSOAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_PSOAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.PSOAmt },
            );
          },
        },
      },
      {
        field: 'IOQty',
        title: '报损出库数量',
        width: '120',
        align: 'right',
        //  hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('IOQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_IOQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.IOQty },
            );
          },
        },
      },
      {
        field: 'IOAmt',
        title: '报损出库金额',
        width: '120',
        align: 'right',
        //  hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('IOAmt'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_IOAmt_${scope.rowIndex}`,
              },
              { default: () => scope.row.IOAmt },
            );
          },
        },
      },
      {
        field: 'outStockPOAmt',
        title: '出库进价金额',
        width: '120',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'outStockPriceListAmt',
        title: '出库零售价金额',
        width: '130',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'adjPOAmt',
        title: '进价调整金额',
        width: '120',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'adjPriceListAmt',
        title: '零售价调整金额',
        width: '130',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'pricePODiffAmt',
        title: '出库价差金额',
        width: '120',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'endQty',
        title: '期末数量',
        width: '90',
        align: 'right',
        //   hover: true,
        sortable: true,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                size: 'small',
                type: 'link',
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  const { modalTitle } = getModalSomeParams(scope.column.field);
                  if (!modalTitle) {
                    return;
                  }
                  InOutDetailModalApi.setData({
                    ...getModalSomeParams('endQty'),
                    row: scope.row,
                  }).open();
                },
                'data-testid': `button_endQty_${scope.rowIndex}`,
              },
              { default: () => scope.row.endQty },
            );
          },
        },
      },
      {
        field: 'endPOAmt',
        title: '期末进价金额',
        width: '120',
        align: 'right',
        // summary: true,
        sortable: true,
      },
      {
        field: 'endPriceListAmt',
        title: '期末零售价金额',
        width: '130',
        align: 'right',
        // summary: true,
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
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '期间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
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
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择仓库',
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
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
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

                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }, 100);
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '编码/拼音码/名称',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '药品组',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000244',
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
        fieldName: 'productCategoryId',
        label: '药品类别',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
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
        fieldName: 'productType',
        label: '商品分类',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000380',
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
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('radioChange:', row);
        if (row && row.warehouseId && row.dateFrom) {
          parentTableParams.value.warehouseId = row.warehouseId;
          parentTableParams.value.productId = row.productId;
          parentTableParams.value.dateFrom = row.dateFrom;
          parentTableParams.value.dateTo = row.dateTo;
          console.warn('radioChange 2', parentTableParams.value);
          roleGridApi.query({
            warehouseId: row.warehouseId,
            productId: row.productId,
            dateFrom: row.dateFrom,
            dateTo: row.dateTo,
          });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.warehouseId = undefined;
          parentTableParams.value.productId = undefined;
          parentTableParams.value.dateFrom = '';
          parentTableParams.value.dateTo = '';
          console.warn('radioChange 3', parentTableParams.value);
          roleGridApi?.grid?.remove();
        }
      },
    },
    beforeFetchFn: (params) => {
      params.isNarcotic = isNarcotic;
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      params.rows.forEach((item: any, index: number) => {
        item.seq = index + 1;
      });
      if (params.summaryRow) {
        fatherTableSummaryRow.value = [
          {
            ...params.summaryRow,
            seq: '合计',
          },
        ];
      }

      return {
        ...params,
        records: params.rows,
      };
    },
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: {
      summaryCols: `beginPOAmt,beginPriceListAmt,inStockQty,POQty,POAmt,MIQty,MIAmt,SRQty,SRAmt,PSRQty,PSRAmt,IIQty,IIAmt,inStockPOAmt,inStockPriceListAmt,outStockQty,PRQty,PRAmt,MOQty,MOAmt,SOQty,SOAmt,PSOQty,PSOAmt,IOQty,IOAmt,outStockPOAmt,outStockPriceListAmt,adjPOAmt,adjPriceListAmt,pricePODiffAmt,endQty,endPOAmt,endPriceListAmt`,
    },
  },
);

function getModalSomeParams(fieldName: string) {
  let titleName = '';
  let inoutType = '';
  switch (fieldName) {
    case 'endQty': {
      titleName = '出入库明细';
      inoutType = 'endQty';

      break;
    }
    case 'IIQty': {
      titleName = '报溢入库明细';
      inoutType = 'IIQty';

      break;
    }
    case 'inStockQty': {
      titleName = '入库明细';
      inoutType = 'inPut';

      break;
    }
    case 'IOQty': {
      titleName = '报损出库明细';
      inoutType = 'IOQty';

      break;
    }
    case 'MIQty': {
      titleName = '调拨入库明细';
      inoutType = 'MIQty';

      break;
    }
    case 'MOQty': {
      titleName = '调拨出库明细';
      inoutType = 'MOQty';

      break;
    }
    case 'outStockQty': {
      titleName = '出库明细';
      inoutType = 'outPut';

      break;
    }
    case 'POQty': {
      titleName = '采购入库明细';
      inoutType = 'POQty';

      break;
    }
    case 'PRQty': {
      titleName = '采退出库明细';
      inoutType = 'PRQty';

      break;
    }
    case 'PSOQty': {
      titleName = '销售出库明细';
      inoutType = 'PSOQty';

      break;
    }
    case 'PSRQty': {
      titleName = '销退入库明细';
      inoutType = 'PSRQty';

      break;
    }
    case 'SOQty': {
      titleName = '科领出库明细';
      inoutType = 'SOQty';

      break;
    }
    case 'SRQty': {
      titleName = '科退入库明细';
      inoutType = 'SRQty';

      break;
    }
    // No default
  }
  return {
    modalTitle: titleName,
    inoutType,
  };
}
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <InOutDetailModal />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleExport"
                class="mr-[0.5rem]"
                data-testid="button_export_dailyEndGroupQuery"
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
          <RoleGrid>
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleSonExport"
                class="mr-[0.5rem]"
                data-testid="button_export_son_dailyEndGroupQuery"
              >
                导 出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
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
