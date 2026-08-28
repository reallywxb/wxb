<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { reactive, ref, toRaw } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page, useVbenModal } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';
import {
  approveMonthEnd,
  rejectMonthEnd,
} from '#/views/modules/spd/views/fin/monthEnd/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import inoutDetailComp from '../common/modals/inoutDetail.vue';
import invoiceDetailComp from '../common/modals/invoiceDetail.vue';
import noInvCreditDetailComp from '../common/modals/noInvCreditDetail.vue';
import noInvDebitDetailComp from '../common/modals/noInvDebitDetail.vue';
import { isEmpty } from '@vben/utils';

// const route = useRoute();

const showPriceList = false;
// route.query.showPriceList === 'Y' || route.query.showPriceList === 'y';

const parentTableParams = ref<{ [key: string]: any }>({});
const childSummary = reactive({
  endPOAmt: 0, // 期末库存金额
  adjPOAmt: 0, // 库存调价金额
  ioOutStockPOAmt: 0, // 损溢出库金额
  soOutStockPOAmt: 0, // 消耗出库金额
  moAmt: 0, // 调拨出库金额
  miAmt: 0, // 调拨入库金额
  poInStockPOAmt: 0, // 采购入库金额
  beginPOAmt: 0, // 期初库存金额
});
const hospitalId = ref(null);
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

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
        handleSubmit: async () => {
          const formValues = await parentGridApi.formApi.getValues();
          if (!formValues.hospitalId) {
            message.warn('医院必选，请选择医院');
            return;
          }
          parentGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          parentGridApi.reload(formValues);
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          trigger: 'cell',
          highlight: true,
        },
        radioConfig: {
          trigger: 'row',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
        cellClassName({ column }: any) {
          return [
            'adjPOAmt',
            'adjPriceListAmt',
            'adjustInvPOAmt',
            'endPOAmt',
            'invoicePriceDiffAmt',
            'ioOutStockPOAmt',
            'ioOutStockPriceListAmt',
            'miAmt',
            'miPriceListAmt',
            'moAmt',
            'moPriceListAmt',
            'noInvPOAmtCredit',
            'noInvPOAmtDebit',
            'noInvPriceListAmtCredit',
            'noInvPriceListAmtDebit',
            'poInStockPriceListAmt',
            'poInvPOAmt',
            'pricePODiffAmt',
            'soOutStockPOAmt',
            'soOutStockPriceListAmt',
          ].includes(column.field)
            ? 'highlight'
            : null;
        },
      }),
    },
    {
      id: 'monthEndApproval',
      // api地址
      queryUrl: 'finMonthEndAction/query.do?page=approve',
      showRadioRowTag: true,
      gridColumns: [
        { title: '单选', type: 'radio', visible: false },
        { type: 'checkbox', title: '', width: 50, align: 'center' },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'departmentName',
          title: '院区',
          minWidth: '150',
          children: [
            {
              field: 'beginPOAmt',
              title: '期初库存金额',
              minWidth: '120',
              align: 'right',

              sortable: true,
            },
          ],
        },
        {
          field: 'warehouseName',
          title: '仓库',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'dateFrom',
          title: '期初日期',
          minWidth: '140',
          sortable: true,
        },
        {
          field: 'dateTo',
          title: '期末日期',
          minWidth: '140',
          sortable: true,
        },
        {
          field: 'lastPeriodBalancePO',
          title: '上期结存(进价)',
          align: 'center',
          children: [
            {
              field: 'beginNoInvPOAmt',
              title: '期初未到票金额',
              minWidth: '130',
              align: 'right',

              format: '0.00####',
              sortable: true,
            },
            {
              field: 'beginPriceListAmt',
              title: '期初库存零售价金额',
              minWidth: '160',
              align: 'right',

              visible: showPriceList,
              format: '0.00####',
              sortable: true,
            },
          ],
        },
        // {
        //   title: '上期结存(零售价)',
        //   align: 'center',
        //   visible: showPriceList,
        //   children: [
        //     {
        //       field: 'beginNoInvPriceListAmt',
        //       title: '期初未到票零售价金额',
        //       minWidth: '170',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'poInStockPOAmt', // 采购-采退
        //       title: '采购入库金额',
        //       minWidth: '120',
        //       align: 'right',
        //
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //   ],
        // },
        {
          field: 'currentPeriodPO',
          title: '本期(进价)',
          align: 'center',
          children: [
            {
              field: 'poInvPOAmt',
              title: '采购发票金额',
              minWidth: '120',
              align: 'right',

              format: '0.00####',
              sortable: true,
            },
            {
              field: 'invoicePriceDiffAmt',
              title: '发票价差金额',
              minWidth: '120',

              align: 'right',
              format: '0.00####',
              hover: true,
              sortable: true,
            },
            {
              field: 'noInvPOAmtDebit',
              title: '未到票新增金额',
              minWidth: '150',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
            },
            {
              field: 'noInvPOAmtCredit',
              title: '未到票核销金额',
              minWidth: '150',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
            },
            {
              field: 'miAmt', // 调入
              title: '调拨入库金额',
              minWidth: '120',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
            },
            {
              field: 'moAmt', // 调出
              title: '调拨出库金额',
              minWidth: '120',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
            },
            {
              field: 'soOutStockPOAmt', // 消耗出库金额:销售-销退
              title: '消耗出库金额',
              minWidth: '120',
              align: 'right',
              format: '0.00####',

              hover: true,
              sortable: true,
            },
            {
              field: 'ioOutStockPOAmt', // 报损出库金额：报损-报溢
              title: '损溢出库金额',
              minWidth: '120',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
            },
            {
              field: 'pricePODiffAmt',
              title: '出库价差金额',
              minWidth: '120',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
            },
            {
              field: 'adjPOAmt',
              title: '调价金额',
              minWidth: '110',
              align: 'right',

              hover: true,
              format: '0.00####',
              sortable: true,
              //		}, {
              //			"field": "adjustInvPOAmt",
              //			"title": "调价发票金额",
              //			"minWidth": "110",
              //			"align": "right",
              //			"summary": true,
              //			"sortable": true
            },
            {
              field: 'poInStockPriceListAmt',
              title: '采购入库零售价金额',
              minWidth: '160',
              align: 'right',

              visible: showPriceList,
              hover: true,
              format: '0.00####',
              sortable: true,
            },
          ],
        },
        // {
        //   title: '本期(零售价)',
        //   align: 'center',
        //   visible: showPriceList,
        //   children: [
        //     {
        //       field: 'miPriceListAmt',
        //       title: '调拨入库零售价金额',
        //       minWidth: '160',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'moPriceListAmt',
        //       title: '调拨出库零售价金额',
        //       width: '160',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'soOutStockPriceListAmt',
        //       title: '消耗出库零售价金额',
        //       minWidth: '160',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'ioOutStockPriceListAmt',
        //       title: '损溢出库零售价金额',
        //       minWidth: '160',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'adjPriceListAmt',
        //       title: '调价零售价金额',
        //       minWidth: '140',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'noInvPriceListAmtDebit',
        //       title: '未到票新增零售价金额',
        //       minWidth: '170',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'noInvPriceListAmtCredit',
        //       title: '未到票核销零售价金额',
        //       minWidth: '170',
        //       align: 'right',
        //
        //       visible: showPriceList,
        //       hover: true,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //     {
        //       field: 'endPOAmt',
        //       title: '期末库存金额',
        //       minWidth: '120',
        //       align: 'right',
        //       hover: true,
        //
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //   ],
        // },
        {
          field: 'currentPeriodBalancePO',
          title: '本期结存(进价)',
          align: 'center',
          children: [
            {
              field: 'endNoInvPOAmt',
              title: '期末未到票金额',
              minWidth: '130',
              align: 'right',

              format: '0.00####',
              sortable: true,
            },
            {
              field: 'endPriceListAmt',
              title: '期末零售价库存金额',
              minWidth: '160',
              align: 'right',

              visible: showPriceList,
              format: '0.00####',
              sortable: true,
            },
          ],
        },
        // {
        //   title: '本期结存(零售价)',
        //   align: 'center',
        //   visible: showPriceList,
        //   children: [
        //     {
        //       field: 'endNoInvPriceListAmt',
        //       title: '期末未到票零售价金额',
        //       minWidth: '170',
        //       align: 'right',
        //       visible: showPriceList,
        //       format: '0.00####',
        //       sortable: true,
        //     },
        //   ],
        // },
        {
          field: 'createdByName',
          title: '创建人',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'created',
          title: '创建时间',
          minWidth: '140',
          sortable: true,
        },
        {
          field: 'completeUserName',
          title: '审核人',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'completeTime',
          title: '审核时间',
          minWidth: '140',
          sortable: true,
        },
        {
          field: 'docStatusName',
          title: '单据状态',
          minWidth: '90',
          sortable: true,
        },
        {
          field: 'rejectReason',
          title: '驳回原因',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'monthEndNo',
          title: '月结单号',
          minWidth: '90',
          sortable: true,
        },
        // {
        //   align: 'center',
        //   field: 'action',
        //   slots: { default: 'action' },
        //   fixed: 'right',
        //   headerAlign: 'center',
        //   showOverflow: false,
        //   title: $t('system.menu.operation'),
        //   width: 230,
        // },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'date',
          label: '期末日期',
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
              autoChooseFirstOption: true,
              dictUrl: '/hospitalAction/queryHospList?dataType=all',
              placeholder: '请选择医院',
              paginate: false,
              showChooseAll: false,
              immediate: true,
              labelField: 'hospitalName',
              valueField: 'orgId',
              onChange(val: any, option: any) {
                console.warn('hospitalId', val, option);
                hospitalId.value = val;
              },
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res?.data || [] };
              },
            };
          },
          fieldName: 'hospitalId',
          label: '医院',
        },
        {
          fieldName: 'departmentId',
          label: '院区',
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
              triggerFields: ['hospitalId'],
              onChange() {
                warehouseIdExtraParams.value.hospitalId =
                  hospitalId.value || '';
              },
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },

          dependencies: {
            triggerFields: ['hospitalId'],
            async trigger(values) {
              console.warn('trigger values:', values);
              const cond = !!(
                parentGridApi.formApi &&
                parentGridApi.formApi.getFieldComponentRef
              );
              warehouseIdExtraParams.value.hospitalId = values?.hospitalId;
              if (cond) {
                const departmentIdRef =
                  parentGridApi.formApi?.getFieldComponentRef<
                    InstanceType<typeof ChcSelect>
                  >('departmentId');
                if (departmentIdRef) {
                  if (values?.hospitalId) {
                    departmentIdRef.params.dependencies = {
                      hospitalId: values.hospitalId,
                    };
                    const selectOptions = await departmentIdRef.fetchApi();
                    // 选第一个不是全部的id
                    const item = selectOptions.filter(
                      (o: Record<string, any>) => !isEmpty(o?.id),
                    )?.[0];
                    parentGridApi.formApi?.setFieldValue(
                      'departmentId',
                      item?.id || undefined,
                    );
                  } else {
                    departmentIdRef.clearOptions();
                    parentGridApi.formApi?.setFieldValue(
                      'departmentId',
                      undefined,
                    );
                  }
                }
              }
            },
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do',
              placeholder: '请选择收货仓库',
              triggerFields: ['departmentId', 'regionId'],
              paginate: false,
              onChange(val: any, option: any) {
                console.warn(val, option);
              },
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              extraParams: warehouseIdExtraParams.value,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          dependencies: {
            triggerFields: ['departmentId', 'regionId'],
            trigger(values: any) {
              const compRef =
                parentGridApi.formApi.getFieldComponentRef?.('warehouseId');
              if (compRef) {
                compRef.params.dependencies = {
                  regionId: values.departmentId,
                  departmentId: values.departmentId,
                };

                compRef.fetchApi();
                parentGridApi.formApi.setFieldValue('warehouseId', undefined);
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
          label: '单据状态',
          component: 'Select',
          componentProps: {
            allowClear: true,
            options: [
              { value: '', label: '全部' },
              { value: 'DR', label: '新建' },
              { value: 'WA', label: '待审批' },
              { value: 'CO', label: '已确认' },
              { value: 'NA', label: '未批准' },
            ],
            placeholder: '请选择',
            defaultValue: '',
          },
          fieldName: 'docStatus',
        },
      ],
      gridEvents: {
        checkboxChange: onCheckboxChange,
        checkboxAll: onCheckboxChange,
        radioChange: onRadioChange,

        cellClick: onCellClick(),
      },
      afterFetchFn: (params) => {
        childGridApi.grid.reloadData([]);
        parentTableParams.value.monthEndId = undefined;

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

// 子表
const [ChildGrid, childGridApi, { handleExport: handleChildExport }] =
  useSpdGrid(
    {
      gridOptions: {
        columns: [
          // {
          //   type: 'checkbox',
          //   width: 50,
          //   align: 'center',
          // },
          { title: '序号', type: 'seq', width: 50, align: 'center' },
          {
            field: 'productName',
            title: '药品名称',
            minWidth: '150',
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
            title: '厂家',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'uomName',
            title: '单位',
            minWidth: '60',
            sortable: true,
          },
          {
            field: 'lastPeriodBalancePO',
            title: '上期结存(进价)',
            align: 'center',
            children: [
              {
                field: 'beginPOAmt',
                title: '期初库存金额',
                minWidth: '120',
                align: 'right',

                format: '0.00####',
                sortable: true,
              },
              {
                field: 'beginNoInvPOAmt',
                title: '期初未到票金额',
                minWidth: '130',
                align: 'right',

                format: '0.00####',
                sortable: true,
              },
              {
                field: 'beginQty',
                title: '期初数量',
                minWidth: '90',
                align: 'right',
                sortable: true,
              },
            ],
          },
          // {
          //   title: '上期结存(零售价)',
          //   align: 'center',
          //   visible: showPriceList,
          //   children: [
          //     {
          //       field: 'beginPriceListAmt',
          //       title: '期初库存零售价金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'beginNoInvPriceListAmt',
          //       title: '期初未到票零售价金额',
          //       minWidth: '170',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //   ],
          // },
          {
            field: 'currentPeriodPO',
            title: '本期(进价)',
            align: 'center',
            children: [
              {
                field: 'poInStockPOAmt', // 采购-采退
                title: '采购入库金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'poInStockQty',
                title: '采购入库数量',
                minWidth: '120',
                align: 'right',
                hover: true,
                sortable: true,
              },
              {
                field: 'poInvPOAmt',
                title: '采购发票金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'invoicePriceDiffAmt',
                title: '发票价差金额',
                minWidth: '120',

                align: 'right',
                format: '0.00####',
                hover: true,
                sortable: true,
              },
              {
                field: 'noInvPOAmtDebit',
                title: '未到票新增金额',
                minWidth: '150',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'noInvPOAmtCredit',
                title: '未到票核销金额',
                minWidth: '150',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'miAmt', // 调入
                title: '调拨入库金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'miQty',
                title: '调拨入库数量',
                minWidth: '120',
                align: 'right',
                hover: true,
                sortable: true,
              },
              {
                field: 'moAmt',
                title: '调拨出库金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'moQty',
                title: '调拨出库数量',
                minWidth: '120',
                align: 'right',
                hover: true,
                sortable: true,
              },
              {
                field: 'soOutStockPOAmt', // 消耗出库金额:销售-销退
                title: '消耗出库金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'soOutStockQty',
                title: '消耗出库数量',
                minWidth: '120',
                align: 'right',
                hover: true,
                sortable: true,
              },
              {
                field: 'ioOutStockPOAmt', // 报损出库金额：报损-报溢
                title: '损溢出库金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'ioOutStockQty',
                title: '损溢出库数量',
                minWidth: '120',
                align: 'right',
                hover: true,
                sortable: true,
              },
              {
                field: 'pricePODiffAmt',
                title: '出库价差金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
              {
                field: 'adjPOAmt',
                title: '库存调价金额',
                minWidth: '120',
                align: 'right',

                hover: true,
                format: '0.00####',
                sortable: true,
              },
            ],
          },
          // {
          //   title: '本期(零售价)',
          //   align: 'center',
          //   visible: showPriceList,
          //   children: [
          //     {
          //       field: 'poInStockPriceListAmt',
          //       title: '采购入库零售价金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'miPriceListAmt',
          //       title: '调拨入库零售价金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'moPriceListAmt',
          //       title: '调拨出库零售价金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'soOutStockPriceListAmt',
          //       title: '消耗出库零售价金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'ioOutStockPriceListAmt',
          //       title: '损溢出库零售价金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'adjPriceListAmt',
          //       title: '调价零售价金额',
          //       minWidth: '130',
          //       align: 'right',
          //
          //       hover: true,
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'noInvPriceListAmtDebit',
          //       title: '未到票新增零售价金额',
          //       minWidth: '170',
          //       align: 'right',
          //
          //       hover: true,
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'noInvPriceListAmtCredit',
          //       title: '未到票核销零售价金额',
          //       minWidth: '170',
          //       align: 'right',
          //
          //       hover: true,
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //   ],
          // },
          {
            field: 'currentPeriodBalancePO',
            title: '本期结存(进价)',
            align: 'center',
            children: [
              {
                field: 'endPOAmt',
                title: '期末库存金额',
                minWidth: '120',
                align: 'right',

                format: '0.00####',
                sortable: true,
              },
              {
                field: 'endNoInvoiceAmt',
                title: '期末未到票金额',
                minWidth: '130',
                align: 'right',

                format: '0.00####',
                sortable: true,
              },
              {
                field: 'endQty',
                title: '期末数量',
                minWidth: '100',
                align: 'right',
                sortable: true,
              },
            ],
          },
          // {
          //   title: '本期结存(零售价)',
          //   align: 'center',
          //   visible: showPriceList,
          //   children: [
          //     {
          //       field: 'endPriceListAmt',
          //       title: '期末零售价库存金额',
          //       minWidth: '160',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //     {
          //       field: 'endNoInvoicePriceListAmt',
          //       title: '期末未到票零售价金额',
          //       minWidth: '170',
          //       align: 'right',
          //
          //       visible: showPriceList,
          //       format: '0.00####',
          //       sortable: true,
          //     },
          //   ],
          // },
          {
            field: 'productCode',
            title: '药品编码',
            minWidth: '100',
            sortable: true,
          },
        ],
        proxyConfig: {
          autoLoad: false,
        },
        cellClassName({ column }: any) {
          return [
            'adjPOAmt',
            'adjPriceListAmt',
            'invoicePriceDiffAmt',
            'ioOutStockPOAmt',
            'ioOutStockQty',
            'miAmt',
            'miQty',
            'moAmt',
            'moQty',
            'noInvPOAmtCredit',
            'noInvPOAmtDebit',
            'noInvPriceListAmtCredit',
            'noInvPriceListAmtDebit',
            'poInStockPOAmt',
            'poInStockQty',
            'poInvPOAmt',
            'pricePODiffAmt',
            'soOutStockPOAmt',
            'soOutStockQty',
          ].includes(column.field)
            ? 'highlight'
            : null;
        },
      },
    },
    {
      parentTableParams,
      id: 'monthEndApproval_son',
      dataTableId: 'finMonthEndAction/queryLine.do',
      gridEvents: {
        checkboxChange: onCheckboxChange,
        checkboxAll: onCheckboxChange,
        cellClick: onCellClick(true),
        getTableArrDataFn: (params) => {
          return {
            ...params,
            records: params.rows,
          };
        },
      },
      beforeFetchFn: (params) => {
        if (!parentTableParams.value.monthEndId) {
          return false;
        }

        return {
          ...params,
          ...parentTableParams.value,
        };
      },
      afterFetchFn(params) {
        const summary = {
          endPOAmt: 0,
          adjPOAmt: 0,
          ioOutStockPOAmt: 0,
          soOutStockPOAmt: 0,
          moAmt: 0,
          miAmt: 0,
          poInStockPOAmt: 0,
          beginPOAmt: 0,
        };

        for (const row of params.rows) {
          summary.endPOAmt += Number.parseFloat(row.endPOAmt);
          summary.adjPOAmt += Number.parseFloat(row.adjPOAmt);
          summary.ioOutStockPOAmt += Number.parseFloat(row.ioOutStockPOAmt);
          summary.soOutStockPOAmt += Number.parseFloat(row.soOutStockPOAmt);
          summary.moAmt += Number.parseFloat(row.moAmt);
          summary.miAmt += Number.parseFloat(row.miAmt);
          summary.poInStockPOAmt += Number.parseFloat(row.poInStockPOAmt);
          summary.beginPOAmt += Number.parseFloat(row.beginPOAmt);
        }

        Object.assign(childSummary, summary);
        setTimeout(() => {
          calculateSummarize();
        }, 200);
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );

async function onRadioChange({ row }: { row: any }) {
  if (row?.monthEndId) {
    parentTableParams.value.monthEndId = row.monthEndId;
    childGridApi.reload({
      monthEndId: parentTableParams.value.monthEndId,
    });
    await parentGridApi.grid.clearCheckboxRow();
    parentGridApi.grid.setCheckboxRow(row, true);
  } else {
    parentTableParams.value.monthEndId = undefined;
    childGridApi.grid.remove();
  }
}

function onCheckboxChange() {
  const checkedRows = parentGridApi.grid.getCheckboxRecords();

  if (checkedRows.length === 0) {
    Object.assign(childSummary, {
      endPOAmt: 0,
      adjPOAmt: 0,
      ioOutStockPOAmt: 0,
      soOutStockPOAmt: 0,
      moAmt: 0,
      miAmt: 0,
      poInStockPOAmt: 0,
      beginPOAmt: 0,
    });
    calculateSummarize();
  }
}

function onCellClick(isChild?: boolean) {
  return function ({
    column,
    row: { warehouseId, productId, dateFrom, dateTo },
  }: any) {
    if (isChild) {
      const checkedRows = parentGridApi.grid.getCheckboxRecords();

      warehouseId = checkedRows[0]?.warehouseId;
      dateFrom = checkedRows[0]?.dateFrom;
      dateTo = checkedRows[0]?.dateTo;
    }

    switch (column.field) {
      case 'adjPOAmt': {
        inoutDetailModalApi
          .setData({
            title: '调价明细',
            type: 'adj',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();
        break;
      }
      case 'invoicePriceDiffAmt':
      case 'poInvPOAmt':
      case 'poInvPriceListAmt': {
        // invoiceDetail
        invoiceDetailModalApi
          .setData({
            title: '采购发票明细',
            params: {
              warehouseId,
              productId,
              dateFrom,
              dateTo,
              // isRejectDoc: '',
              isAdjustDoc: 'N',
            },
          })
          .open();

        break;
      }
      case 'ioOutStockPOAmt':
      case 'ioOutStockPriceListAmt':
      case 'ioOutStockQty': {
        inoutDetailModalApi
          .setData({
            title: '报损出库明细',
            type: 'ioOutStock',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();

        break;
      }
      case 'miAmt':
      case 'miPriceListAmt':
      case 'miQty': {
        inoutDetailModalApi
          .setData({
            title: '调拨入库明细',
            type: 'mi',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();

        break;
      }
      case 'moAmt':
      case 'moPriceListAmt':
      case 'moQty': {
        inoutDetailModalApi
          .setData({
            title: '调拨出库明细',
            type: 'mo',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();
        break;
      }
      case 'mvInStockPOAmt':
      case 'mvInStockPriceListAmt':
      case 'mvInStockQty': {
        inoutDetailModalApi
          .setData({
            title: '调拨入库明细',
            type: 'mvInStock',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();
        break;
      }
      case 'noInvPOAmtCredit': {
        noInvCreditDetailModalApi
          .setData({
            title: '未到票核销明细',
            type: 'noInvCredit',
            params: {
              warehouseId,
              productId,
              dateFrom,
              dateTo,
            },
          })
          .open();
        break;
      }
      case 'noInvPOAmtDebit': {
        noInvDebitDetailModalApi
          .setData({
            title: '未到票新增明细',
            type: 'noInvDebit',
            params: {
              warehouseId,
              productId,
              dateFrom,
              dateTo,
            },
          })
          .open();
        break;
      }
      case 'poInStockPOAmt':
      case 'poInStockPriceListAmt':
      case 'poInStockQty': {
        inoutDetailModalApi
          .setData({
            title: '采购入库明细',
            type: 'poInStock',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();
        break;
      }
      case 'pricePODiffAmt': {
        inoutDetailModalApi
          .setData({
            title: '出库价差明细',
            type: 'priceDiff',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();
        break;
      }
      case 'soOutStockPOAmt':
      case 'soOutStockPriceListAmt':
      case 'soOutStockQty': {
        inoutDetailModalApi
          .setData({
            title: '消耗出库明细',
            type: 'soOutStock',
            params: { warehouseId, productId, dateFrom, dateTo },
          })
          .open();
        break;
      }
    }
  };
}

// 父表 对话框
const [NoInvCreditDetailModal, noInvCreditDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: noInvCreditDetailComp,
  draggable: true,
});

const [NoInvDebitDetailModal, noInvDebitDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: noInvDebitDetailComp,
  draggable: true,
});

const [InvoiceDetailModal, invoiceDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: invoiceDetailComp,
  draggable: true,
});

const [InoutDetailModal, inoutDetailModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: inoutDetailComp,
  draggable: true,
});

function approve() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择月结表！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认批准${selectedRows.length}个月结表吗？`,
    onOk: async () => {
      try {
        await approveMonthEnd({
          wfActivityId: selectedRows
            .map(({ wfActivityId }) => wfActivityId)
            .join(','),
        });

        message.success('批准成功');

        parentGridApi.query();
      } catch {
        message.error('批准失败');
      }
    },
  });
}

// 父表 - 拒绝对话框
const [MonthEndCallbackModal, monthEndCallbackModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

/**
 * 页面弹窗表单配置
 */
const callbackFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'Textarea',
      fieldName: 'rejectReason',
      componentProps: () => {
        return {
          rows: 5,
        };
      },
      label: '退回原因',
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

function callback() {
  const selectedRows = parentGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择月结表！');
    return;
  }

  const target = selectedRows.find(({ docStatus }) => docStatus !== 'WA');

  if (target) {
    message.error(
      `${target.warehouseName}${target.dateTo}月结是${target.docStatusName}状态,不能退回！`,
    );
    return;
  }

  monthEndCallbackModalApi
    .setData({
      title: `退回${selectedRows.length}个月结单`,
      form: {},
      submit: (params) =>
        rejectMonthEnd({
          wfActivityId: selectedRows
            .map(({ wfActivityId }) => wfActivityId)
            .join(','),
          ...params,
        }),
    })
    .open();
}

// 子表搜索
const childSearchParam = reactive({
  productName: '',
  productType: '',
  productCategoryId: '',
});

function handleChildSearch() {
  childGridApi.reload({
    monthEndId: parentTableParams.value.monthEndId,
    ...childSearchParam,
  });
}

const summarizeRef = ref();
const calculateSummarize = () => {
  const totalArr = [
    {
      label: '期初库存金额',
      value: childSummary.beginPOAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '采购入库金额',
      value: childSummary.poInStockPOAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '调拨入库金额',
      value: childSummary.miAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '调拨出库金额',
      value: childSummary.moAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '消耗出库金额',
      value: childSummary.soOutStockPOAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '损溢出库金额',
      value: childSummary.ioOutStockPOAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '库存调价金额',
      value: childSummary.adjPOAmt?.toFixed(2),
      style: 'color: red;',
    },
    {
      label: '期末库存金额',
      value: childSummary.endPOAmt?.toFixed(2),
      style: 'color: red;',
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <MonthEndCallbackModal
          :form-options="callbackFormOptions"
          :after-submit="parentGridApi.query"
        />
        <InoutDetailModal />
        <InvoiceDetailModal />
        <NoInvCreditDetailModal />
        <NoInvDebitDetailModal />
        <ParentGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="approve"
              data-testid="button_approve"
            >
              批准
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              ghost
              danger
              type="primary"
              @click="callback"
              class="mr-[0.5rem]"
              data-testid="button_callback"
            >
              退回
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              @click="handleParentExport"
              class="mr-[0.5rem]"
              data-testid="button_parentGridExport"
            >
              导出
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="childSearchParam.productName"
              class="mr-[0.5rem] w-[120px]"
              placeholder="请输入药品名"
              @keyup.enter="handleChildSearch"
              allow-clear
              data-testid="input_childSearchProductName"
            />
            <!-- <Input
              v-model:value="childSearchParam.productType"
              class="mr-[0.5rem] w-[130px]"
              placeholder="请选择产品类型"
              @keyup.enter="handleChildSearch"
              allow-clear
            /> -->
            <!-- <Input
              v-model:value="childSearchParam.productCategoryId"
              class="mr-[0.5rem] w-[130px]"
              placeholder="请选择商品类别"
              @keyup.enter="handleChildSearch"
              allow-clear
            /> -->
            <ChcSelect
              v-model="childSearchParam.productType"
              class="mr-[0.5rem] w-[130px]"
              dict-url="/baseHandleAction/refList.do"
              api-type="post"
              request-content-type="application/x-www-form-urlencoded"
              placeholder="请选择产品类型"
              :paginate="false"
              :show-search="false"
              :extra-params="{
                id: '1000503',
              }"
              :immediate="true"
              label-field="name"
              value-field="id"
              :after-fetch="
                (res: any) => {
                  return { ...res, rows: undefined, records: res.rows };
                }
              "
              data-testid="select_childSearchProductType"
            />
            <ChcSelect
              v-model="childSearchParam.productCategoryId"
              class="mr-[0.5rem] w-[130px]"
              dict-url="/baseHandleAction/productCategoryList.do"
              api-type="post"
              request-content-type="application/x-www-form-urlencoded"
              placeholder="请选择商品类别"
              :paginate="false"
              :show-search="false"
              :extra-params="{}"
              :immediate="true"
              label-field="name"
              value-field="id"
              :after-fetch="
                (res: any) => {
                  return { ...res, rows: undefined, records: res.rows };
                }
              "
              data-testid="select_childSearchProductCategoryId"
            />
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleChildSearch"
              data-testid="button_childSearch"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleChildExport"
              style="margin-top: 5px"
              data-testid="button_childExport"
            >
              导出明细
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
          </template>
          <template #toolbar-tools>
            <Summarize
              ref="summarizeRef"
              :calculate-summarize="calculateSummarize"
            />
            <!-- <span class="mr-[0.5rem]">
              期初库存金额:
              <span
                style="color: red"
                v-text="childSummary.beginPOAmt.toFixed(2)"
              ></span>
              元
            </span>
            <span class="mr-[0.5rem]">
              采购入库金额:
              <span
                style="color: red"
                v-text="childSummary.poInStockPOAmt.toFixed(2)"
              ></span>
              元
            </span>
            <span class="mr-[0.5rem]">
              调拨入库金额:
              <span
                style="color: red"
                v-text="childSummary.miAmt.toFixed(2)"
              ></span>
              元
            </span>
            <span class="mr-[0.5rem]">
              调拨出库金额:
              <span
                style="color: red"
                v-text="childSummary.moAmt.toFixed(2)"
              ></span>
              元
            </span>

            <span class="mr-[0.5rem]">
              消耗出库金额:
              <span
                style="color: red"
                v-text="childSummary.soOutStockPOAmt.toFixed(2)"
              ></span>
              元
            </span>
            <span class="mr-[0.5rem]">
              损溢出库金额:
              <span
                style="color: red"
                v-text="childSummary.ioOutStockPOAmt.toFixed(2)"
              ></span>
              元
            </span>

            <span class="mr-[0.5rem]">
              库存调价金额:
              <span
                style="color: red"
                v-text="childSummary.adjPOAmt.toFixed(2)"
              ></span>
              元
            </span>

            <span class="mr-[0.5rem]">
              期末库存金额:
              <span
                style="color: red"
                v-text="childSummary.endPOAmt.toFixed(2)"
              ></span>
              元
            </span> -->
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
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
