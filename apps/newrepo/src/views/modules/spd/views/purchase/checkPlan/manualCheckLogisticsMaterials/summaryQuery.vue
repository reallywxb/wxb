<script setup lang="ts">
import { nextTick, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import { commonFormOptions, viewFormOptions } from './options';

const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{}>({});
const totalAmount = ref(0);
const totalType = ref(1); // 默认值为1
const isFirstLoaded = ref(false);

const gridColumns1 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 110,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right',
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
  },
];
const gridColumns2 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'applyBPartnerName',
    minWidth: 110,
    sortable: true,
    title: '需求库房',
    formatter: (params: any) => {
      return params.row.applyBPartnerName || '';
    },
  },
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 110,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right',
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
  },
];
const gridColumns3 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    field: 'productName',
    minWidth: 110,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'productSpec',
    minWidth: 90,
    sortable: true,
    title: '规格',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right',
  },
  {
    field: 'lot',
    minWidth: 100,
    sortable: true,
    title: '批号',
  },
  {
    field: 'guaranteeDate',
    minWidth: 100,
    sortable: true,
    title: '效期',
  },
  {
    field: 'serNo',
    minWidth: 100,
    sortable: true,
    title: '序列号',
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
  },
];

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async () => {
        if (totalType.value === 2) {
          ChcGridApi.setGridOptions({
            columns: gridColumns2,
          });
        } else if (totalType.value === 3) {
          ChcGridApi.setGridOptions({
            columns: gridColumns3,
          });
        } else {
          ChcGridApi.setGridOptions({
            columns: gridColumns1,
          });
        }
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        // highlight: true,
      },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    gridColumns: gridColumns1,
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            options: [
              { value: 1, label: '按物资汇总' },
              { value: 2, label: '按物资+需求库房汇总' },
              { value: 3, label: '按批号效期汇总' },
            ],
            placeholder: '请选择查询维度',
            paginate: false,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              totalType.value = val; // 更新查询维度值
              console.warn('totalType', totalType.value, val, option);
              // extParams.value.queryDimension_text = option.label;
            },
            immediate: true,
          };
        },
        fieldName: 'totalType',
        label: '查询维度',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateCommit',
        label: '入库提交时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: '请选择采购仓库',
            onChange() {
              // 初次加载 进行标记
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
            },
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
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择需求仓库',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange() {
              // 初次加载 进行标记
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
            },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=131',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择单据状态',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.sourceType_text = option.name;
            // },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'docStatus', // 暂无字段
        label: '单据状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=1000650',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择入库类型',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('receiptType', val, option);
              // extParams.value.commitStatus_text = option.label;
            },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'receiptType',
        label: '入库类型',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
      {
        component: 'Input',
        fieldName: 'insurance',
        label: '医保药品编码',
        componentProps: {
          placeholder: '请输入医保药品编码',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange() {
              // 初次加载 进行标记
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
            },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '供应商',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择高值',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPrecious',
        label: '高值',
      },
      {
        component: 'Input',
        fieldName: 'orderPlanNo',
        label: '入库单号',
        componentProps: {
          placeholder: '请输入入库单号',
        },
      },
    ],
    // showExportBtn: true,
    dataTableId: '/asnAction/totalDetail.do',
    id: 'manualCheckSummaryQuery',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      console.warn('afterFetchFn:', params.totalPrice);
      return {
        ...params,
        records: params.rows,
      };
    },
    // customModals: {
    //   'AddNewModal-addNewModalApi': {
    //     class: 'w-[800px]',
    //     closable: true,
    //     // 连接抽离的组件
    //     connectedComponent: CustomModal,
    //     draggable: true,
    //   },
    // },
  },
);
// const handleView = () => {
//   headerTabs.value[3]!.disabled = false;
//   currentTab.value = 3;
// };
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleView" class="mr-[0.5rem]">
          汇总查询
        </Button> -->
        <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <!-- <template #toolbar-tools>
        <span>采购总金额：{{ totalAmount }}元</span>
      </template> -->
    </ChcGrid>
  </div>
</template>
<style scoped></style>
