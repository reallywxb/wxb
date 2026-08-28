<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal, Textarea } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const route = useRoute();

const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page;
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  setTimeout(() => {
    // 触发自动查询
    searchController.sign();
  }, 200);
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
const parentTableCheckedRow = ref<Record<string, any>>({});
function queryChildGrid(params?: any) {
  ChildChcGridApi.query(params);
}
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'orderManage',
    // api地址
    queryUrl: '/ygcgProductAction/queryOrder.do',
    showRadioRowTag: true,
    gridColumns: [
      {
        title: '单选',
        type: 'radio',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'orgName',
        title: '客户名称',
        width: '200',
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
        title: '仓库名称',
        width: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'documentNo',
        title: '单据号',
        width: '100',
        sortable: true,
      },
      {
        field: 'orderPlanNo',
        title: '采购计划号',
        width: '100',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '订单日期',
        width: '130',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        width: '100',
        align: 'right',

        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'ygcgOrderId',
        title: '平台编码',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderStatusName',
        title: '平台状态',
        width: '90',
        sortable: true,
      },
      {
        field: 'ygcgOrderTime',
        title: '平台时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '单据类型',
        width: '90',
        sortable: true,
      },
      {
        field: 'receiptTypeName',
        title: '采购类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        // width: '150',
        minWidth: 150,
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '订单日期',
        defaultValue: [
          // 2天前
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '',
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
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '',
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
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '采购仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择采购仓库',
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              const rows =
                res.rows?.filter((item: any) => item.warehouseType === '1') ||
                [];
              return { ...res, rows: undefined, records: rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'ygcgOrderStatus',
        label: '平台状态',
        defaultValue: 'N',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000639',
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
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'ygcgOrderId',
        label: '平台编码',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'documentNo',
        label: '订单号',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '订单备注',
        componentProps: () => {
          return {};
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        parentTableCheckedRow.value = row || {};
        queryChildGrid();

        if (row && row.orderId) {
          parentTableCheckedRow.value = row;
          await ChcGridApi.grid.clearCheckboxRow();
          await ChcGridApi.grid.setCheckboxRow(row, true);
          const formValues = ChildChcGridApi.formApi?.getValues();
          ChildChcGridApi.reload({ ...formValues });
        } else {
          parentTableCheckedRow.value = {};
          ChildChcGridApi.grid.remove(ChildChcGridApi.grid.getFullData());
        }
        calculateSum();
      },
      checkboxChange: () => {
        calculateSum();
      },
      checkboxAll: () => {
        calculateSum();
      },
      // checkboxChange: ({ records, row }: { records: any[]; row: any }) => {
      //   console.warn('父表格 checkboxChange');
      //   console.warn('父表格 checkboxChange row', row);
      //   const checkedRows = records ?? ChcGridApi.grid.getCheckboxRecords(true);
      //   console.warn('父表格 checkboxChange checkedRows', checkedRows);
      //   if (!checkedRows || checkedRows.length <= 0) {
      //     parentTableCheckedRow.value = {};
      //     ChildChcGridApi.grid.reloadData([]);
      //   } else {
      //     parentTableCheckedRow.value =
      //       row || checkedRows[checkedRows.length - 1];
      //     queryChildGrid();
      //   }
      //   calculateSum();
      // },
      // checkboxAll: () => {
      //   console.warn('父表格 checkboxAll');
      //   const checkedRows = ChcGridApi.grid.getCheckboxRecords(true);
      //   console.warn('父表格 checkboxAll checkedRows', checkedRows);
      //   parentTableCheckedRow.value = {};
      //   if (checkedRows.length <= 0) {
      //     ChildChcGridApi.grid.reloadData([]);
      //   } else {
      //     parentTableCheckedRow.value = checkedRows[checkedRows.length - 1];
      //     queryChildGrid();
      //   }
      //   calculateSum();
      // },
    },
    tableSearchExtraParams: {
      page,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      parentTableCheckedRow.value = {};
      ChildChcGridApi.grid.reloadData([]);
      const rows: any[] = params.rows || [];
      if (isEmpty(rows)) {
        parentTableCheckedRow.value.orderId = 0;
      }
      calculateSum();
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [ChildChcGrid, ChildChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[80px]',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.pricepo !== row.ygcgprice) {
          return {
            color: 'red',
          };
        }
        return {};
      },
    }),
  },
  {
    id: 'orderManage_child',
    // api地址
    queryUrl: '/ygcgProductAction/queryOrderLine.do',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'provinceId',
        title: '省标编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名称',
        width: '150',
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
        field: 'uomName',
        title: '单位',
        width: '75',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '数量',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'pricepo',
        title: '单价',
        width: '90',
        align: 'right',

        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'ygcgprice',
        title: '省标价格',
        width: '90',
        align: 'right',

        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: '100',
        align: 'right',
        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'ygcgOrderLineStatusName',
        title: '平台行状态',
        width: '110',
        sortable: true,
      },
      {
        field: 'ygcgOrderLineCloseReason',
        title: '关闭原因',
        width: 100,
        align: 'right',
        sortable: true,
      },
      {
        field: 'ygcgOrderLineId',
        title: '平台订单行号',
        width: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineDescription',
        title: '备注',
        width: '150',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'ygcgOrderLineStatus',
        label: '平台行状态',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000639',
            placeholder: '',
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
        component: 'ChcSelect',
        fieldName: 'isDifPrice',
        label: '是否价差',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=319',
            placeholder: '',
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
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn params', params);
      // if (isEmpty(params.rows)) {
      //   parentTableCheckedRow.value.orderId = 0;
      // }
      return {
        ...params,
        orderId: parentTableCheckedRow.value?.orderId ?? 0,
      };
    },
    afterFetchFn: (params: any) => {
      // const rows: any[] = params.rows || [];
      // if (isEmpty(rows)) {
      //   parentTableCheckedRow.value.orderId = 0;
      // }
      console.warn('afterFetchFn params', params);

      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
//  计算金额
const totalAmt = ref<number | string>('-');
const calculateSum = () => {
  const checkedRows: any[] = ChcGridApi.grid.getCheckboxRecords(true);
  let t = 0;
  if (checkedRows.length === 0) {
    totalAmt.value = '-';
    return;
  }
  checkedRows.forEach((row) => {
    if (row?.totalAmt) {
      t += row.totalAmt * 1;
    }
  });
  const m2 = 10 ** 8;
  t = Math.round(t * m2) / m2;
  totalAmt.value = t.toFixed(2);
};
const handleUpload = () => {
  const checkedRows: any[] = ChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(checkedRows)) {
    message.warning('请选择配订单');
    return;
  }
  let hasPR = false;
  (checkedRows as any[]).forEach((row) => {
    if (row.docType === 'PR') {
      hasPR = true;
    }
  });

  if (hasPR) {
    message.warning('不支持上传采购订单');
    return;
  }
  const sends: any = [];
  (checkedRows as any[]).forEach((row) => {
    sends.push({
      orderId: row.orderId,
    });
  });

  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  Modal.confirm({
    title: '提示',
    content: '确认上传?',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/ygcgProductAction/sendYPOrder.do',
          params,
        );
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
const handleReset = () => {
  const checkedRows: any[] = ChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(checkedRows)) {
    message.warning('请选择配订单');
    return;
  }

  const sends: any = [];
  (checkedRows as any[]).forEach((row) => {
    sends.push({
      orderId: row.orderId,
    });
  });

  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  params.operation = 'reset';
  Modal.confirm({
    title: '提示',
    content: '确认重置?',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/ygcgProductAction/headOperation.do',
          params,
        );
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};

const handleOpen = () => {
  const checkedRows: any[] = ChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(checkedRows)) {
    message.warning('请选择订单');
    return;
  }

  const sends: any = [];
  (checkedRows as any[]).forEach((row) => {
    sends.push({
      orderId: row.orderId,
    });
  });

  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  params.operation = 'open';
  Modal.confirm({
    title: '提示',
    content: '确认开启?',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/ygcgProductAction/headOperation.do',
          params,
        );
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};

const handleClose = () => {
  const checkedRows: any[] = ChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(checkedRows)) {
    message.warning('请选择订单');
    return;
  }

  const sends: any = [];
  (checkedRows as any[]).forEach((row) => {
    sends.push({
      orderId: row.orderId,
    });
  });

  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  params.operation = 'close';
  Modal.confirm({
    title: '提示',
    content: '确认关闭?',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/ygcgProductAction/headOperation.do',
          params,
        );
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};

const handleRowClose = () => {
  const checkedRows: any[] = ChildChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(checkedRows)) {
    message.warning('请选择配订单行');
    return;
  }

  const sends: any = [];
  (checkedRows as any[]).forEach((row) => {
    sends.push({
      orderLineId: row.orderLineId,
    });
  });

  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  params.operation = 'close';
  let text = '';
  Modal.confirm({
    title: '请输入关闭原因',
    closable: true,
    centered: true,
    icon: h('span', {
      class: 'hidden',
    }),
    class: 'orderManage-row-close-content',
    content: h(Textarea, {
      placeholder: '',
      rows: 4,
      class: 'w-full',
      maxlength: 500,
      onChange(e: Event) {
        console.warn('onChange', e);
        text = (e.target as HTMLTextAreaElement).value;
      },
    }),
    onOk: async () => {
      params.closeReason = text;
      console.warn('params', params);
      try {
        await requestFormClient.post(
          '/ygcgProductAction/lineOperation.do',
          params,
        );
        message.success('操作成功');
        ChildChcGridApi.reload();
      } catch (error) {
        console.error(error);
      }
    },
  });
};

const handleRowOpen = () => {
  const checkedRows: any[] = ChildChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(checkedRows)) {
    message.warning('请选择配订单行');
    return;
  }

  const sends: any = [];
  (checkedRows as any[]).forEach((row) => {
    sends.push({
      orderLineId: row.orderLineId,
    });
  });

  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  params.operation = 'open';
  Modal.confirm({
    title: '提示',
    closable: true,
    centered: true,
    content: '确认开启?',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/ygcgProductAction/lineOperation.do',
          params,
        );
        ChildChcGridApi.reload();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleUpload"
              class="mr-[0.5rem]"
              data-testid="button_upload"
            >
              上传
            </Button>
            <Button
              type="primary"
              @click="handleOpen"
              class="mr-[0.5rem]"
              data-testid="button_handle_reset"
            >
              开启
            </Button>
            <Button
              type="primary"
              @click="handleClose"
              class="mr-[0.5rem]"
              data-testid="button_handle_reset"
            >
              关闭
            </Button>
            <Button
              type="primary"
              @click="handleReset"
              class="mr-[0.5rem]"
              data-testid="button_handle_reset"
            >
              重置
            </Button>
          </template>
          <template #toolbar-tools>
            <span>金额汇总:{{ totalAmt }}</span>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <ChildChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleRowClose"
              class="mr-[0.5rem]"
              data-testid="button_row_close"
            >
              行关闭
            </Button>
            <Button
              type="primary"
              @click="handleRowOpen"
              class="mr-[0.5rem]"
              data-testid="button_row_open"
            >
              行开启
            </Button>
          </template>
        </ChildChcGrid>
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style lang="less" scoped>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
<style lang="less">
.orderManage-row-close-content .ant-modal-confirm-content {
  max-width: 100% !important;
}
</style>
