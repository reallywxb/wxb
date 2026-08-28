<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { importModalDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { exhaustItDo, getDataApi, useItDo } from './api';
// import { exhaustItDo, getDataApi, getDept } from './api';
import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const totalData = ref(0);

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      submitButtonOptions: { show: false },
      resetButtonOptions: { show: false },
      // collapsed:false
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      pagerConfig: {
        enabled: false,
      },
      sortConfig: {
        multiple: false,
      },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.isFinished === 'Y') {
          return { color: 'red' };
        }
        return {};
      },
    }),
  },
  {
    gridColumns: [
      // { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'packageNo',
        minWidth: 170,
        title: '条码号',
        // slots: { default: "packageNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'productCode',
        minWidth: 120,
        title: '药品编码',
        // slots: { default: "orderPlanNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'productName',
        minWidth: 100,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 100,
        title: '规格',
      },
      {
        field: 'uomName',
        minWidth: 70,
        title: '单位',
      },
      {
        field: 'openTime',
        minWidth: 100,
        title: '开封时间',
      },
      {
        field: 'reUseGuaranteedate',
        minWidth: 90,
        title: '效期',
      },
      {
        field: 'useTimes',
        minWidth: 90,
        title: '已使用次数',
        align: 'right',
      },
      {
        field: 'isFinished',
        minWidth: 90,
        title: '是否已用完',
        formatter: (scope) => {
          return scope.row.isFinished === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'manufacturer',
        minWidth: 120,
        title: '厂家',
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: 'baseHandleAction/warehouse.do?readWrite=Y',
            // showSearch: true,
            placeholder: '请选择仓库',
            onChange() {
              // console.log("tcj", val, option);
              // selectController.sign();
            },
            paginate: false,
            // showChooseAll: '',
            immediate: true,
            // defaultValue: '',
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: 'baseHandleAction/customer.do?isDepartment=Y',
            // showSearch: true,
            placeholder: '请选择使用科室',
            onChange() {
              // selectController.sign();
            },
            paginate: false,
            // showChooseAll: "",
            immediate: true,
            // defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // console.log('tcj',res)
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '使用科室',
      },
      {
        component: 'Input',
        fieldName: 'userCode',
        label: '员工号',
        componentProps: {
          placeholder: '请先输入员工号',
          onPressEnter: async (e) => {
            // 阻止表单冒泡
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '条码',
        componentProps: () => {
          return {
            placeholder: '请先输入条码',
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
        component: 'Switch',
        componentProps: {
          disabled: false,
          allowClear: true,
          options: [
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
              value: 'false',
            },
          ],
          placeholder: '请选择',
          style: {
            width: '40px',
          },
        },
        defaultValue: false,
        fieldName: 'isActive',
        label: '反扫',
      },
    ],
    dataTableId: '/reuseAction/queryPackage.do?isAccurate=Y',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    // tableSearchExtraParams: { isAccurate: 'Y' },
    getTableArrDataFn: async (params) => {
      const a = await handleData({
        ...params,
        records: params.rows,
      });
      // let backDta=
      ChcGridApi.grid.reloadData(a.rows || []);
      totalData.value = a.rows.length || 0;
      return a;
    },
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
    },
  },
);
const handleData = async (data) => {
  const formValues = await ChcGridApi.formApi.getValues();
  const currentData = structuredClone(data.rows);
  const backData = structuredClone(data);

  // 获取当前表格数据
  const existingTableData = ChcGridApi.grid.getTableData().tableData || [];

  if (formValues.isActive) {
    // 反选模式：删除对应包装号的行
    const filteredData = existingTableData.filter(
      (row) => row.packageNo !== formValues.packageNo,
    );
    if (filteredData.length === existingTableData.length) {
      // message.warn("未找到对应的包装号记录");
      return { ...backData, rows: existingTableData };
    }
    ChcGridApi.formApi.setValues({
      packageNo: '',
    });
    return {
      ...backData,
      rows: [...filteredData],
    };
  } else {
    // 添加新行模式：将查询结果的第一条数据插入到表格最上方
    if (currentData && currentData.length > 0) {
      const newRow = currentData[0]; // 取查询结果的第一条数据

      // 检查是否已存在相同包装号
      const existingRow = existingTableData.find(
        (row) => row.packageNo === newRow.packageNo,
      );
      if (existingRow) {
        // message.warn("该包装号已存在");
        ChcGridApi.formApi.setValues({
          packageNo: '',
        });
        return { ...backData, rows: existingTableData };
      }

      // 将新数据插入到表格最上方
      const newData = [newRow, ...existingTableData];
      ChcGridApi.formApi.setValues({
        packageNo: '',
      });
      return {
        ...backData,
        rows: newData,
      };
    }

    // 如果没有查询结果，返回现有数据
    return { ...backData, rows: existingTableData };
  }
};
const getData = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (formValues.packageNo) {
    // 反扫模式：直接从当前表格删除数据，不调用接口
    if (formValues.isActive) {
      const a = await handleData({
        rows: [], // 反扫模式不需要接口数据
        success: true,
      });
      ChcGridApi.grid.reloadData(a.rows || []);
      totalData.value = a.rows.length || 0;
      return;
    }

    // 正常添加模式：调用接口查询数据
    try {
      await getDataApi({
        ...formValues,
      })
        .then(async (res) => {
          if (res && res.success && res.rows[0]?.packageId) {
            const a = await handleData({
              ...res,
              records: res.rows,
            });
            ChcGridApi.grid.reloadData(a.rows || []);
            totalData.value = a.rows.length || 0;
          } else {
            message.error(res.msg || '无此条码');
          }
        })
        .catch((error) => {
          ChcGridApi.formApi.setValues({
            packageNo: '',
          });
          console.error('失败', error);
        });
    } catch {
      ChcGridApi.formApi.setValues({
        packageNo: '',
      });
      message.error('查询失败');
    }
  } else {
    return message.warning('请先输入条码');
  }
};

