<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import { batchPutaway, batchReCheck } from './api';
import { commonFormOptions, viewFormOptions } from './options';

// 定义查询控制器 用于控制表格的查询在所有select下拉框查询并赋值后触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    console.warn('res', res);
    ChcGridApi.query({ ...res });
  });
});

const isFirstLoaded = ref(true);
const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
  // isPrecious_text?: string;
}>({
  // commitStatus: "'CO'",
  // approvalStatus: "'WA'",
  // isGift: 'N',
});
// const selectedAmount = ref(0);
// const totalAmount = ref(0);
const departmentId = ref<number | string>('');
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   // calculateSelectedAmount(records);
      // },
      // // 全选/全不选事件
      // checkboxAll: ({ records }: { records: any[] }) => {
      //   // calculateSelectedAmount(records);
      // },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '订单号',
      },
      {
        field: 'asnNo',
        minWidth: 90,
        sortable: true,
        title: '配送单号',
      },
      {
        field: 'applyBPartnerName',
        minWidth: 150,
        sortable: true,
        title: '需求仓库',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 120,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 90,
        sortable: true,
        title: '规格',
      },
      // {
      //   field: 'modelNo',
      //   minWidth: 90,
      //   sortable: true,
      //   title: '型号',
      // },
      {
        field: 'manufacturer',
        minWidth: 110,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'productControlLevelName',
        minWidth: 110,
        sortable: true,
        title: '商品组',
      },
      {
        field: 'uomName',
        minWidth: 60,
        sortable: true,
        title: '单位',
      },
      {
        field: 'BaseUOM',
        minWidth: 90,
        sortable: true,
        title: '最小单位',
        formatter: ({ row }: any) => {
          return row.BaseUOM;
        },
      },
      // {
      //   field: 'replenishPackageQty',
      //   minWidth: 90,
      //   sortable: true,
      //   title: '定数',
      //   align: 'right',
      // },
      // {
      //   field: 'packageCountPutawayLeft',
      //   minWidth: 110,
      //   sortable: true,
      //   title: '待上架包数',
      //   align: 'right',
      // },
      // {
      //   field: 'packageCountPutawayed',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '已上架包数',
      //   align: 'right',
      // },
      {
        field: 'qtyPutawayLeft',
        minWidth: 110,
        sortable: true,
        title: '待上架数量',
        align: 'right',
      },
      {
        field: 'qtyPutawayed',
        minWidth: 110,
        sortable: true,
        title: '已上架数量',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 80,
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
        field: 'bpartnerName',
        minWidth: 120,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'locatorName',
        minWidth: 120,
        sortable: true,
        title: '上架货位',
      },
      {
        field: 'receiptTypeName',
        minWidth: 120,
        sortable: true,
        title: '采购类型',
      },
      {
        field: 'checkerName',
        minWidth: 120,
        sortable: true,
        title: '验收人',
      },
      {
        field: 'checkTime',
        minWidth: 130,
        sortable: true,
        title: '验收时间',
      },
      {
        field: 'description',
        minWidth: 100,
        sortable: true,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '配送时间',
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
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            allowClear: true,
            paginate: false,
            onChange(val: any, option: any) {
              console.warn(val, option);
              departmentId.value = val;
            },
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
        // defaultValue: 1_000_007,

        fieldName: 'departmentId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              // searchController.sign(1);
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (isFirstLoaded.value && res?.rows?.length > 0) {
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  res.rows[0]?.id,
                );
                isFirstLoaded.value = false;
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '收货仓库',
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
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            defaultValue: '',
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
        component: 'Input',
        fieldName: 'asnNo',
        label: '配送单号',
        componentProps: {
          placeholder: '请输入配送单号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000448',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择入库类型',
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
    ],
    dataTableId: '/asnAction/queryDetail.do?asnType=PO&page=receive',
    id: 'upPutaway',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      // totalAmount.value = params.totalPrice || 0;
      // console.warn('afterFetchFn:', params.totalPrice);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);

// const calculateSelectedAmount = (selectedRows: any[]) => {
//   const total = selectedRows.reduce((sum, row) => {
//     return sum + (Number.parseFloat(row.totalAmt) || 0);
//   }, 0);
//   selectedAmount.value = total;
// };

// 作废处理函数
const handleCancel = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要取消的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '撤销验收',
    content: `是否撤销勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const asnLineId = selectedRows.map((row) => row.asnLineId);
        // const params = new URLSearchParams();
        // params.append('asnLineId', JSON.stringify(asnLineId));
        const params = {
          asnLineId: JSON.stringify(asnLineId),
        };
        await batchReCheck(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('rejectWorkrejectWorkrejectWork', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('撤销验收成功');
            } else {
              message.error(res.msg || '失败');
              console.warn('========');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('撤销验收失败');
      }
    },
  });
};

// 审核通过处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  // console.warn(111_111_111_111_111, selectedRows);
  if (selectedRows.length === 0) {
    message.warning('请先选择要确认的数据');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '入库确认',
    content: `是否确认上架勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const asnLineId = selectedRows.map((row) => row.asnLineId);
        // const params = new URLSearchParams();
        // params.append('asnLineIds', JSON.stringify(asnLineIds));
        const params = {
          asnLineId: JSON.stringify(asnLineId),
        };
        // console.warn('params', params);
        await batchPutaway(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('receiveAsnLineBatch111', res);
              // 刷新表格数据
              ChcGridApi.query();
              message.success('上架成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('上架失败');
      }
    },
  });
};

onMounted(() => {
  // console.warn('urlParams', selectController);
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <!-- <template #toolbar-tools>
        <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span>
      </template> -->
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleApprove"
          data-testid="button_approve"
        >
          入库上架
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleCancel"
          data-testid="button_cancel"
        >
          撤销验收
        </Button>
        <!-- <Button type="primary" @click="handleImport" class="mr-[0.5rem]">
        导 入
      </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
