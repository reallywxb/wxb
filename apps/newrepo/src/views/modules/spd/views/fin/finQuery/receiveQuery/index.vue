<script lang="ts" setup>
import { onMounted, ref } from 'vue';
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
const userStore = useUserStore();
const parentTableParams = ref<{ [key: string]: any }>({});
const departmentId = ref<number | string>('');
// 父表
const [ParentGrid, parentGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // commonConfig: {
      //   labelClass: 'w-[90px]',
      // },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // checkboxConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      stripe: false,
    }),
  },
  {
    id: 'receiveQuery',
    // api地址
    queryUrl: `inoutAction/query.do?movementType=${encodeURIComponent('C+,M+,V+,PC+,I+')}`,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'inoutNo',
        title: '入库单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '入库日期',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '发货单位',
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
        title: '入库仓库',
        minWidth: '150',
        sortable: true,
        //			}, {
        //				"field": "DocStatusName",
        //				"title": "状态",
        //				"minWidth": "150",
        //				"sortable": true
        //			},{
        //				"field": "orgName",
        //				"title": "机构",
        //				"minWidth": "120",
        //				"sortable": true
      },
      {
        //				"field": "docTypeName",
        field: 'movementTypeName',
        //				"field": "workTypeName",
        title: '入库类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        visible: userStore.userInfo?.isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '收货人',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '总金额',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      // {
      //   field: 'productTypeName',
      //   title: '商品分类',
      //   minWidth: '140',
      //   sortable: true,
      // },
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
        label: '入库日期',
        defaultValue: [
          route.query.inoutNo
            ? null
            : dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
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
        componentProps: () => {
          return {
            dictUrl: '/inoutAction/movementType.do?type=in',
            placeholder: '请选择',
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
        fieldName: 'docType',
        label: '入库类型',
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
      {
        component: 'Input',
        fieldName: 'inoutNo',
        label: '入库单号',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
        defaultValue: route.query.inoutNo,
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isBulkPurchase',
        label: '带量采购',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择',
            paginate: false,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isNarcotic',
        label: '麻精',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择',
            paginate: false,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isDisinfectant',
        label: '消毒液',
      },
    ],
    gridEvents: {
      // checkboxChange: onCheckboxChange,
      // checkboxAll: onCheckboxChange,
      radioChange: ({ row }: { row: any }) => {
        if (row && row.inoutId) {
          parentTableParams.value.inoutId = row.inoutId;
          childGridApi.reload({
            inoutId: parentTableParams.value.inoutId,
          });
        } else {
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
    getTableArrDataFn: (params) => {
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
          title: '入库数量',
          minWidth: '90',
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
        {
          field: 'productControlLevelName',
          title: '商品组',
          visible: userStore.userInfo?.isProductControlLevel,
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'isBulkPurchase',
          title: '带量采购',
          minWidth: '90',
          sortable: true,
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'isDisinfectant',
          title: '是否消毒液',
          minWidth: '110',
          sortable: true,
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'receiveQuery_son',
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

// function onCheckboxChange() {
//   const checkedRows = parentGridApi.grid.getCheckboxRecords();

//   if (checkedRows.length === 0) {
//     // 父表没数据，子表要清空
//     parentTableParams.value.inoutId = undefined;
//     childGridApi.grid.remove(childGridApi.grid.getFullData());
//   } else {
//     parentTableParams.value.inoutId = checkedRows[0]?.inoutId;
//     childGridApi.query({
//       inoutId: parentTableParams.value.inoutId,
//     });
//   }
// }

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
              data-testid="input_childProductName"
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
