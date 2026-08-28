<script setup lang="ts">
import { ref, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const { contentIsMaximize } = usePreferences();

const selectedAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
    },
  },
  {
    gridColumns: [
      // {
      //   title: "多选",
      //   type: "checkbox",
      //   width: 50,
      //   align: "center",
      // },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'presNo',
        minWidth: 120,
        sortable: true,
        title: '收费单号',
        // slots: { default: "orderPlanNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'presDate',
        minWidth: 170,
        sortable: true,
        title: '处方日期',
      },
      {
        field: 'patientCode',
        minWidth: 135,
        sortable: true,
        title: '就诊卡号',
      },
      {
        field: 'patientName',
        minWidth: 150,
        sortable: true,
        title: '患者姓名',
      },
      {
        field: 'sex',
        minWidth: 150,
        sortable: true,
        title: '患者性别',
      },
      {
        field: 'age',
        minWidth: 70,
        sortable: true,
        title: '年龄',
        align: 'right',
      },
      {
        field: 'bedNo',
        minWidth: 90,
        sortable: true,
        title: '床位',
      },
      {
        field: 'departmentName',
        minWidth: 90,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 120,
        sortable: true,
        title: '发放仓库',
      },
      {
        field: 'bpartnerName',
        minWidth: 90,
        sortable: true,
        title: '开立科室',
      },
      {
        field: 'doctorName',
        minWidth: 95,
        sortable: true,
        title: '开立医生', // 暂无
      },
      {
        field: 'diagnosis',
        minWidth: 100,
        sortable: true,
        title: '诊断',
      },

      {
        field: 'totalAmt',
        minWidth: 100,
        sortable: true,
        title: '处方金额',
      },

      {
        field: 'insuranceCodeNo',
        minWidth: 100,
        sortable: true,
        title: '医保卡号',
      },
      {
        field: 'dispenseFlagName',
        minWidth: 100,
        sortable: true,
        title: '发药状态',
      },
      {
        field: 'confirmName',
        minWidth: 100,
        sortable: true,
        title: '确认人',
      },
      {
        field: 'confirmTime',
        minWidth: 150,
        sortable: true,
        title: '确认时间',
      },
      {
        field: 'backName',
        minWidth: 100,
        sortable: true,
        title: '退回人',
      },
      {
        field: 'backTime',
        minWidth: 150,
        sortable: true,
        title: '退回时间',
      },
      {
        field: 'hisReturnConfirmTime',
        minWidth: 150,
        sortable: true,
        title: '退费时间',
      },
      {
        field: 'description',
        minWidth: 100,
        sortable: true,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
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
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择发货仓库',
            onChange() {
              // console.warn("warehouseId", val, option);
              // selectController.sign();
            },
            paginate: false,
            showChooseAll: '',
            immediate: true,
            // defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'warehouseId',
        label: '发货仓库',
      },

      {
        component: 'Input',
        fieldName: 'patientCard',
        label: '就诊卡号',
        componentProps: {
          placeholder: '请输入就诊卡号',
        },
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '姓名',
        componentProps: {
          placeholder: '请输入姓名',
        },
      },
      {
        component: 'Input',
        fieldName: 'presNo',
        label: '收费单号',
        componentProps: {
          placeholder: '请输入收费单号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000422',
            // showSearch: true,
            placeholder: '请选择发药状态',
            onChange() {
              // selectController.sign();
            },
            paginate: false,
            showChooseAll: '',
            immediate: true,
            // defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'dispenseFlag',
        label: '发药状态',
      },
      {
        component: 'Input',
        fieldName: 'presNo',
        label: '商品',
        componentProps: {
          placeholder: '请输入商品',
        },
      },
    ],
    dataTableId: '/prescriptionAction/query.do',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: { page: 'query', isAutoShipment: 'N' },
    getTableArrDataFn: (params) => {
      // console.warn("getTableArrDataFn:", params.totalPrice);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = total;
};

// const getData = async () => {
//   const formValues = await ChcGridApi.formApi.getValues();

//   try {
//     const params = {
//       ...formValues,
//       pageNum: 1,
//       pageSize: 25,
//       limit: 25,
//       start: 0,
//     };
//     await getDataApi({ ...params })
//       .then(async (res) => {
//         if (res && res.success && res.rows.length > 0) {
//           // let backDta=

//           const backData = {
//             ...res.rows,
//             records: res.rows,
//           };
//           //  ChcGridApi.query({  ...params });
//           ChcGridApi.grid.loadData(res.rows);
//         } else {
//           message.error(res.msg || '查询失败');
//         }
//       })
//       .catch((error) => {
//         ChcGridApi.formApi.setValues({
//           packageNo: '',
//         });
//         console.error('失败', error);
//       });
//   } catch {
//     ChcGridApi.formApi.setValues({
//       packageNo: '',
//     });
//     message.error('查询失败');
//   }
//   // 获取当前表格数据
// };

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
const handleCancel = () => {};
</script>
<template>
  <div
    :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 152px)',
      overflowY: 'hidden',
    }"
  >
    <ChcGrid>
      <template #toolbar-actions>
        <Button type="primary" @click="handleCancel" class="mr-[0.5rem]">
          打印拣货单
        </Button>
        <Button type="primary" @click="handleCancel" class="mr-[0.5rem]">
          打印退药单
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
