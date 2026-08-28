<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SvgSquareTickIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, InputNumber, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import BatchSetModalComp from './batchSetModal.vue';

const route = useRoute();

const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const warehouseLevel = urlParams?.warehouseLevel || '3';
const isNarcotic = undefined;
// const isNarcotic = urlParams.isNarcotic || undefined;
const extParams = ref<any>({
  isNarcotic,
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};

const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    chcGridApi.formApi?.getFieldComponentRef &&
    typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
    chcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};

const [ChcGrid, chcGridApi, { BatchSetModal, batchSetModalApi }] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: true,
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
        // formatter(scope: any) {
        //   return scope.rowIndex + 1;
        // },
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
        field: 'qtyAvailable',
        title: '可用库存',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      // {
      //   field: 'qtyPlaned',
      //   title: '发放数量2',
      //   minWidth: '120',
      //   editRender: {},
      //   slots: {
      //     edit: 'qtyPlanedEdit',
      //   },
      //   // edit: 'number',
      //   sortable: false,
      // },
      {
        field: 'qtyOrdered',
        title: '发放数量',
        minWidth: '90',
        align: 'right',
        editRender: {},
        slots: {
          edit: 'qtyPlanedEdit',
        },
        // edit: 'number',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'price',
        title: '价格',
        minWidth: '90',
        align: 'right',
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
              console.warn('afterFetch res:', res);

              return { ...res, rows: undefined, records: res?.rows || [] };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            // dictUrl: `/baseHandleAction/warehouse.do?level${warehouseLevel}=Y&readWrite=Y&isProxyWarehouse=N`,
            // showSearch: true,
            placeholder: '请选择仓库',
            // triggerFields: ['departmentId'],
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('trigger c', c);
            if (c) {
              const refInst = chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              console.warn('trigger refInst', refInst);
              console.warn('trigger refInst.params)', refInst.params);
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?level${warehouseLevel}=Y&readWrite=Y&isProxyWarehouse=N&regionId=${values?.departmentId || -1}&departmentId=${values.departmentId}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst.fetchApi();
                }
              }
              chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择是否计费',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isFee',
        label: '是否计费',
      },
    ],
    dataTableId:
      '/storageAction/queryStorageLot.do?storageStatus=S&showPrice=Y&haveAvailableQty=Y&showProductArea=Y',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'sanjianXiaohao',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      params.isScatter = 'Y';
      return {
        ...params,
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
        connectedComponent: BatchSetModalComp,
      },
    },
  },
);
const handleBatchSet = async () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  const formValues = await chcGridApi.formApi.getValues();
  if (!records || records.length === 0) {
    return message.error('请选择进行登记的数据！');
  }
  // 数据验证
  let hasError = false;
  records.forEach((data: any) => {
    // 检查发放数量是否存在
    if (!data.qtyOrdered && data.qtyOrdered !== 0) {
      hasError = true;
      return message.error(`药品：${data.productName}，发放数量不存在`);
    }
    // 检查发放数量是否大于可用数量
    if (data.qtyAvailable < data.qtyOrdered) {
      hasError = true;
      return message.error(
        `药品：${data.productName}，可用库存：${
          data.qtyAvailable
        }，不可大于可用数量：${data.qtyOrdered}`,
      );
    }
    // 检查发放数量是否小于等于0
    if (data.qtyOrdered <= 0) {
      hasError = true;
      return message.error(`药品：${data.productName}，发放数量不可小于0`);
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
        <InputNumber
          v-model:value="scope.row.qtyOrdered"
          class="w-full"
          :data-testid="`InputNumber_qtyPlaned_${scope.rowIndex}_sanjianXiaohao`"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleBatchSet"
          data-testid="button_consumptionRegister_sanjianXiaohao"
        >
          消耗登记
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
