<script lang="ts" setup>
import { computed, h, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import {
  deepClone,
  deepMerge,
  handlePriceToFixedTwo,
  hospitalChange,
} from '#/utils/util';

import activityModal from './modals/activityModal.vue';
import { ChcSelect } from '@vben/chc-ui';
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

const userStore = useUserStore();
const hospitalId = ref(null);
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

const searchController = new LazySearch(1, async () => {
  await nextTick();
  // 获取url参数
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
onMounted(() => {
  if (page === 'approve' || page === 'confirm') {
    searchController.sign();
  }
});

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
});

const fatherFormSchema = [
  {
    component: 'DateGroup',
    fieldName: 'dateRange',
    label: '采退时间',
    defaultValue: [],
    formItemClass: 'col-span-1',
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
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
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
        labelField: 'name',
        valueField: 'id',
        onChange(val: any, option: any) {
          console.warn('hospitalId', val, option);
          hospitalId.value = val;
        },
        afterFetch(res: any) {
          const rows = res?.data.map(
            (item: { hospitalName: string; orgId: number }) => ({
              name: item.hospitalName,
              id: item.orgId,
            }),
          );
          hospitalChange(rows, ChcGridApi.formApi);
          return { ...res, rows: undefined, records: rows };
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
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        placeholder: '请选择院区',
        paginate: false,
        showChooseAll: '',
        immediate: false,
        labelField: 'name',
        valueField: 'id',
        triggerFields: ['hospitalId'],
        onChange(val: any) {
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
        console.warn('trigger values:', JSON.parse(JSON.stringify(values)));
        await nextTick();
        const cond = !!(
          ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
        );
        warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';

        if (cond) {
          const departmentIdRef =
            ChcGridApi?.formApi?.getFieldComponentRef<
              InstanceType<typeof ChcSelect>
            >('departmentId');

          if (departmentIdRef) {
            if (values?.hospitalId) {
              departmentIdRef.params.dependencies = {
                hospitalId: values.hospitalId,
              };

              const selectOptions = await departmentIdRef.fetchApi();
              console.log('selectOptions', selectOptions);
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
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
        placeholder: '请选择仓库',
        triggerFields: ['departmentId', 'regionId'],
        paginate: false,
        immediate: false,
        labelField: 'name',
        valueField: 'id',
        allowClear: true,
        extraParams: warehouseIdExtraParams.value,
        autoChooseFirstOption: false,
        afterFetch(res: any) {
          // if (res.rows?.length) {
          //   const firstOption = res.rows[0];
          //   ChcGridApi.formApi?.setFieldValue('warehouseId', firstOption.id);
          // }
          return { ...res, rows: undefined, records: res.rows };
        },
        onChange(val: any) {
          console.warn('warehouseId change', val);
        },
      };
    },
    dependencies: {
      triggerFields: ['departmentId', 'regionId'],
      trigger(values: any) {
        if (
          ChcGridApi.formApi?.getFieldComponentRef &&
          typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
          ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
        ) {
          ChcGridApi.formApi.getFieldComponentRef(
            'warehouseId',
          ).params.dependencies = {
            regionId: values.departmentId,
            departmentId: values.departmentId,
          };
          ChcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
          ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
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
    label: '药品',
    componentProps: () => {
      return {
        placeholder: '请输入药品',
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
    field: 'isWorkflowEnd',
    title: '审批是否结束',
    width: '140',
    formatter: ({ cellValue }: { cellValue: any }) => {
      return cellValue === 'Y' ? '是' : '否';
    },
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
  {
    field: 'action',
    fixed: 'right',
    title: '操作',
    width: 150,
    align: 'center',
    slots: {
      default: (scope: any) => {
        return h(
          Button,
          {
            type: 'primary',
            'data-testid': `button_view_${scope.rowIndex}`,
            onClick: () => {
              console.warn('点击单元格 scope', scope);
              ActivityModalApi.setData({
                row: deepClone(scope.row),
              }).open();
            },
          },
          {
            default: () => '查看审批流程',
          },
        );
      },
    },
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
const [ActivityModal, ActivityModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: activityModal,
  draggable: true,
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
      cellStyle: ({ row, column }: { column: any; row: any }) => {
        if (
          column.field === 'isWorkflowEnd' &&
          row.isWorkflowEnd &&
          row.isWorkflowEnd === 'N'
        ) {
          return {
            color: '#F581B1',
          };
        }
        return {};
      },
    }),
  },
  {
    id: 'approveWfLog',
    // api地址
    queryUrl: `/orderAction/query.do?orderType=PR&page=workflowApproveLog`,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: fatherFormSchema,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          SonChcGridApi.query({
            orderId: row.orderId,
          });
        } else {
          SonChcGridApi.grid.remove();
        }
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
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '120',
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
        width: 120,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: '90',
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '购进价格',
        width: 120,
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
        field: 'description',
        title: '备注',
        width: '150',
      },
    ],
    id: 'approveWfLog_son',
    queryUrl: '/orderAction/queryLine.do?specShowType=from',
    showCustomBtn: true,
    showZoomBtn: true,
    tablesearchExtraParams: parentTableParams.value,
    beforeFetchFn: (params) => {
      // const row = ChcGridApi.grid.getRadioRecord(true);
      // if (!isEmpty(row) && row?.orderId) {
      //   params.orderId = row.orderId;
      // }
      const row = ChcGridApi.grid.getRadioRecord(true);
      parentTableParams.value.orderId =
        !isEmpty(row) && row?.orderId ? row.orderId : 0;
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
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ActivityModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid />
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
