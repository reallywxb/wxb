<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
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
    id: 'shipmentQuery',
    // api地址
    queryUrl: 'inoutAction/query.do?movementType=C-,I-,M-,V-,PC-',
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
        field: 'inoutNo',
        title: '出库单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '出库日期',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '入库单位',
        minWidth: '160',
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
        title: '出库仓库',
        minWidth: '150',
        sortable: true,
        //				}, {
        //					"field": "DocStatusName",
        //					"title": "状态",
        //					"minWidth": "150",
        //					"sortable": true
        //				},{
        //					"field": "orgName",
        //					"title": "机构",
        //					"minWidth": "120",
        //					"sortable": true
      },
      {
        field: 'movementTypeName',
        //					"field": "workTypeName",
        //					"field": "docTypeName",
        title: '出库类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '商品组',
        visible: userStore.userInfo?.isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '总金额',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'completeUser',
        title: '发货人',
        minWidth: '100',
        align: 'right',
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
        label: '出库日期',
        defaultValue: [
          route.query.inoutNo
            ? null
            : dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        ],
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
        defaultValue: '',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/inoutAction/movementType.do?type=out',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择出库类型',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'docType',
        label: '出库类型',
      },
      {
        component: 'Input',
        fieldName: 'inoutNo',
        label: '出库单号',
        componentProps: () => {
          return {
            placeholder: `请输入出库单号`,
          };
        },
        defaultValue: route.query.inoutNo,
      },
      {
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/productAction/productControlLevelList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择商品组',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'productControlLevel',
        label: '商品组',
      },
    ],
    gridEvents: {
      radioChange({ row }: { row: any }) {
        if (row?.inoutId) {
          selectedAmount.value = row.totalAmt;

          parentTableParams.value.inoutId = row.inoutId;
          childGridApi.reload({ inoutId: row.inoutId });
        } else {
          selectedAmount.value = 0;
          // 父表没数据，子表要清空
          parentTableParams.value.inoutId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
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
          minWidth: '200',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '60',
          sortable: true,
        },
        {
          field: 'movementQty',
          title: '出库数量',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'price',
          title: '采购价(元)',
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lineAmt',
          title: '采购金额(元)',
          minWidth: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: 'priceAsi',
          title: '批次采购价(元)',
          minWidth: '130',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lineAmtPriceAsi',
          title: '批次采购金额(元)',
          minWidth: '150',
          align: 'right',
          sortable: true,
        },
        {
          field: 'priceList',
          title: '零售价(元)',
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lineAmtPricelist',
          title: '零售金额(元)',
          minWidth: '110',
          align: 'right',
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
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'vendorName',
          title: '供应商',
          minWidth: '200',
          sortable: true,
        },
        {
          field: 'orderNo',
          title: '订单号',
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
    id: 'shipmentQuery_son',
    dataTableId: 'inoutAction/queryDetail.do',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.inoutId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
  },
);

const productName = ref('');

function handleChildSearch() {
  childGridApi.reload({
    inoutId: parentTableParams.value.inoutId,
    productName: productName.value,
  });
}
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
        <ParentGrid />
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
