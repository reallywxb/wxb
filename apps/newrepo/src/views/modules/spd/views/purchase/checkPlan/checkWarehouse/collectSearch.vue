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
import { deepMerge } from '#/utils/util';

import { commonFormOptions, viewFormOptions } from './options';

class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
const selectController = new LazySelect(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{
  // commitStatus_text?: string;
  // queryDimension_text?: string;
  // vendorId_text?: string;
}>({});
const totalAmount = ref(0);
const totalType = ref(1); // 默认值为1
const isFirstLoaded = ref(false);
// const currentTab = defineModel<number>('currentTab', { required: true });
// const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });

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
    minWidth: 130,
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
    visible: false, // TODO:medicine cancel 型号
  },
  {
    field: 'uomName',
    minWidth: 60,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 60,
    sortable: true,
    title: '数量',
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 90,
    sortable: true,
    title: '入库单价',
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
  {
    field: 'isCrossDocking',
    minWidth: 90,
    sortable: true,
    title: '是否直供',
    formatter({ row }: any) {
      return row.isCrossDocking === 'Y' ? '是' : '否';
    },
  },
];
const gridColumns2 = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'applyBPartnerName',
    minWidth: 110,
    sortable: true,
    title: '需求库房',
    formatter: (params) => {
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
    minWidth: 130,
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
    visible: false, // TODO:medicine cancel 型号
  },
  {
    field: 'uomName',
    minWidth: 60,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 60,
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
  {
    field: 'isCrossDocking',
    minWidth: 90,
    sortable: true,
    title: '是否直供',
    formatter({ row }: any) {
      return row.isCrossDocking === 'Y' ? '是' : '否';
    },
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
    minWidth: 130,
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
    visible: false, // TODO:medicine cancel 型号
  },
  {
    field: 'uomName',
    minWidth: 60,
    sortable: true,
    title: '单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 60,
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
    visible: false, // TODO:medicine cancel 序列号
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
  {
    field: 'isCrossDocking',
    minWidth: 90,
    sortable: true,
    title: '是否直供',
    formatter({ row }: any) {
      return row.isCrossDocking === 'Y' ? '是' : '否';
    },
  },
];

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateCommit', ['dateCheckFrom', 'dateCheckTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values) => {
        console.warn('values', values);
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
        // ChcGridApi.query({ ...values });
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
              { value: 1, label: '按药品汇总' },
              { value: 2, label: '按药品+需求库房汇总' },
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
        label: '验收时间',
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
            // showSearch: true,
            placeholder: '请选择采购仓库',
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              selectController.sign();
            },
            paginate: false,
            // allowClear: true,
            // filterByFrontEnd: false,
            // onSearch: (params: any) => {
            //   console.warn('onSearch:', params);
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
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择需求仓库',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            showChooseAll: '',
            defaultValue: '',
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
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('bpartnerId', val, option);
              selectController.sign();
              // extParams.value.vendorId_text = option.name;
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
              { value: 'Y', label: '带量采购' },
              { value: 'N', label: '非带量采购' },
            ],
            placeholder: '请选择带量采购',
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000480',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择开票方式',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'invoiceMethod',
        label: '开票方式',
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
            placeholder: '请选择是否开票',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isInvoice',
        label: '是否开票',
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
              { value: 'Y', label: '跟台配送' },
              { value: 'N', label: '非跟台配送' },
            ],
            placeholder: '请选择跟台配送',
            paginate: false,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.isPrecious_text = option.label;
            // },
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'issurgery',
        label: '是否跟台配送',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择是否直供`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isCrossDocking',
        label: '是否直供',
      },
    ],
    // showExportBtn: true,
    dataTableId: '/asnAction/totalDetail.do',
    id: 'checkCollectSearch',
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
    beforeFetchFn: (params) => {
      return {
        ...params,
        asnType: 'PO',
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
      <!-- <template #totalQtyPlaned="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          :data-testid="`link_asn_id_${scope.rowIndex}_handleCheck`"
        >
          {{ scope.row.totalQtyPlaned }}
        </a>
      </template> -->
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleView" class="mr-[0.5rem]">
          汇总查询
        </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_collectSearch"
        >
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
