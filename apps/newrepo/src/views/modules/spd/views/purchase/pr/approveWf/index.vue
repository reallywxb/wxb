<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
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
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo, hospitalChange } from '#/utils/util';

import rejectModalUi from './modals/rejectModal.vue';
import { ChcSelect } from '@vben/chc-ui';

const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

const globalPrintStore = useGlobalPrintStore();
const hospitalId = ref(null);
console.warn('globalPrintStore', globalPrintStore);
const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page || route.query?.page || '';
console.warn('page:', page);
const isProductControlLevel = computed(() => {
  return userStore?.userInfo?.isProductControlLevel || false;
});
const isSaas = computed(() => {
  return userStore?.userInfo?.isSaas || false;
});
console.warn('userStore', userStore);

console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
const departmentId = ref<number | string>('');
const searchController = new LazySearch(3, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  // 获取url参数
  ChcGridApi?.formApi?.getValues().then((res: Record<string, any>) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
onMounted(() => {
  if (page === 'approve' || page === 'confirm') {
    searchController.sign(3);
  }
});
const [RejectModal, RejectModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUi,
  draggable: true,
});
const fatherFormSchema = [
  {
    component: 'DateGroup',
    fieldName: 'dateRange',
    label: '采退时间',
    defaultValue: [
      dayjs(dayjs().format('YYYY-MM-DD'))
        .subtract(1, 'week')
        .format('YYYY-MM-DD'),
    ],
    formItemClass: 'col-span-1',
  },
  {
    fieldName: 'hospitalId',
    label: '医院',
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
  },
  {
    component: 'ChcSelect',
    fieldName: 'orgId',
    label: '机构',
    formItemClass: `col-span-1 ${isSaas.value ? '' : 'hidden'}`,
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/userOrgList.do',
        placeholder: '',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        defaultValue: '',
        autoChooseFirstOption: true,
        afterFetch(res: any) {
          if (!isFirstLoaded.value) {
            searchController.sign(1);
          }
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
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        placeholder: '请选择院区',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        triggerFields: ['hospitalId'],
        onChange(val: any) {
          departmentId.value = val;
          warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';
        },
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    dependencies: {
      triggerFields: ['hospitalId'],
      async trigger(values: Record<string, any>) {
        console.log('院区 trigger values:', values);
        warehouseIdExtraParams.value.hospitalId = values?.hospitalId;
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
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
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
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
        placeholder: '请选择仓库',
        triggerFields: ['departmentId', 'regionId'],
        paginate: false,
        immediate: false,
        labelField: 'name',
        valueField: 'id',
        allowClear: true,
        autoChooseFirstOption: true,
        extraParams: warehouseIdExtraParams.value,
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    dependencies: {
      triggerFields: ['departmentId', 'regionId'],
      async trigger(values: any) {
        const cond = !!(
          ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
        );
        if (cond) {
          const warehouseIdRef =
            ChcGridApi.formApi?.getFieldComponentRef<
              InstanceType<typeof ChcSelect>
            >('warehouseId');
          if (warehouseIdRef) {
            if (values?.departmentId) {
              warehouseIdRef.params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              await warehouseIdRef.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
            } else {
              warehouseIdRef.clearOptions();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          }
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'bpartnerId',
    label: '供应商',
    defaultValue: '',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/vendor.do',
        placeholder: '请选择供应商',
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
    dependencies: {
      triggerFields: ['hospitalId'],
    },
  },
  {
    component: 'Input',
    fieldName: 'orderNo',
    label: '采退单号',
    componentProps: () => {
      return {
        placeholder: '',
      };
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'docStatus',
    label: '状态',
    componentProps: () => {
      return {
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        mode: 'multiple',
        maxTagCount: 2,
        allowClear: true,
        options: [
          { value: 'DR', label: '新建' },
          { value: 'WU', label: '待复核' },
          { value: 'WA', label: '待审批' },
          { value: 'NA', label: '未批准' },
          { value: 'CO', label: '已确认' },
          { value: 'VO', label: '已作废' },
        ],
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '商品',
    componentProps: () => {
      return {
        placeholder: '编码/拼音码/名称',
      };
    },
  },
].filter((formItem) => {
  if (formItem.fieldName === 'docStatus') {
    // 状态
    return page !== 'approve' && page !== 'confirm';
  }
  return true;
});
const fatherGridColumns: any[] = [
  {
    type: 'radio',
    title: '单选',
    width: '50',
    align: 'center',
    visible: false,
  },
  {
    type: 'seq',
    title: '序号',
    width: '50',
    align: 'center',
  },

  {
    field: 'orderNo',
    title: '采退单号',
    width: '150',
    sortable: true,
  },
  {
    field: 'dateOrdered',
    title: '采退时间',
    width: '130',
    sortable: true,
  },
  {
    field: 'bpartnerName',
    title: '供应商',
    width: '150',
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
    width: '120',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: '金额',
    width: '100',
    align: 'right',
    sortable: true,
    formatter({ cellValue }: any) {
      return handlePriceToFixedTwo(cellValue);
    },
  },
  {
    field: 'productControlLevelName',
    title: '管控类型',
    visible: isProductControlLevel.value,
    width: '100',
    sortable: true,
  },
  {
    field: 'receiptTypeName',
    title: '采购类型',
    width: '100',
    sortable: true,
  },
  {
    field: 'invoiceMethodName',
    title: '开票方式',
    width: '100',
    sortable: true,
  },
  {
    field: 'wfNodeName',
    title: '审批节点',
    width: '120',
  },
  {
    field: 'createdByName',
    title: '创建人',
    width: '100',
    sortable: true,
  },
  {
    field: 'created',
    title: '创建时间',
    width: '130',
  },
  {
    field: 'description',
    title: '备注',
    width: '150',
  },
].filter((item) => {
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
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      // showCollapseButton: false,
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
    queryUrl: `/orderAction/query.do?orderType=PR&page=workflowApprove`,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: fatherFormSchema,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (isEmpty(row)) {
          SonChcGridApi.grid.remove();
        } else {
          SonChcGridApi.reload();
        }
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
      },
      // 单个复选框变化事件
      // checkboxChange: (v: any) => {
      //   console.warn('父表格 checkboxChange', v);
      // },
      // // 全选/全不选事件
      // checkboxAll: (v: any) => {
      //   console.warn('父表格 checkboxAll', v);
      // },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      if (!params.hospitalId) {
        message.warning('医院必选，请选择医院');
        return false;
      }
      console.warn('beforeFetchFn params', params);
      const newParams = { ...params };
      if (page === 'reject') {
        newParams.docStatus = "'NA'";
        return newParams;
      }

      if (page === 'confirm') {
        newParams.docStatus = "'WU'";
        return newParams;
      }
      if (newParams.docStatus) {
        // 如果是有值的数组，转换格式
        if (
          Array.isArray(newParams.docStatus) &&
          newParams.docStatus.length > 0
        ) {
          newParams.docStatus = newParams.docStatus
            .map((val: string) => `'${val}'`)
            .join(',');
        }
        // 如果是空数组，删除该字段（表示不筛选状态）
        else if (
          Array.isArray(newParams.docStatus) &&
          newParams.docStatus.length === 0
        ) {
          delete newParams.docStatus;
        }
      }

      return newParams;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        SonChcGridApi.grid.remove();
      }

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
        type: 'seq',
        title: '序号',
        width: '50',
        align: 'center',
      },
      {
        // TODO:medicine change 药品编码
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        // TODO:medicine change 医保药品编码
        field: 'insurance',
        title: '医保药品编码',
        width: '120',
        sortable: true,
      },
      // {
      //   field: 'standardCode',
      //   title: '贯标编码',
      //   width: '120',
      //   sortable: true,
      // },
      {
        // TODO:medicine change 药品名称
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
      // {
      //   field: 'modelNo',
      //   title: '型号',
      //   width: '150',
      //   sortable: true,
      // },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '退货数量',
        align: 'right',
        width: '80',
      },
      {
        field: 'priceActual',
        title: '退货价格',
        width: 150,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: 150,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '购进价格',
        width: 150,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lot',
        title: '批号',
        width: 120,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: 90,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'invoiceDate',
        title: '发票日期',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        width: 90,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'returnReason',
        title: '退货原因',
        width: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
      },
    ],
    id: 'approveWf_son',
    queryUrl: '/orderAction/queryLine.do?specShowType=from',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      const row = ChcGridApi.grid.getRadioRecord(true);
      params.orderId = !isEmpty(row) && row?.orderId ? row.orderId : 0;
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

// TODO:批准和拒绝无效 参数与接口与旧项目相同  需与后端调试
const handleApprove = async () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow = toRaw(row);
  console.warn('handleSubmit unProxyRow', unProxyRow);
  if (isEmpty(row)) {
    message.warning('请选择一条记录！');
    return;
  }

  const paramLine: (number | string)[] = [unProxyRow.wfActivityId];
  const params: Record<string, any> = {};
  params.wfActivityId = JSON.stringify(paramLine);

  Modal.confirm({
    title: '提示',
    content: '确认批准吗？',
    onOk: async () => {
      try {
        const res = await requestFormClient.post(
          '/orderAction/approveWorkflow.do',
          params,
        );
        if (res.success) {
          message.success('成功批准1个申请！');
          const id = unProxyRow.orderId;
          Modal.confirm({
            title: '打印提示',
            content: '确认打印订单吗？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              globalPrintStore.print({
                pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/spdPrintReportAction/printPRInOutDocByOrder?orderID=${id}`,
              });
            },
            onCancel() {},
          });
          const formValues = await ChcGridApi?.formApi.getValues();
          ChcGridApi.query({ ...formValues });
        } else {
          message.error(`批准失败：${res.msg}`);
        }
      } catch (error) {
        console.error('批准失败', error);
      }
    },
  });
};

const handleReject = async () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow = toRaw(row);
  console.warn('handleReject unProxyRow', unProxyRow);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }

  RejectModalApi.setData({
    row: unProxyRow,
    modalTitle: `拒绝1笔申请`,
    callback() {
      ChcGridApi.query();
    },
  }).open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <RejectModal />
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
