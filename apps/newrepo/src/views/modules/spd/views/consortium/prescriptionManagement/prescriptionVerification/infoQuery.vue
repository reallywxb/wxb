<script setup lang="ts">
import { toRaw, watch } from 'vue';

import { SvgCloseIcon, UploadCloudIcon, viewActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { savePrescriptionToPurchase } from './api';
import closeModalUI from './modals/closeModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const [closeModal, closeModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: closeModalUI,
  draggable: true,
});

const detailConfig = defineModel<DetailInfo | undefined>('detailConfig');

const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['beginDate', 'endDate'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'asnId',
        minWidth: 120,
        sortable: true,
        title: '外延订单号',
        visible: false,
      },
      {
        field: 'presNo',
        minWidth: 120,
        sortable: true,
        title: '处方号',
      },

      {
        field: 'orgName',
        minWidth: 150,
        sortable: true,
        title: '开方医院',
      },
      {
        field: 'extOrgName',
        minWidth: 150,
        sortable: true,
        title: '外延医院',
      },
      {
        field: 'extWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '外延药房',
      },
      {
        field: 'patientName',
        minWidth: 120,
        sortable: true,
        title: '就诊人',
      },
      {
        field: 'sex',
        minWidth: 120,
        sortable: true,
        title: '性别',
      },
      {
        field: 'age',
        minWidth: 120,
        sortable: true,
        title: '年龄',
      },
      {
        field: 'totalAmt',
        minWidth: 120,
        sortable: true,
        title: '处方金额',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
      },
      {
        field: 'presTypeName',
        title: '处方类型',
        width: '100',
      },
      {
        field: 'presDate',
        minWidth: 160,
        sortable: true,
        title: '处方时间',
      },
      {
        field: 'preStatus',
        title: '处方状态',
        width: '100',
        formatter: ({ cellValue }: { cellValue: string }) => {
          const preStatusMap = {
            '-1': '关闭',
            '0': '待指示',
            '1': '已发送',
            '2': '待取',
            '3': '已取',
            '4': '完成',
          };
          return (
            preStatusMap[cellValue as keyof typeof preStatusMap] || cellValue
          );
        },
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 200,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
        // defaultValue: [
        //   dayjs(dayjs().format('YYYY-MM-DD'))
        //     .subtract(7, 'day')
        //     .format('YYYY-MM-DD'),
        // ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'extHospitalId',
        label: '外延医院',
        componentProps: () => {
          return {
            dictUrl: '/prescriptionAction/queryAllHospital',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择外延医院',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // 处理返回数据
              const newRecords =
                res.data.map((item: any) => ({
                  ...item,
                  id: item.code,
                })) || [];
              return { ...res, rows: undefined, records: newRecords };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'presNo',
        label: '处方号',
        componentProps: {
          placeholder: '请输入处方号',
        },
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '就诊人',
        componentProps: {
          placeholder: '请输入就诊人',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/prescriptionAction/queryAllHospital',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择开方医院',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              const rows = res.data.map((item: any) => ({
                ...item,
                id: item.code,
              }));
              return { ...res, rows: undefined, records: rows || [] };
            },
          };
        },
        fieldName: 'hospitalId',
        label: '开方医院',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // dictUrl: '/baseHandleAction/refList.do?id=1000346',
            // apiType: 'post',
            // requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择处方状态',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            immediate: true,
            options: [
              { value: '0', label: '待指示' },
              { value: '1', label: '已发送' },
              { value: '-1', label: '已关闭' },
            ],
          };
        },
        fieldName: 'preStatus',
        label: '处方状态',
      },
    ],
    dataTableId: '/prescriptionAction/query',
    id: 'listTable',
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params) => {
      const rows = params.rows;
      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
  },
);

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.reload({ ...res });
  });
};

// 编辑
const handleEdit = (row: any, action: 'edit' | 'view') => {
  currentHandleRow.value = row;
  currentTab.value = headerTabs.value.length - 1;

  detailConfig.value = {
    detailTitle: '处方详情',
    sourcePage: props.thisTab.value,
    type: action,
  };
  // currentTab.value = 1;
};

// 提交
const handleBuy = (row: any) => {
  const params = {
    prescriptionId: row.prescriptionId,
    preStatus: '1', // 已发送
    lineList: [{ prescriptionLineId: '', vendorId: '' }],
  };
  console.warn('入参 params', params);
  Modal.confirm({
    title: '请确定是否发送订单至处方流转平台？',
    okText: '确认',
    okType: 'primary',
    onOk: () => {
      savePrescriptionToPurchase(params).then((res: any) => {
        if (res.success) {
          message.success('提交成功');
          handleQuery();
        } else {
          message.error(res.msg || '提交失败');
        }
      });
    },
  });
};

// 关闭
const handleCancel = (scope: any) => {
  closeModalApi
    .setData({
      prescriptionId: scope.row.prescriptionId,
      lineList: [{ prescriptionLineId: '', vendorId: '' }], // 这个空值会被拦截器中过滤掉
    })
    .open();
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
    <closeModal @close="handleQuery" />
    <ChcGrid>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope.row, 'view')"
          :data-testid="`button_view_order_${scope.rowIndex}_infoQuery`"
        >
          编辑
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
        <!-- 只有待指示状态才能提交 -->
        <Button
          ghost
          :disabled="!['0', 0].includes(scope.row.preStatus)"
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleBuy(scope.row)"
          :data-testid="`button_to_buy_${scope.rowIndex}_infoQuery`"
        >
          提交
          <template #icon>
            <UploadCloudIcon />
          </template>
        </Button>
        <Button
          danger
          :disabled="!['0', 0].includes(scope.row.preStatus)"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCancel(scope)"
          :data-testid="`button_close_order_${scope.rowIndex}_infoQuery`"
        >
          关闭
          <template #icon>
            <SvgCloseIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
