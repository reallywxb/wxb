<script setup lang="ts">
import { nextTick, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { getDept } from './api';
import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import { commonFormOptions, viewFormOptions } from './options';

const isFirstLoaded = ref(false);
class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
const selectController = new LazySelect(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query(res);
    isFirstLoaded.value = true;
  });
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // pagerConfig: {
      //   enabled: false,
      // },
      // sortConfig: {
      //   multiple: false,
      // },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.isExpired === 'Y') {
          return { color: 'red' };
        }
        return {};
      },
    }),

    // 添加表格事件监听
    // gridEvents: {
    //   // 单个复选框变化事件
    //   checkboxChange: ({ records }: { records: any[] }) => {
    //     calculateSelectedAmount(records);
    //   },
    //   // 全选/全不选事件
    //   checkboxAll: ({ records }: { records: any[] }) => {
    //     calculateSelectedAmount(records);
    //   },
    // },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'packageNo',
        minWidth: 170,
        sortable: true,
        title: '条形码',
        // slots: { default: "packageNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编号',
      },
      {
        field: 'productName',
        minWidth: 135,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 70,
        sortable: true,
        title: '规格',
      },
      {
        field: 'uomName',
        minWidth: 70,
        sortable: true,
        title: '单位',
      },
      {
        field: 'openTime',
        minWidth: 100,
        sortable: true,
        title: '开封时间',
      },
      {
        field: 'reUseGuaranteedate',
        minWidth: 90,
        sortable: true,
        title: '效期',
        align: 'right',
      },
      {
        field: 'useTimes',
        minWidth: 120,
        sortable: true,
        title: '已使用次数',
        align: 'right',
      },
      {
        field: 'isFinished',
        minWidth: 100,
        sortable: true,
        title: '是否已用完',
        align: 'right',
        formatter: (scope) => {
          return scope.row.isFinished === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'manufacturer',
        minWidth: 100,
        sortable: true,
        title: '厂家',
        align: 'right',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '有效区间',
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
            dictUrl: 'baseHandleAction/warehouse.do?readWrite=Y',
            // showSearch: true,
            placeholder: '请选择仓库',
            onChange() {
              selectController.sign();
            },
            paginate: false,
            // showChooseAll: "",
            immediate: true,
            defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // console.log('tcj',res)
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'warehouseId',
        label: '仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
            onPressEnter: (e) => {
              // 在这里处理回车事件

              e.preventDefault && e.preventDefault();
              e.stopPropagation && e.stopPropagation();
              getData();
            },
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '条形码',
        componentProps: {
          placeholder: '请输入条形码',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            handleDept();
          },
        },
      },
    ],
    dataTableId: '/reuseAction/queryPackage.do',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: { page: 'reuseQuery' },
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// const handleData = async (data) => {
//   const formValues = await ChcGridApi.formApi.getValues();
//   const currentData = structuredClone(data.rows);
//   const backData = structuredClone(data);
//   if (formValues.isActive) {
//     // 反选模式：删除对应追溯码的行
//     const filteredData = currentData.filter(
//       (row) => row.packageNo !== formValues.packageNo,
//     );
//     if (filteredData.length === currentData.length) {
//       // message.warn("未找到对应的追溯码记录");
//       return;
//     }
//     ChcGridApi.formApi.setValues({
//       packageNo: '',
//     });
//     return {
//       ...backData,
//       rows: [...filteredData],
//       // records: [...filteredData],
//     };
//   } else {
//     // 添加新行检查是否已存在相同追溯码
//     const existingRow = currentData.find(
//       (row) => row.packageNo === formValues.packageNo,
//     );
//     if (existingRow) {
//       // message.warn("该追溯码已存在");
//       //  ChcGridApi.grid.reloadData(data);
//       return data;
//     }
//     // 重新加载表格数据&&清空输入框
//     // ChcGridApi.grid.reloadData(data);
//     ChcGridApi.formApi.setValues({
//       packageNo: '',
//     });
//     return {
//       ...backData,
//       rows: [...backData.rows, ...currentData],
//       // records: [...backData.rows, ...currentData],
//     };
//     // message.success("追溯码添加成功");
//   }
// };
const getData = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (formValues.packageNo) {
    ChcGridApi.formApi.submitForm();
    // 获取当前表格数据
  }
  //  else if (!formValues.productName) {
  //   return message.warning("请先输入员工号");
  // }
  else {
    return message.warning('请先输入药品');
  }
};

const handleDept = async () => {
  const formValues = await ChcGridApi.formApi.getValues();

  try {
    // const params = new URLSearchParams();
    // params.append("orderPlanId", JSON.stringify(orderPlanIds));

    const params = {
      userCode: formValues.productName || '',
    };
    await getDept(params)
      .then((res) => {
        if (res && res.success && res.rows[0]?.UserCode) {
          ChcGridApi.formApi.setValues({
            productName: res.rows[0].UserCode,
          });
          ChcGridApi.query(formValues);
        } else {
          ChcGridApi.formApi.setValues({
            productName: '',
          });
          // message.error(res.msg || '查询条形码失败');
        }
      })
      .catch((error) => {
        ChcGridApi.formApi.setValues({
          productName: '',
        });
        console.error('查询条形码失败', error);
      });
  } catch {
    ChcGridApi.formApi.setValues({
      productName: '',
    });
    // message.error('查询条形码失败');
  }
  // const formValues = await ChcGridApi.formApi.getValues();
  // ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  // ChcGridApi.reload(formValues);
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid />
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
