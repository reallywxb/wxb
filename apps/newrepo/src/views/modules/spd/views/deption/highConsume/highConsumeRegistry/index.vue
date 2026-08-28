<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import qs from 'qs';

import { importModalDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { dataCommit, getDataApi } from './api';
import CheckUserModalComp from './checkUserModal.vue';
import { formDefaultOptions } from './formDefaultOptions';
import { gridDefaultOptions } from './gridDefaultOptions';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';
// const selectedAmount = ref(0);
const totalData = ref(0);

const [
  ChcGrid,
  ChcGridApi,
  { ImportModal, importModalApi, CheckUserModal, checkUserModalApi },
] = useSpdGrid(
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
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
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
        field: 'qty',
        minWidth: 120,
        sortable: true,
        title: '数量',
        align: 'right',
      },
      {
        field: 'uomName',
        minWidth: 90,
        sortable: true,
        title: '单位',
        align: 'right',
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
            placeholder: '请选择发货仓库',
            onChange() {
              // console.log("tcj", val, option);
              // selectController.sign();
            },
            paginate: false,
            showChooseAll: false,
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/warehouseAction/warehouseUserList.do?readWrite=Y',
            // showSearch: true,
            placeholder: '请选择发货人',
            triggerFields: ['warehouseId'],
            showChooseAll: false,
            paginate: false,
            onChange(val: any, option: any) {
              console.warn(val, option);
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('userId') &&
              ChcGridApi.formApi?.getFieldComponentRef('userId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'userId',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
              };
              ChcGridApi.formApi?.getFieldComponentRef('userId')?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('userId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
        fieldName: 'userId',
        // formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '发货人',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl:
              'baseHandleAction/listDepBpartner.do?accessAll=Y&departmentType=1',
            // showSearch: true,
            placeholder: '请选择开单科室',
            onChange() {
              // console.log("tcj", val, option);
              // selectController.sign();
            },
            paginate: false,
            showChooseAll: false,
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
        label: '开单科室',
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '患者姓名',
        componentProps: {
          placeholder: '请输入患者姓名',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: 'baseHandleAction/refList.do?id=1000431',
            // showSearch: true,
            placeholder: '请选择患者性别',
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
        fieldName: 'patientSex',
        rules: 'required',
        label: '患者性别',
      },
      // {
      //   component: 'Input',
      //   fieldName: 'userCode',
      //   label: '员工号',
      //   componentProps: {
      //     placeholder: '请先输入员工号',
      //     onPressEnter: async (e) => {
      //       // 在这里处理回车事件
      //       e.preventDefault && e.preventDefault();
      //       e.stopPropagation && e.stopPropagation();
      //       // handleDept();
      //     },
      //   },
      // },
      {
        component: 'Input',
        fieldName: 'patientAge',
        label: '患者年龄',
        rules: 'required',
        componentProps: {
          placeholder: '请输入患者年龄',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'patientCode',
        rules: 'required',
        label: '患者编号',
        componentProps: {
          placeholder: '请输入患者编号',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'bedNo',
        label: '床位',
        componentProps: {
          placeholder: '请输入床位',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'patientPhoneNo',
        label: '联系方式',
        rules: 'required',
        componentProps: {
          placeholder: '请输入联系方式',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'patientAddress',
        label: '联系地址',
        componentProps: {
          placeholder: '请输入联系地址',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            // handleDept();
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: () => {
          return {
            placeholder: '请输入包装号',
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
      'CheckUserModal-checkUserModalApi': {
        // 连接抽离的组件
        connectedComponent: CheckUserModalComp,
      },
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
          {
            warehouseId: formValues.warehouseId,
            packageNo: formValues.packageNo,
            isAccurate: 'Y',
          },
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

// 提交通过处理函数
const handleApprove = async () => {
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  const formValues = await ChcGridApi.formApi.getValues();

  // if (!formValues.userCode) {
  //   message.warning('请先输入员工号');
  //   return;
  // }
  // if (!formValues.packageNo) {
  //   message.warning('请先输入包装号');
  //   return;
  // }
  if (!formValues.warehouseId) {
    message.warning('请先选择发货仓库');
    return;
  }
  if (!formValues.userId) {
    message.warning('请先选择发货人');
    return;
  }
  if (currentData.length === 0) {
    message.warning('请先确认需要提交的数据');
    return;
  }

  // const hasControlledProduct = true;
  const hasControlledProduct = currentData.some(
    (item) => item.isControlledProduct === 'Y',
  );
  const hasPreciousProduct = currentData.some(
    (item) => item.isPrecious === 'Y',
  );
  if (hasPreciousProduct && !formValues.patientName) {
    message.warning('患者姓名不能为空！');
    return;
  }
  if (hasPreciousProduct && !formValues.patientSex) {
    message.warning('患者性别不能为空！');
    return;
  }
  if (hasPreciousProduct && !formValues.patientAge) {
    message.warning('患者年龄不能为空！');
    return;
  }
  if (hasPreciousProduct && !formValues.patientCode) {
    message.warning('患者编号不能为空！');
    return;
  }
  if (hasPreciousProduct && !formValues.patientPhoneNo) {
    message.warning('患者联系方式不能为空！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认发货？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const shipmentPackage = [];
        for (const currentDatum of currentData) {
          shipmentPackage.push(currentDatum.packageNo);
        }
        const params = {
          ...formValues,
          packageNo: JSON.stringify(shipmentPackage),
        };

        // 如果有受控产品，需要第二作业人验证
        if (hasControlledProduct) {
          checkUserModalApi
            ?.setData({
              warehouseId: formValues.warehouseId,
              callBack: async (formValues: {
                checkUser2: number | string;
                password: string;
              }) => {
                return new Promise((resolve) => {
                  const finalParams = {
                    ...params,
                    workerId2: formValues.checkUser2,
                  };
                  dataCommit(finalParams)
                    .then((res) => {
                      if (res && res.success) {
                        console.warn('committ', res, handleImport);
                        // 发货成功后清空表格数据
                        ChcGridApi.grid.reloadData([]);
                        // 清空包装号输入框
                        ChcGridApi.formApi.setValues({
                          packageNo: '',
                        });
                        message.success('提交成功');
                        resolve(true);
                      } else {
                        message.error(res.msg || '失败');
                        resolve(false);
                      }
                    })
                    .catch((error) => {
                      console.error('失败', error);
                      // message.error('提交失败');
                      resolve(false);
                    });
                });
              },
            })
            .open();
        } else {
          // 非受控产品，直接执行发货
          await dataCommit(params)
            .then((res) => {
              if (res && res.success) {
                console.warn('committ', res, handleImport);
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
        }
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
    <CheckUserModal />
    <ChcGrid>
      <template #toolbar-tools>
        <span style="margin-left: 20px">已扫包数：{{ totalData }}</span>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_confirm"
        >
          确认
        </Button>
        <Button
          type="primary"
          @click="handleCancel"
          class="mr-[0.5rem]"
          data-testid="button_cancel"
        >
          重扫
        </Button>
        <!-- <Button type="primary" @click="handleImport" class="mr-[0.5rem]">
            导入包装
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button> -->
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
