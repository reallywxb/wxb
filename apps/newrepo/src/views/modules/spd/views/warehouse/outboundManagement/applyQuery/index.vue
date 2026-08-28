<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';

import EditModalComp from './editModal.vue';

const route = useRoute();
// var isProductControlLevel = chcAppConfig.isProductControlLevel;
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const orderType = urlParams.orderType || 'WO,MO,WR,SO';
const orderTypeOptions = [{ value: orderType, label: '全选' }];
const orderTypes = orderType.split(',');
orderTypes.forEach((item: string) => {
  switch (item) {
    case 'MO': {
      orderTypeOptions.push({ value: 'MO', label: '库间调拨' });
      break;
    }
    case 'SO': {
      orderTypeOptions.push({ value: 'SO', label: '科室请领' });
      break;
    }
    case 'SR': {
      orderTypeOptions.push({ value: 'SR', label: '科室请退' });
      break;
    }
    case 'WO': {
      orderTypeOptions.push({ value: 'WO', label: '库房请领' });
      break;
    }
    case 'WR': {
      orderTypeOptions.push({ value: 'WR', label: '库房请退' });
      break;
    }
  }
});
// const hiddenField = urlParams.hiddenField || '';
const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
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
        field: 'qtyOrdered',
        title: '申请数量',
        minWidth: '90',
        align: 'right',
      },
      {
        field: 'qtyPicking',
        title: '拣货中数量',
        minWidth: '100',
        align: 'right',
      },
      {
        field: 'qtyDelivered',
        title: '实发数量',
        minWidth: '90',
        align: 'right',
      },
      {
        field: 'qtyCancelled',
        title: '取消数量',
        minWidth: '90',
        align: 'right',
      },
      {
        field: 'qtyReceived',
        title: '实收数量',
        minWidth: '90',
        align: 'right',
      },
      {
        field: 'qtyRejected',
        title: '拒收数量',
        minWidth: '90',
        align: 'right',
      },
      {
        field: 'lineStatusName',
        title: '状态',
        minWidth: '80',
      },
      {
        field: 'comments',
        title: '关闭说明',
        minWidth: '120',
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
      },
    ],
    id: 'child',
    queryUrl: 'orderAction/queryLine.do?specShowType=from',
    beforeFetchFn: (params) => {
      return {
        ...params,
        ...parentTableParams.value,
        orderId: parentTableParams.value.orderId ?? 0,
      };
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
        autoLoad: false,
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
    queryUrl: `orderAction/query.do?page=outputQuery`,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '申请时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'deliveryPlanDate',
        title: '要求送达时间',
        minWidth: '160',
        // hidden:true,
        visible: false,
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '申请单位',
        minWidth: '110',
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
        // hidden : !isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '发货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'toWarehouseName',
        title: '收货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'docStatusName',
        title: '单据状态',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '160',
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '申请时间',
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
            placeholder: '请选择申请类型',
            options: orderTypeOptions,
            paginate: false,
          };
        },
        defaultValue: orderType,
        fieldName: 'orderType',
        label: '申请类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level3=N',
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
        // defaultValue: '',
        fieldName: 'warehouseId',
        label: '发货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4',
            placeholder: '请选择申请单位',
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
        label: '申请单位',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          childGridApi.reload({ orderId: row.orderId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = 0;
          // childGridApi.query({ orderId: row.orderId });
        }
      },
    },
    beforeFetchFn: (params) => {
      return { ...params };
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
    orderId: parentTableParams.value.orderId ?? 0,
    productName: parentTableParams.value.productName,
  });
};

onMounted(() => {
  // handleFormSubmit();
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
            <!-- <template #toolbar-actions>
              <Button type="primary" class="mr-[0.5rem]" @click="handlePrint">
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template> -->
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