// const handleDept = async () => {
//   const formValues = await ChcGridApi.formApi.getValues();

//   try {
//     const params = {
//       userCode: formValues.userCode || '',
//     };
//     await getDept(params)
//       .then((res) => {
//         if (res && res.success && res.rows[0]?.UserCode) {
//           ChcGridApi.formApi.setValues({
//             userCode: res.rows[0].UserCode,
//           });
//         } else {
//           ChcGridApi.formApi.setValues({
//             userCode: '',
//           });
//           message.error(res.msg || '查询失败');
//         }
//       })
//       .catch((error) => {
//         ChcGridApi.formApi.setValues({
//           userCode: '',
//         });
//         console.error('失败', error);
//       });
//   } catch {
//     ChcGridApi.formApi.setValues({
//       userCode: '',
//     });
//     message.error('查询失败');
//   }
// };
// 已用完
const handleApprove = async () => {
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  // const formValues = await ChcGridApi.formApi.getValues();

  // if (!formValues.userCode) {
  //   message.warning('请先输入员工号');
  //   return;
  // }
  // if (!formValues.warehouseId) {
  //   message.warning('请先选择发货仓库');
  //   return;
  // }
  if (currentData.length === 0) {
    message.warning('请先确认需要提交的数据');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '是否确认已用完？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const shipmentPackage = [];
        for (const currentDatum of currentData) {
          shipmentPackage.push(currentDatum.packageId);
        }
        const params = {
          packageIds: JSON.stringify(shipmentPackage),
          // userCode: formValues.userCode || '',
          // warehouseId: formValues.warehouseId,
        };
        await exhaustItDo(params)
          .then((res) => {
            if (res && res.success) {
              // 发货成功后清空表格数据
              ChcGridApi.grid.reloadData([]);
              // 清空包装号输入框
              ChcGridApi.formApi.setValues({
                packageNo: '',
              });
              message.success('成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('失败');
      }
    },
  });
};
// 确认使用
const handleConfirm = async () => {
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  const formValues = await ChcGridApi.formApi.getValues();

  if (!formValues.userCode) {
    message.warning('请先输入员工号');
    return;
  }
  if (!formValues.warehouseId) {
    message.warning('请先选择发货仓库');
    return;
  }
  if (currentData.length === 0) {
    message.warning('请先确认需要提交的数据');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认使用吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const shipmentPackage = [];
        for (const currentDatum of currentData) {
          shipmentPackage.push(currentDatum.packageId);
        }
        const params = {
          packageIds: JSON.stringify(shipmentPackage),
          userCode: formValues.userCode || '',
          warehouseId: formValues.warehouseId,
          isCosume: 'Y',
        };
        await useItDo(params)
          .then((res) => {
            if (res && res.success) {
              // 发货成功后清空表格数据
              ChcGridApi.grid.reloadData([]);
              // 清空包装号输入框
              ChcGridApi.formApi.setValues({
                packageNo: '',
              });
              message.success('成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('失败');
      }
    },
  });
};

// 处理函数
const handleCancel = async () => {
  Modal.confirm({
    title: '提示',
    content: '确认清除已扫包装码吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      ChcGridApi.formApi.setValues({
        isActive: false,
        packageNo: '',
        userCode: '',
      });
      ChcGridApi.grid.reloadData([]);
      totalData.value = 0;
      message.success('已清除所有数据');
    },
  });
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-tools>
        <span style="margin-left: 20px">已扫：{{ totalData }}</span>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleConfirm"
          class="mr-[0.5rem]"
          data-testid="button_confirmuse"
        >
          确认使用
        </Button>
        <Button
          type="primary"
          @click="handleCancel"
          class="mr-[0.5rem]"
          data-testid="button_rescan"
        >
          重扫
        </Button>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_used"
        >
          已用完
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
