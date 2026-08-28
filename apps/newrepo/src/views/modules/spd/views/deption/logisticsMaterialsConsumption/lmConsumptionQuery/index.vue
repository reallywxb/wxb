<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SvgSquareTickIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button, InputNumber, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import RevokeConsumeModalComp from './revokeConsumeModal.vue';

const route = useRoute();

const urlParams: { [key: string]: any } = route.meta?.urlParams || {};

// const warehouseLevel = urlParams?.warehouseLevel || '3';
const warehouseId = ref<any>(undefined);
const isFirstLoaded = ref(false); // 是否已初次加载
const isNarcotic = undefined;
const extParams = ref<any>({
  isNarcotic,
});
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(2, async () => {
  await nextTick();
  chcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    if (!isEmpty(res?.warehouseId)) {
      chcGridApi.query({ ...res });
    }
  });
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  if (isEmpty(formValues?.warehouseId)) {
    message.warning('请选择仓库');
    return;
  }
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();

  chcGridApi.formApi.setFieldValue('warehouseId', warehouseId.value);
  const formValues = await chcGridApi.formApi.getValues();
  console.warn('handleFormReset', formValues);
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  if (isEmpty(formValues?.warehouseId)) {
    message.warning('请选择仓库');
    return;
  }
  chcGridApi.query(formValues);
  chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
};
const [ChcGrid, chcGridApi, { BatchSetModal, batchSetModalApi }] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      showCollapseButton: false,
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      commonConfig: {
        labelClass: 'w-[70px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      editConfig: {
        enabled: true,
        trigger: 'click',
        mode: 'row',
        autoClear: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
      cellStyle(scope: any) {
        if (scope.column.field === 'qtyOrdered') {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {},
      // 全选/全不选事件
      checkboxAll: () => {},
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        title: '序号',
        width: 50,
        type: 'seq',
        align: 'center',
      },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'inoutId',
        title: '出库单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'inoutLineId',
        title: '出库单行号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '80',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '单据数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyCanReturn',
        title: '可退数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '撤销数量',
        minWidth: '90',
        align: 'right',
        editRender: {},
        slots: {
          edit: 'qtyPlanedEdit',
        },
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '出库时间',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '90',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '消耗时间',
        // defaultValue: [
        //   dayjs(dayjs().format('YYYY-MM-DD'))
        //     .subtract(7, 'day')
        //     .format('YYYY-MM-DD'),
        // ],
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            // dictUrl: `/baseHandleAction/warehouse.do?level${warehouseLevel}=Y&readWrite=Y&isProxyWarehouse=N`,
            dictUrl: `/baseHandleAction/warehouse.do?categoryType=1&readWrite=Y&isProxyWarehouse=N`,
            // showSearch: true,
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              warehouseId.value = val;
            },
            afterFetch(res: any) {
              searchController.sign();
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              chcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        fieldName: 'warehouseId',
        label: '仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'inoutId',
        label: '出库单号',
        componentProps: {
          placeholder: '请输入出库单号',
        },
      },
    ],
    queryUrl: 'returnApplyAction/queryV3InOutDetail.do?page=Consume',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'lmConsumptionQuery',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
        // warehouseId: warehouseId.value,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'BatchSetModal-batchSetModalApi': {
        // 连接抽离的组件
        connectedComponent: RevokeConsumeModalComp,
      },
    },
  },
);
const handleBatchSet = async () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  const formValues = await chcGridApi.formApi.getValues();
  if (isEmpty(formValues?.warehouseId)) {
    message.warning('请选择仓库');
    return;
  }
  if (!records || records.length === 0) {
    return message.error('请选择进行登记的数据！');
  }
  // 数据验证
  let hasError = false;
  records.forEach((data: any) => {
    // 检查撤销数量是否存在
    if (!data.qtyOrdered && data.qtyOrdered !== 0) {
      hasError = true;
      return message.error(`商品：${data.productName}，撤销数量不存在`);
    }
    // 检查撤销数量是否大于可用数量
    if (data.qtyCanReturn < data.qtyOrdered) {
      hasError = true;
      return message.error(
        `商品：${data.productName}，撤销数量：${
          data.qtyCanReturn
        }，不可大于可退数量：${data.qtyOrdered}`,
      );
    }
    // 检查撤销数量是否小于等于0
    if (data.qtyOrdered <= 0) {
      hasError = true;
      return message.error(`商品：${data.productName}，撤销数量不可小于0`);
    }
  });

  if (hasError) {
    return;
  }

  batchSetModalApi
    ?.setData({
      records,
      formData: {
        ...formValues,
      },
      callback() {
        chcGridApi.query(formValues);
      },
    })
    .open();
};

onMounted(() => {
  console.warn('urlParams', urlParams);
  // chcGridApi.query();
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <BatchSetModal />
    <ChcGrid>
      <template #qtyPlanedEdit="scope">
        <InputNumber v-model:value="scope.row.qtyOrdered" class="w-full" />
      </template>
      <template #toolbar-actions>
        <Button type="primary" class="mr-[0.5rem]" @click="handleBatchSet">
          撤销消耗
          <template #icon>
            <SvgSquareTickIcon />
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
