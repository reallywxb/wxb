<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
// import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgBackIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

import RejectModalComp from './rejectModal.vue';

// const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
// const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const returnDoc = urlParams.returnDoc || '';
// const rejectDoc = urlParams.rejectDoc || '';
// const orderType = urlParams.orderType || '';
const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
  vendorId: undefined,
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
        title: '序号',
        width: 50,
        type: 'seq',
        align: 'center',
        // formatter(scope: any) {
        //   return scope.rowIndex + 1;
        // },
      },
      //   {
      // 	"type": "color",
      // 	"hidden":true,
      // 	"render":function(item){
      // 	}
      // },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'markCode',
        title: '中标编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '250',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '75',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '数量',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceActual',
        title: '采购价',
        minWidth: '90',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceActual);
        },
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '金额',
        minWidth: '100',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
        // format: '0.00',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'serNo',
        title: 'UDI',
        minWidth: '260',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    showExportBtn: true,
    id: 'child',
    queryUrl: 'orderAction/queryLine.do',
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.orderId)) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
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
const [ChcGrid, chcGridApi, { RejectModal, rejectModalApi }] = useSpdGrid(
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
    queryUrl: `orderAction/query.do?page=workflowApprove&isSurgery=Y&orderType=PO`,
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
        title: '跟台单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '跟台时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'applyWarehouseName',
        title: '执行仓库',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'treatmentApplyBpartnerName',
        title: '执行科室',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'treatmentBpatnerName',
        title: '开单科室',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'wfNodeName',
        title: '审批节点',
        minWidth: '120',
      },
      {
        field: 'totalAmt',
        title: '金额',
        minWidth: '90',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
        // format: '0.00',
        sortable: true,
      },
      {
        field: 'surgeryTime',
        title: '手术时间',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'doctorName',
        title: '主刀医师',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'patientName',
        title: '患者姓名',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'patientVisitCode',
        title: '患者编号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'doctorOrderNo',
        title: '医嘱号',
        minWidth: '100',
        sortable: true,
        visible: false,
        // hidden: true,
      },
      {
        field: 'patientPhoneNo',
        title: '联系方式',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'patientAddress',
        title: '联系地址',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bedNo',
        title: '床位',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'diagnosis',
        title: '诊断',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'commitUserName',
        title: '提交人',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'checkUser1',
        title: '验收人',
        minWidth: '110',
        sortable: true,
        visible: false,
      },
      {
        field: 'checkUser2',
        title: '第二验收人',
        minWidth: '110',
        sortable: true,
        visible: false,
      },
      {
        field: 'commitTime',
        title: '提交时间',
        minWidth: '160',
        sortable: true,
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
        label: '跟台时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            .subtract(1, 'week')
            // .subtract(1, 'day')
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
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择采购仓库',
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
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
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
        defaultValue: '',
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '跟台单号',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
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
        defaultValue: '',
        fieldName: 'bpartnerId',
        label: '供应商',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          childGridApi.query({ orderId: row.orderId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
          // childGridApi.query({ orderId: row.orderId });
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
      'RejectModal-rejectModalApi': {
        // 连接抽离的组件
        connectedComponent: RejectModalComp,
      },
    },
  },
);

const handleSearch = () => {
  childGridApi.query({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
    vendorId: parentTableParams.value.vendorId,
  });
};
const handlePass = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择一条记录！');
  }
  const paramLine = [record.wfActivityId];
  Modal.confirm({
    title: '提示',
    content: '确认批准吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('orderAction/approveWorkflow.do', {
          wfActivityId: JSON.stringify(paramLine),
        })
        .then(() => {
          message.success(`成功批准${paramLine.length}个申请！`);
          handleFormSubmit();
        });
    },
    onCancel() {},
  });
};
const handleReject = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择一条记录！');
  }
  rejectModalApi
    ?.setData({
      ...record,
      callback() {
        handleFormSubmit();
      },
    })
    .open();
  // const paramLine = [record.wfActivityId];
  // Modal.confirm({
  //   title: '打印提示',
  //   content: '确认补打出库单吗？',
  //   okText: '确认',
  //   cancelText: '取消',
  //   onOk() {
  //     // 执行打印操作
  //     //  App.print(App.getContextPath() + 'inoutAction/printOutputDoc.do?id=' + paramLine);
  //   },
  //   onCancel() {},
  // });
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
          <RejectModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePass"
                data-testid="button_handlePass"
              >
                批准
                <template #icon>
                  <SvgSquareTickIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                danger
                @click="handleReject"
                data-testid="button_handleReject"
              >
                退回
                <template #icon>
                  <SvgBackIcon />
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
                :data-testid="`inputNumber_qtyProcess_${scope.rowIndex}`"
              />
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productNameSearch"
              />
              <ChcSelect
                v-model="parentTableParams.vendorId"
                :immediate="false"
                class="mr-[0.5rem] w-[240px]"
                dict-url="/baseHandleAction/vendor.do"
                :paginate="false"
                placeholder="请选择供应商"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :allow-clear="true"
                data-testid="select_vendorId"
              />
              <Button
                type="primary"
                @click="handleSearch"
                class="mr-[0.5rem]"
                data-testid="button_handleChildSearch"
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
