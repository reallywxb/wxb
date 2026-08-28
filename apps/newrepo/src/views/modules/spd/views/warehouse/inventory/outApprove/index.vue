<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { computed, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import checkUserModalUi from './modals/checkUserModal.vue';
import rejectModalUi from './modals/rejectModal.vue';
import { ChcSelect } from '@vben/chc-ui';
const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
let docType = urlParams?.docType || '';
if (docType === 'I ') {
  docType = 'I+';
}
const isProductControlLevel = computed(() => {
  return userStore?.userInfo?.isProductControlLevel;
});
console.warn('urlParams', urlParams);

const [RejectModal, RejectModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUi,
  draggable: true,
});
const [CheckUserModal, CheckUserModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 链接抽离的组件
  connectedComponent: checkUserModalUi,
  draggable: true,
});

let fatherGridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    type: 'checkbox',
    align: 'center',
    title: '多选',
  },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'inventoryNo',
    title: '申请单号',
    width: '110',
    sortable: true,
  },
  {
    field: 'movementDate',
    title: '申请时间',
    width: '160',
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
    title: '仓库',
    width: '200',
    sortable: true,
  },
  {
    field: 'productCode',
    title: '药品编码',
    width: '120',
    sortable: true,
  },
  {
    field: 'productName',
    title: '药品名称',
    width: '200',
    sortable: true,
  },
  {
    field: 'productSpec',
    title: '规格',
    width: '150',
    sortable: true,
  },
  {
    field: 'modelNo',
    title: '型号',
    width: '130',
    sortable: true,
    visible: false,
  },
  {
    field: 'manufacturer',
    title: '厂家',
    width: '150',
    sortable: true,
  },
  {
    field: 'productControlLevelName',
    title: '管控类型',
    visible: !isProductControlLevel.value,
    width: '110',
    sortable: true,
  },
  {
    field: 'uomName',
    title: '单位',
    width: '70',
    sortable: true,
  },
  {
    field: 'qty',
    title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
    width: '100',
    align: 'right',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
    width: '100',
    align: 'right',
    sortable: true,
    //			}, {
    //				"field": "docStatusName",
    //				"title": "计划状态",
    //				"width": "100",
    //				"sortable": true
  },
  {
    field: 'commitUserName',
    title: '申请人',
    width: '100',
    sortable: true,
  },
  {
    field: 'commitTime',
    title: '申请时间',
    width: '160',
    sortable: true,
    //			}, {
    //				"field": "description",
    //				"title": "备注",
    //				"width": "150",
    //				"sortable": true
  },
];
fatherGridColumns = fatherGridColumns.filter((item) => {
  if (
    item.field === 'action' ||
    item.type === 'radio' ||
    item.type === 'checkbox'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});
const fatherTableCheckedRow = ref<Record<string, any>>({});
const hospitalId = ref(null);
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        if (!formValues.hospitalId) {
          message.warn('医院必选，请选择医院');
          return;
        }
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'outApprove',
    // api地址
    queryUrl: `/inventoryAction/query.do?page=workflowApprove&docType=${encodeURIComponent(docType)}`,
    showRadioRowTag: true,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '申请时间',
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/hospitalAction/queryHospList?dataType=all',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'hospitalName',
            valueField: 'orgId',
            onChange(val: any, option: any) {
              console.warn('hospitalId', val, option);
              hospitalId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res?.data || [] };
            },
          };
        },
        fieldName: 'hospitalId',
        label: '医院',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: `请选择院区`,
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            onChange() {
              warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.warn('trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            warehouseIdExtraParams.value.hospitalId = values?.hospitalId;
            if (cond) {
              const departmentIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('departmentId');
              if (departmentIdRef) {
                if (values?.hospitalId) {
                  departmentIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  const selectOptions = await departmentIdRef.fetchApi();
                  // 选第一个不是全部的id
                  const item = selectOptions.filter(
                    (o: Record<string, any>) => !isEmpty(o?.id),
                  )?.[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'departmentId',
                    item?.id || undefined,
                  );
                } else {
                  departmentIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('departmentId', undefined);
                }
              }
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            triggerFields: ['departmentId', 'regionId'],
            placeholder: `请选择仓库`,
            paginate: false,
            showChooseAll: '',
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            extraParams: warehouseIdExtraParams.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            const compRef =
              ChcGridApi.formApi.getFieldComponentRef?.('warehouseId');
            if (compRef) {
              compRef.params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };

              compRef.fetchApi();
              ChcGridApi.formApi.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: `请输入药品名称`,
          };
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.inventoryId) {
          fatherTableCheckedRow.value = row;
          SonChcGridApi.reload();
          await ChcGridApi.grid.clearCheckboxRow();
          ChcGridApi.grid.setCheckboxRow(row, true);
        } else {
          fatherTableCheckedRow.value = {};
          SonChcGridApi.grid.remove();
        }
      },
      // 单个复选框变化事件
      checkboxChange: (v: any) => {
        console.warn('父表格 checkboxChange', v);

        if (v.checked) {
          fatherTableCheckedRow.value = {};
          fatherTableCheckedRow.value = v.row;
          SonChcGridApi.reload();
        } else if (
          v.checked === false &&
          !isEmpty(v.row.inventoryId) &&
          !isEmpty(fatherTableCheckedRow.value.inventoryId) &&
          fatherTableCheckedRow.value.inventoryId === v.row.inventoryId
        ) {
          fatherTableCheckedRow.value = {};
          SonChcGridApi.grid.remove();
        }
      },
      // 全选/全不选事件
      checkboxAll: (v: any) => {
        console.warn('父表格 checkboxAll', v);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn params', params);
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      SonChcGridApi.grid.remove();
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [SonChcGrid, SonChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 0,
        align: 'center',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'qty',
        title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        width: '100',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
      },
      {
        field: 'lineAmt',
        title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
        width: '120',
        align: 'right',

        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '250',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '150',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        width: '110',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '180',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'inventoryReasonName',
        title: '损溢原因',
        width: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
        sortable: true,
      },
    ],
    id: 'outApprove_son',
    queryUrl: '/inventoryAction/queryDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      if (!isEmpty(fatherTableCheckedRow.value.inventoryId)) {
        params.inventoryId = fatherTableCheckedRow.value.inventoryId;
      }
      if (!fatherTableCheckedRow.value.inventoryId) {
        return false;
      }
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const afterSubmit = () => {
  ChcGridApi.query();
};
const handleApprove = async () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords();
  const unProxyRows = toRaw(checkedRows);
  console.warn('handleSubmit unProxyRows', unProxyRows);
  if (unProxyRows.length <= 0) {
    message.warning(`请选择${docType === 'I-' ? '报损' : '报溢'}申请！`);
    return;
  }

  const paramLine: any = [];
  let isControlledProduct = '';
  let warehouseId = '';
  unProxyRows.forEach((item: any) => {
    isControlledProduct = item.isControlledProduct;
    warehouseId = item.warehouseId;
    paramLine.push(item.wfActivityId);
  });
  const params: Record<string, any> = {};
  params.wfActivityId = JSON.stringify(paramLine);
  if (isControlledProduct === 'Y') {
    CheckUserModalApi.setData({
      warehouseId,
      modalTitle: `确认批准${unProxyRows.length}笔${
        docType === 'I-' ? '报损' : '报溢'
      }申请吗？`,
    }).open();
  } else {
    Modal.confirm({
      title: '提示',
      content: `确认批准${unProxyRows.length}笔${
        docType === 'I-' ? '报损' : '报溢'
      }申请吗？`,
      onOk: async () => {
        try {
          await requestFormClient.post(
            `/inventoryAction/approveWorkflow.do`,
            params,
          );
          message.success('批准成功');
          ChcGridApi.query();
        } catch (error) {
          console.error('批准失败', error);
        }
      },
    });
  }
};

const handleReject = async () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords();
  const unProxyRows = toRaw(checkedRows);
  console.warn('handleSubmit unProxyRows', unProxyRows);
  if (unProxyRows.length <= 0) {
    message.warning('请选择一条记录');
    return;
  }

  const paramLine: any = [];

  unProxyRows.forEach((item: any) => {
    paramLine.push(item.wfActivityId);
  });
  RejectModalApi.setData({
    wfActivityId: JSON.stringify(paramLine),
    modalTitle: `拒绝${unProxyRows.length}笔申请`,
  }).open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <RejectModal :after-submit="afterSubmit" />
    <CheckUserModal :after-submit="afterSubmit" />
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
              @click="handleApprove"
              class="mr-[0.5rem]"
              data-testid="button_approve"
            >
              批准
            </Button>
            <Button
              type="primary"
              danger
              @click="handleReject"
              class="mr-[0.5rem]"
              data-testid="button_reject"
            >
              拒绝
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <SonChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
