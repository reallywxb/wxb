<script lang="ts" setup>
import { ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import actionLogModal from './modals/actionLogModal.vue';
import { receiveAsn, rePutawayLine } from './modals/api';
import FormModal from './modals/FormModal.vue';

const globalPrintStore = useGlobalPrintStore();

const userStore = useUserStore();

const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

const parentTableParams = ref<{ [key: string]: any }>({
  asnId: undefined,
  productName: undefined,
});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    }),
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
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 90,
        sortable: true,
      },
      { field: 'manufacturer', title: '厂家', sortable: true, minWidth: 120 },
      { field: 'uomName', title: '单位', sortable: true, minWidth: 60 },
      {
        field: 'packageCountArrived',
        title: '到货包数',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyArrived',
        title: '到货数量',
        sortable: true,
        minWidth: 90,
        align: 'right',
        slots: { default: 'qtyArrived' },
      },
      {
        field: 'qtyRejected',
        title: '拒收数量',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountRejected',
        title: '拒收包数',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyReceived',
        title: '入库数量',
        minWidth: 90,
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceActual',
        title: '配送价',
        minWidth: 70,
        sortable: true,
        align: 'right',
      },
      { field: 'lot', title: '批号', sortable: true, minWidth: 100 },
      { field: 'guaranteeDate', title: '效期', sortable: true, minWidth: 100 },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        sortable: true,
        minWidth: 120,
      },
      {
        field: 'locatorName',
        title: '入库货位',
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'error',
        title: '异常说明',
        sortable: true,
        minWidth: 120,
      },
      { field: 'description', title: '备注', sortable: true, minWidth: 120 },
      { field: 'checkerName', title: '验收人', sortable: true, minWidth: 120 },
      {
        field: 'checkTime',
        title: '验收时间',
        sortable: true,
        minWidth: 120,
      },
      { field: 'putawayName', title: '上架人', sortable: true, minWidth: 120 },
      {
        field: 'putawayTime',
        title: '上架时间',
        sortable: true,
        minWidth: 120,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        // visible: detailInfo.value?.type === 'edit',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/asnAction/queryDetail.do',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.asnId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
        asnId: parentTableParams.value.asnId ?? 0,
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
const [ChcGrid, ChcGridApi] = useSpdGrid(
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
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          // field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/asnAction/query.do?page=receiveConfirm&asnType=WO,SR,WR,MO',
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      {
        field: 'asnNo',
        title: '出库单号',
        minWidth: 120,
        sortable: true,
      },
      { field: 'created', title: '出库时间', minWidth: 150, sortable: true },
      {
        field: 'bpartnerName',
        title: '发货仓库',
        minWidth: 100,
        sortable: true,
      },
      { field: 'departmentName', title: '院区', minWidth: 100, sortable: true },
      {
        field: 'warehouseName',
        title: '收货仓库',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'asnStatusName',
        title: '验收状态',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        minWidth: 80,
        align: 'right',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '药品组',
        minWidth: 150,
        visible: userStore.userInfo.isProductControlLevel,
        sortable: true,
      },
      {
        field: 'priorityTypeName',
        title: '来源类别',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        minWidth: 100,
        sortable: true,
      },
      { field: 'description', title: '备注', minWidth: 150, sortable: true },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        // visible: detailInfo.value?.type === 'edit',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '出库时间',
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
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
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
            placeholder: '请选择入库仓库',
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
        label: '入库仓库',
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        componentProps: {
          placeholder: '请输入出库单号',
        },
        label: '出库单号',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        componentProps: {
          placeholder: '请输入药品',
        },
        label: '药品',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.asnId) {
          parentTableParams.value.asnId = row.asnId;
          roleGridApi.reload({ asnId: row.asnId });
          await ChcGridApi.grid.clearCheckboxRow();
          ChcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.asnId = 0;

          roleGridApi.grid.reloadData([]);
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

const handleSearch = () => {
  if (!parentTableParams.value.asnId) {
    return;
  }
  roleGridApi.reload({
    asnId: parentTableParams.value.asnId ?? 0,
    productName: parentTableParams.value.productName,
  });
};
const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});

const handleChange = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择入库单！');
    return;
  }
  const asnId = selectedRows.map((row: any) => row.asnId);
  modalApi
    .setData({
      dataTableId: '/orderAction/close.do',
      formData: {
        asnId: JSON.stringify(asnId),
      },
      openType: 'close',
    })
    .open();
};
async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}

const handleQtyArrivedClick = (scope: any) => {
  console.warn(
    '点击qtyArrived:',
    scope.row,
    scope.row.qtyArrived,
    handleChange,
  );
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
    })
    .open();
};

const handleConfirm = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否确认此数据？`,
    onOk: async () => {
      try {
        // 获取子列表所有数据的asnLineId集合
        const childTableData = roleGridApi.grid.getTableData();
        const asnLineIds = childTableData.fullData
          .map((item: any) => item.asnLineId)
          .filter(Boolean);

        const params = {
          asnId: scope.row?.asnId,
          asnLineIds: JSON.stringify(asnLineIds),
        };
        console.warn('params', params);

        await receiveAsn(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('rejectWorkrejectWorkrejectWork', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('确认成功');
              if (scope.row?.orderTypeName === '科室请退' && res.data.inoutId) {
                globalPrintStore.print({
                  pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printInputDoc.do?id=${encodeURIComponent(res.data.inoutId)}`,
                });
              }
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('确认失败');
      }
    },
  });
};
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否将此数据撤销上架？`,
    onOk: async () => {
      try {
        await rePutawayLine({ asnLineIds: scope.row?.asnLineId })
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('撤销成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('撤销失败');
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <OrgFormModal :after-submit="refreshTable" />
      <ActionLogModal />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <!-- <template #toolbar-actions>
              <Button
                style="margin-top: -5px"
                type="primary"
                @click="handleChange"
              >
                扫码交接
              </Button>
            </template> -->
            <template #action="scope">
              <Button
                type="primary"
                danger
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleConfirm(scope)"
                data-testid="button_confirm"
              >
                入库确认
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #action="scope">
              <Button
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                style="background-color: #3717bb94"
                @click="handleCancel(scope)"
                :data-testid="`button_cancel_${scope.rowIndex}`"
              >
                撤销上架
              </Button>
            </template>
            <template #qtyArrived="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyArrivedClick(scope)"
                :data-testid="`button_qtyArrived_${scope.rowIndex}`"
              >
                {{ scope.row.qtyArrived }}
              </a>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="请输入药品名称"
                style="margin-top: 10px"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                style="margin-top: 10px"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
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
