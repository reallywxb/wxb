<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

import EditModalComp from './editModal.vue';

const route = useRoute();
const globalPrintStore = useGlobalPrintStore();
const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const returnDoc = urlParams.returnDoc || '';
// const rejectDoc = urlParams.rejectDoc || '';
const orderType = urlParams.orderType || '';
const parentTableParams = ref<{ [key: string]: any }>({
  inoutId: undefined,
  productName: undefined,
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
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
        field: 'productControlLevelName',
        title: '管控类型',
        visible: !!isProductControlLevel,
        minWidth: '100',
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
        field: 'lineAmt',
        title: '金额（元）',
        minWidth: '90',
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
        field: 'bpartnerName',
        title: orderType === 'PR' ? '供应商' : '发货单位',
        minWidth: '200',
        // hidden: true,
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '100',
        sortable: true,
      },
    ],
    showExportBtn: true,
    id: 'child',
    queryUrl: 'inoutAction/queryDetail.do',
    beforeFetchFn: (params) => {
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid, chcGridApi, { EditModal }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      handleSubmit: handleFormSubmit,
      handleReset: async () => {
        await chcGridApi.formApi.resetForm();
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(formValues);
        chcGridApi.query(formValues);
      },
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: `inoutAction/query.do?page=output&orderType=${encodeURIComponent(orderType)}`,
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
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
        title: orderType === 'PR' ? '供应商' : '收货单位',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '发货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额（元）',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        visible: !!isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'isPrinted',
        title: '已打印',
        minWidth: '90',
        formatter: ({ row }: any) => {
          if (row.isPrinted === 'Y') {
            return '是';
          }
          return '否';
        },
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '出库时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            .subtract(1, 'week')
            // .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       dictUrl:
      //         '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
      //       placeholder: '请选择院区',
      //       paginate: false,
      //       showChooseAll: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   defaultValue: '',
      //   fieldName: 'departmentId',
      //   label: '院区',
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择发货仓库',
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
        fieldName: 'warehouseId',
        label: '发货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              orderType === 'PR'
                ? '/baseHandleAction/vendor.do'
                : '/baseHandleAction/customer.do?bpartnerType=4',
            placeholder: '请选择收货单位',
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
        fieldName: 'bpartnerId',
        label: '收货单位',
      },
      {
        component: 'Input',
        fieldName: 'inoutNo',
        label: '出库单号',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/orderAction/outputOrderTypeList.do',
            placeholder: '请选择申请类型',
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
        fieldName: 'queryOrderType',
        label: '申请类型',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全选' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择',
            paginate: false,
          };
        },
        defaultValue: '',
        fieldName: 'isPrinted',
        label: '已打印',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.inoutId) {
          parentTableParams.value.inoutId = row.inoutId;
          childGridApi.reload({ inoutId: row.inoutId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.inoutId = 0;
          // childGridApi.query({ inoutId: row.inoutId });
        }
      },
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'EditModal-editModalApi': {
        closable: true,
        draggable: true,
        // 连接抽离的组件
        connectedComponent: EditModalComp,
      },
    },
  },
);

const handleSearch = () => {
  childGridApi.reload({
    inoutId: parentTableParams.value.inoutId,
    productName: parentTableParams.value.productName,
  });
};
const handlePrint = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }

  const paramLine: any[] = [];
  records.forEach((data: any) => {
    paramLine.push(data.inoutId);
  });
  requestFormClient
    .post(
      `/inoutAction/checkPrintOutputDoc.do?isCheckPrinted=Y&id=${paramLine}`,
    )
    .then(() => {
      Modal.confirm({
        title: '打印提示',
        content: '确认打印出库单吗？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          // 执行打印操作
          // App.print(
          //         `${App.getContextPath()}inoutAction/printOutputDoc.do?isCheckPrinted=Y&id=${
          //           paramLine
          //         }`,
          //       );
          globalPrintStore.print({
            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printOutputDoc.do?isCheckPrinted=Y&id=${paramLine}`,
          });
        },
        onCancel() {},
      });
    });
};
const handleRePrint = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    paramLine.push(data.inoutId);
  });
  Modal.confirm({
    title: '打印提示',
    content: '确认补打出库单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      // 执行打印操作
      //  App.print(App.getContextPath() + 'inoutAction/printOutputDoc.do?id=' + paramLine);
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printOutputDoc.do?id=${paramLine}`,
      });
    },
    onCancel() {},
  });
};
onMounted(() => {
  handleFormSubmit();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <EditModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_print"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleRePrint"
                data-testid="button_reprint"
              >
                补打
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model:value="scope.row.qtyProcess"
                :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}_childGrid`"
              />
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                class="mr-[0.5rem]"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </ChildGrid>
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
