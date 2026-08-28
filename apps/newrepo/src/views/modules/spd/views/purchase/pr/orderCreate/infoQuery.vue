<script setup lang="ts">
import { h, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Button, message, Modal } from 'ant-design-vue';

import { deepMerge } from '#/utils/util';
import { SvgDeleteIcon, EditActionIcon } from '@vben/chc-icons';
import { isEmpty } from '@vben/utils';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deleteOrder, detailCommit } from './api';
import { useGlobalPrintStore } from '@vben/stores';
import { handlePriceToFixedTwo } from '#/utils/util';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', { required: true });

const globalPrintStore = useGlobalPrintStore();
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      handleReset: async () => {
        await ChcGridApi.formApi.resetForm();
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        componentProps: () => {
          return {
            valueFormat: 'YYYY-MM-DD',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: true,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '请选择供应商',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    gridColumns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      { title: '序号', type: 'seq', width: '50', align: 'center' },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '申请时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '申请仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        minWidth: '100',
        sortable: true,
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 150,
      },
    ],
    id: 'orderCreate',
    queryUrl: '/orderAction/query.do?orderType=PR',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return {
        ...params,
        docStatus: 'DR',
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
  },
);

// 新建按钮：跳转到编辑页新建
const handleAddNew = () => {
  parentData.value = {};
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '新建采退订单',
    sourcePage: props.thisTab.value,
    type: 'add',
  };
};

// 编辑按钮：跳转到编辑页查看详情
const handleEdit = (row: any) => {
  parentData.value = row;
  console.warn('handleEdit parentData', parentData.value);
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '编辑采退订单',
    sourcePage: props.thisTab.value,
    type: 'edit',
  };
};

// 删除按钮：确认后删除订单
const handleDelete = (row: any) => {
  Modal.confirm({
    title: '确认删除',
    content: h('div', {}, [h('p', `确定要删除申请单号：${row.orderNo} 吗？`)]),
    onOk: async () => {
      try {
        const params = {
          orderId: row.orderId,
        };
        const res = await deleteOrder(params);
        if (res && res.success) {
          message.success('删除成功');
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.query({ ...formValues });
        } else {
          message.error(res.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败', error);
      }
    },
  });
};

// 提交按钮：批量提交选中的订单
const handleApprove = () => {
  const checkedRows: any[] = ChcGridApi.grid.getCheckboxRecords(true);
  if (checkedRows.length === 0) {
    message.warning('请先选择要提交的数据');
    return;
  }

  const orderNoList = checkedRows.map((row: any) => row.orderNo).join('、');

  Modal.confirm({
    title: '提交采退订单',
    content: h('div', {}, [
      h('p', `申请单号：${orderNoList}`),
      h('p', `共选择 ${checkedRows.length} 条数据，是否确认提交？`),
    ]),
    onOk: async () => {
      try {
        const orderIdList = checkedRows
          .map((row: any) => row.orderId)
          .join(',');
        const params = {
          orderId: orderIdList,
        };
        const res = await detailCommit(params);
        if (res && res.success) {
          const count = res.orderNos ? res.orderNos.length : 0;
          const orderNos = res.orderNos ? res.orderNos.join(',') : '';
          message.success(`已成功生成${count}个退货订单，订单号：${orderNos}`);
          ChcGridApi.query();

          if (res.success && res.orderIds && res.orderIds.length > 0) {
            const idsStr = Array.isArray(res.orderIds)
              ? res.orderIds.join(',')
              : res.orderIds;
            globalPrintStore.print({
              pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/spdPrintReportAction/printPRInOutDocByOrder?orderID=${encodeURIComponent(idsStr)}`,
            });
          }
        }
      } catch (error) {
        console.error('提交失败', error);
      }
    },
  });
};

watch(
  () => currentTab.value,
  (val: number | string) => {
    if (val === props.thisTab.value) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);
</script>

<template>
  <div class="h-full">
    <ChcGrid class="editableTable">
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAddNew"
          class="mr-[0.5rem]"
          data-testid="button_new_order"
        >
          新 建
        </Button>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_submit_order"
        >
          提 交
        </Button>
      </template>
      <template #action="scope">
        <Button
          type="primary"
          ghost
          @click="handleEdit(scope.row)"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_edit_${scope.rowIndex}_order`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          ghost
          danger
          @click="handleDelete(scope.row)"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_delete_${scope.rowIndex}_order`"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>
