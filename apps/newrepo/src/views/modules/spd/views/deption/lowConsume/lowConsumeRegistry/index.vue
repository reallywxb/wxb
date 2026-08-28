<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { UploadActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import qs from 'qs';

import { importModalDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { dataCommit, getDataApi, getDept } from './api';
import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const route = useRoute();
const urlParams = route.meta?.urlParams || {};

// const selectedAmount = ref(0);
const totalData = ref(0);

const handleFormSubmit = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.userCode) {
    message.error('请输入员工号');
    return;
  }
  if (!formValues.packageNo) {
    message.error('请输入包装号');
    return;
  }
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query(formValues);
};

const [ChcGrid, ChcGridApi, { ImportModal, importModalApi }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      submitButtonOptions: { show: false },
      resetButtonOptions: { show: false },
      // collapsed:false
      showCollapseButton: false,
      // submitOnEnter: false, // 按下回车健时提交表单
      handleSubmit: handleFormSubmit,
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
        sortable: true,
        title: '包装号',
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
        minWidth: 150,
        sortable: true,
        title: '规格',
      },
      {
        field: 'manufacturer',
        minWidth: 70,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'uomName',
        minWidth: 90,
        sortable: true,
        title: '单位',
        align: 'right',
      },
      {
        field: 'qty',
        minWidth: 120,
        sortable: true,
        title: '数量',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 90,
        sortable: true,
        title: '批号',
        align: 'right',
      },
      {
        field: 'guaranteeDate',
        minWidth: 95,
        sortable: true,
        title: '效期',
      },
      {
        field: 'locatorName',
        minWidth: 95,
        sortable: true,
        title: '货位',
      },
      {
        field: 'markCode',
        minWidth: 95,
        sortable: true,
        title: '中标编码',
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: 'baseHandleAction/warehouse.do?level1=N&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择发货仓库',
            onChange() {
              // console.log("tcj", val, option);
              // selectController.sign();
            },
            paginate: false,
            showChooseAll: '',
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
        label: '发货仓库',
      },
      {
        component: 'Input',
        fieldName: 'userCode',
        label: '员工号',
        componentProps: {
          placeholder: '请先输入员工号',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: () => {
          return {
            placeholder: '请先输入包装号',
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
    dataTableId: '/packageAction/query.do',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: { isAccurate: 'Y' },
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
      await getDataApi(
        qs.stringify(
          { ...formValues, start: 0, isAccurate: 'Y' },
          { encode: false },
        ),
      )
        .then(async (res) => {
          if (res && res.success && res.rows[0]?.packageId) {
            const a = await handleData({
              ...res,
              records: res.rows,
            });
            ChcGridApi.grid.reloadData(a.rows || []);
            totalData.value = a.rows.length || 0;
          } else {
            message.error(res.msg || '查询失败');
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
    return message.warning('请先输入包装号');
  }
};

const handleDept = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.userCode) {
    message.error('请先输入员工号');
    return;
  }
  try {
    // const params = new URLSearchParams();
    // params.append("orderPlanId", JSON.stringify(orderPlanIds));

    const params = {
      userCode: formValues.userCode || '',
    };
    await getDept(params)
      .then((res) => {
        if (res && res.success && res.rows[0]?.UserCode) {
          ChcGridApi.formApi.setValues({
            userCode: res.rows[0].UserCode,
          });
        } else {
          ChcGridApi.formApi.setValues({
            userCode: '',
          });
          message.error(res.msg || '查询失败');
        }
      })
      .catch((error) => {
        ChcGridApi.formApi.setValues({
          userCode: '',
        });
        console.error('失败', error);
      });
  } catch {
    ChcGridApi.formApi.setValues({
      userCode: '',
    });
    message.error('查询失败');
  }
  // const formValues = await ChcGridApi.formApi.getValues();
  // ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  // ChcGridApi.reload(formValues);
};
// 提交通过处理函数
const handleApprove = async () => {
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  const formValues = await ChcGridApi.formApi.getValues();

  if (!formValues.userCode) {
    message.warning('请先输入员工号');
    return;
  }
  // if (!formValues.packageNo) {
  //   message.warning('请先输入包装号');
  //   return;
  // }
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
    content: '确认发货？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        // const params = new URLSearchParams();
        // params.append("orderPlanId", JSON.stringify(orderPlanIds));
        const shipmentPackage = [];
        for (const currentDatum of currentData) {
          shipmentPackage.push(currentDatum.packageNo);
        }
        const params = {
          packageNo: JSON.stringify(shipmentPackage),
          userCode: formValues.userCode || '',
          warehouseId: formValues.warehouseId,
          shipToType: urlParams?.shipToType || '',
        };
        await dataCommit(qs.stringify(params))
          .then((res) => {
            if (res && res.success) {
              console.warn('committ', res);
              // 发货成功后清空表格数据
              ChcGridApi.grid.reloadData([]);
              // 清空包装号输入框
              ChcGridApi.formApi.setValues({
                packageNo: '',
              });
              message.success('提交成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('提交失败');
      }
    },
  });
  // const formValues = await ChcGridApi.formApi.getValues();
  // ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  // ChcGridApi.reload(formValues);
};
const handleImport = () => {
  importModalApi?.open();
};

// 处理导入成功事件
const handleImportSuccess = async (importedData: any[]) => {
  // 获取当前表格数据
  const existingTableData = ChcGridApi.grid.getTableData().tableData || [];
  // 检查重复数据
  const duplicatePackages: string[] = [];
  const validImportData: any[] = [];
  importedData.forEach((importItem) => {
    const isDuplicate = existingTableData.some(
      (existingItem) => existingItem.packageNo === importItem.packageNo,
    );
    if (isDuplicate) {
      duplicatePackages.push(importItem.packageNo);
    } else {
      validImportData.push(importItem);
    }
  });
  // 如果存在重复数据，提示用户
  if (duplicatePackages.length > 0) {
    message.warning(`存在重复数据，请检查：${duplicatePackages.join(', ')}`);
  }
  // 只添加非重复的数据
  if (validImportData.length > 0) {
    const newTableData = [...validImportData, ...existingTableData];
    ChcGridApi.grid.reloadData(newTableData);
    totalData.value = newTableData.length;
    message.success(`成功导入 ${validImportData.length} 条数据`);
  } else if (duplicatePackages.length > 0) {
    message.error('所有导入数据均为重复数据，未添加任何新数据');
  }
};
// 提交通过处理函数
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
    <ImportModal @import-success="handleImportSuccess" />
    <ChcGrid>
      <template #toolbar-tools>
        <span style="margin-left: 20px">已扫包数：{{ totalData }}</span>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_confirm_shipment"
        >
          确认发货
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
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import_package"
        >
          导入包装
          <template #icon>
            <UploadActionIcon />
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
