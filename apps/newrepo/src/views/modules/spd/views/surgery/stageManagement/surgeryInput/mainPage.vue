<script lang="ts" setup>
import { h, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

import EditModalComp from './editModal.vue';
// const returnDoc = urlParams.returnDoc || '';
// const rejectDoc = urlParams.rejectDoc || '';
// const orderType = urlParams.orderType || '';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);
// import PageSplitLazy from './modals/page-split-lazy.vue';

const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab的value值
const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
// const totalVal = ref(0);
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
      // showFooter: true,
      // footerMethod: () => {
      //   return [
      //     {
      //       index: '合计',
      //       unitPackQty: totalVal.value,
      //     },
      //   ];
      // },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        type: 'seq',
        // formatter(scope: any) {
        //   return scope.rowIndex + 1;
        // },
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
        field: 'uomName',
        title: '单位',
        minWidth: '75',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '数量',
        minWidth: '80',
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
        // format: '0.00##',
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
        field: 'vendorCode',
        title: '供应商编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: 100,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: 100,
      },
      {
        field: 'serNo',
        title: 'UDI',
        minWidth: 260,
      },
    ],
    showExportBtn: true,
    id: 'child',
    queryUrl: 'orderAction/queryLine.do',
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value.orderId)) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    afterFetchFn: (params) => {
      // totalVal.value = params.rows.reduce((val: number, item: any) => {
      //   return val + Number(item.unitPackQty);
      // }, 0);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid, chcGridApi] = useSpdGrid(
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
      border: true,
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
      rowStyle(scope: any) {
        if (scope.row.docStatus === 'NA') {
          return {
            color: 'red',
          };
        }
      },
    },
  },
  {
    id: 'parent',
    queryUrl: `orderAction/query.do?page=surgeryInput&orderType=PO&isSurgery=Y&isFree=${
      urlParams.isFree ? 'Y' : 'N'
    }`,
    // showCustomBtn: true,
    // showZoomBtn: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
        // fixed: 'left',
      },
      {
        field: 'orderNo',
        title: '跟台单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '跟台时间',
        minWidth: '100',
        sortable: true,
        // format: 'yyyy-mm-dd',
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
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        minWidth: '100',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
        sortable: true,
      },
      {
        field: 'surgeryTime',
        title: '手术时间',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'surgeryno',
        title: '手术编号',
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
        field: 'siteOrderId',
        title: '流水编码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'patientName',
        title: '患者姓名',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'patientCode',
        title: '患者编号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'patientVisitCode',
        title: '医保卡号',
        minWidth: '100',
        sortable: true,
      },
      // {
      //   field: 'doctorOrderNo',
      //   title: '医嘱号',
      //   minWidth: '100',
      //   sortable: true,
      //   hidden: true,
      // },
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
        field: 'processStatusName',
        title: '状态',
        minWidth: '100',
        formatter({ row }: any) {
          return `${row.processStatusName}-${row.docStatusName}`;
        },
      },
      {
        field: 'rejectReason',
        title: '退回原因',
        minWidth: '140',
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
        minWidth: '135',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: '200',
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
            dictUrl: '/baseHandleAction/warehouse.do',
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
        component: 'Input',
        fieldName: 'siteDocNo',
        label: '流水编码',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '患者姓名',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          childGridApi.query({ orderId: row.orderId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
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

const handleAdd = () => {
  props.goToDetailPage(
    {},
    {
      detailTitle: '新建',
      sourcePage: props.thisTab.value,
      type: 'add',
    },
  );
};
const handleEdit = (scope: any) => {
  // const record = chcGridApi.grid.getRadioRecord(true);
  // if (!record) {
  //   return message.error('请选择行！');
  // }
  props.goToDetailPage(scope.row, {
    detailTitle: '修改',
    sourcePage: props.thisTab.value,
    type: 'edit',
  });
};
const handleSearch = () => {
  childGridApi.query(parentTableParams.value);
};
const handleDel = (row: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      row.deleteLoading = true;
      requestFormClient
        .post('orderAction/delete.do', {
          orderId: row.orderId,
        })
        .then(() => {
          row.deleteLoading = false;
          message.success('删除成功');
          handleFormSubmit();
        })
        .catch(() => {
          row.deleteLoading = false;
        });
    },
  });
};
const handleSubmit = (row: any) => {
  Modal.confirm({
    // `跟台单号：${row.orderNo}\n仓库：${
    //   row.warehouseName
    // }\n总金额：${handlePriceToFixedTwo(row.totalAmt)}元\n是否确认提交？`
    title: '提示',
    content: [
      h('p', {}, `跟台单号：${row.orderNo}`),
      h('p', {}, `仓库：${row.warehouseName}`),
      h('p', {}, `总金额：${handlePriceToFixedTwo(row.totalAmt)}元`),
      h('p', {}, `是否确认提交？`),
    ],
    okText: '确认',
    cancelText: '取消',
    onOk() {
      row.submitLoading = true;
      requestFormClient
        .post('orderAction/commit.do', {
          orderId: row.orderId,
        })
        .then(() => {
          row.submitLoading = false;
          message.success('提交成功');
          handleFormSubmit();
        })
        .catch(() => {
          row.submitLoading = false;
        });
    },
  });
};
onMounted(() => {
  handleFormSubmit();
});
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: number, oldVal: number) => {
    const detailPageConfig = props.getDetailPageConfig();
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType === 'add'))
    ) {
      handleFormSubmit();
    }
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType === 'edit'))
    ) {
      handleSearch();
    }
  },
);
</script>

<template>
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
        <ChcGrid>
          <template #toolbar-actions>
            <Button type="primary" @click="handleAdd" class="mr-[0.5rem]">
              新建
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <!-- <Button type="primary" @click="handleEdit" class="mr-[0.5rem]">
              修改
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
            <Button
              type="primary"
              danger
              @click="handleApply"
              class="mr-[0.5rem]"
            >
              删除
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
            <Button type="primary" @click="handleApply" class="mr-[0.5rem]">
              提交
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button> -->
          </template>
          <template #action="scope">
            <!-- ghost -->
            <Button
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleEdit(scope)"
            >
              修改
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              danger
              :loading="scope.row.deleteLoading"
              @click="handleDel(scope.row)"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
            <Button
              type="primary"
              :loading="scope.row.submitLoading"
              @click="handleSubmit(scope.row)"
              class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            >
              提交
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <ChildGrid class="childGrid">
          <template #qtyProcessDefault="scope">
            <InputNumber
              class="w-full"
              :min="0"
              v-model:value="scope.row.qtyProcess"
            />
          </template>
          <template #toolbar-actions>
            <Input
              v-model:value="parentTableParams.productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="编码/拼音码/名称"
              @keyup.enter="handleSearch"
              allow-clear
            />
            <Button type="primary" @click="handleSearch" class="mr-[0.5rem]">
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

::v-deep(.childGrid .vxe-grid) {
  padding: 0.5rem;
}
</style>
