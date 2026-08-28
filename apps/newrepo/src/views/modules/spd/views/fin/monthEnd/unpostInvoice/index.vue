<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { reaccountInvoice } from '#/views/modules/spd/views/fin/monthEnd/api';

const userStore: any = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});
const selectedAmount = ref(0);
const departmentId = ref<number | string>('');
// 父表
const [ParentGrid, parentGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'unpostInvoice',
    // api地址
    queryUrl: 'invoiceAction/query.do?page=query&isPosted=N&docStatus=CO',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orgName',
        title: '机构',
        minWidth: '110',
        sortable: true,
        visible: userStore.userInfo?.isSaas,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'dateInvoiced',
        title: '发票时间',
        minWidth: '110',
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
        title: '采购仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '发票金额(元)',
        minWidth: '120',
        align: 'right',
        format: '0.00',
        sortable: true,
        //		}, {
        //			"field": "discountTotalAMT",
        //			"title": "折扣金额(元)",
        //			"minWidth": "120",
        //			"align" : 'right',
        //			"format": '0.00',
        //			"sortable": true
        //		},{
        //			"field": "matchedAmt",
        //			"title": "入库金额(元)",
        //			"minWidth": "120",
        //			"align" : 'right',
        //			"format": '0.00',
        //			"sortable": true
        //		}, {
        //			"field": "rejectedAmt",
        //			"title": "拒收金额(元)",
        //			"minWidth": "120",
        //			"align" : 'right',
        //			"format": '0.00',
        //			"sortable": true
      },
      {
        field: 'taxInvoiceTypeNo',
        title: '发票代码',
        minWidth: '110',
        sortable: true,
        //		}, {
        //			"field" : "isReturnDoc",
        //			"title" : "退货",
        //			"minWidth" : "80",
        //			format : function(value) {
        //				return 'Y' == value ? '是' : '否';
        //			}
      },
      {
        field: 'isBulkPurchase',
        title: '带量采购',
        minWidth: '80',
      },
      {
        field: 'isRejectDoc',
        title: '拒收',
        minWidth: '80',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAdjustDoc',
        title: '调价票',
        minWidth: '80',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'invoiceMethod',
        title: '开票方式',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'billDate',
        title: '记账日期',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'invoiceId',
        title: '发票单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'docStatusName',
        title: '单据状态',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
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
        label: '发票时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
        componentProps: () => ({
          showTime: true,
        }),
      },
      {
        component: 'DateGroup',
        fieldName: 'completeTime',
        label: '复核时间',
        formItemClass: 'col-span-1',
        componentProps: () => ({
          showTime: true,
        }),
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
                parentGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                parentGridApi.formApi
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
              parentGridApi.formApi?.getFieldComponentRef &&
              typeof parentGridApi.formApi?.getFieldComponentRef ===
                'function' &&
              parentGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              parentGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              parentGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              parentGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              parentGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
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
        fieldName: 'taxInvoiceNo',
        label: '发票号码',
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
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择',
        },
        defaultValue: '',
        fieldName: 'isAdjustDoc',
        label: '调价票',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择',
        },
        defaultValue: '',
        fieldName: 'isBulkPurchase',
        label: '带量采购',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { value: '', label: '全部' },
            { value: '1', label: '货票同行' },
            { value: '2', label: '结算单' },
            { value: '3', label: '后开票' },
          ],
          placeholder: '请选择',
        },
        defaultValue: '',
        fieldName: 'invoiceMethod',
        label: '开票方式',
      },
    ],
    gridEvents: {
      radioChange({ row }: { row: any }) {
        if (row?.invoiceId) {
          selectedAmount.value = row.totalAmt;

          parentTableParams.value.invoiceId = row.invoiceId;
          childGridApi.reload({ invoiceId: row.invoiceId });
        } else {
          selectedAmount.value = 0;
          // 父表没数据，子表要清空
          parentTableParams.value.invoiceId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
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
          field: 'productCode',
          title: '药品编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          minWidth: '200',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          minWidth: '90',
          sortable: true,
        },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'isOnLine',
          title: '是否线上',
          minWidth: '90',
          format({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'isBulkPurchase',
          title: '是否带量',
          minWidth: '90',
          format({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '60',
          sortable: true,
        },
        {
          field: 'qtyInvoiced',
          title: '数量',
          minWidth: '60',
          sortable: true,
          align: 'right',
          //		}, {
          //			"field": "qtyMatched",
          //			"title": "入库数量",
          //			"minWidth": "90",
          //			"sortable": true,
          //			"align" : 'right'
          //		}, {
          //			"field": "qtyRejected",
          //			"title": "拒收数量",
          //			"minWidth": "120",
          //			"sortable": true,
          //			"align" : 'right'
        },
        {
          field: 'priceActual',
          title: '价格',
          minWidth: '80',
          sortable: true,
          align: 'right',
          format: '0.00##',
          //		},{
          //			"field": "discountPrice",
          //			"title": "折扣价格",
          //			"minWidth": "90",
          //			"sortable": true,
          //			"align" : 'right',
          //			"format": '0.00##',
        },
        {
          field: 'lineAmt',
          title: '金额(元)',
          minWidth: '100',
          align: 'right',
          format: '0.00##',
          sortable: true,
          //		}, {
          //			"field": "discountLineAMT",
          //			"title": "折扣金额(元)",
          //			"minWidth": "100",
          //			"align" : 'right',
          //			"format": '0.000',
          //			"sortable": true
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
          minWidth: '100',
          sortable: true,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'invoiceNoSettlementAprpoveWf_son',
    dataTableId: 'invoiceAction/queryLine.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.invoiceId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

function accounting() {
  const selectedRow = parentGridApi.grid.getRadioRecord(true);
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认记账吗？`,
    onOk: async () => {
      try {
        await reaccountInvoice({
          invoiceId: selectedRow.invoiceId,
          // invoiceId: selectedRows.map(({ invoiceId }) => invoiceId).join(','),
        });

        message.success('提交成功');

        parentGridApi.query();
      } catch {
        message.error('提交失败');
      }
    },
  });
}

const productName = ref('');

function handleChildSearch() {
  childGridApi.reload({
    invoiceId: parentTableParams.value.invoiceId,
    productName: productName.value,
  });
}

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
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
        <ParentGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="accounting()"
              data-testid="button_accounting"
            >
              记账
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              @keyup.enter="handleChildSearch"
              allow-clear
              data-testid="input_productName"
            />
            <Button
              type="primary"
              @click="handleChildSearch"
              data-testid="button_childSearch"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <!--            <Button type="primary" @click="handleExport" class="mr-[0.5rem]">-->
            <!--              打印明细-->
            <!--              <template #icon>-->
            <!--                <ExportActionIcon />-->
            <!--              </template>-->
            <!--            </Button>-->
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
</template>
