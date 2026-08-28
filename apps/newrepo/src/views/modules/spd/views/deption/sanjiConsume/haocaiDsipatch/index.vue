<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { nextTick, onMounted, ref, toRaw } from 'vue';

import { SvgDeleteIcon, UploadCloudIcon } from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { requestFormClient } from '#/api/request';
import { deepClone } from '#/utils/util';

import { getDataApi } from './api';

const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);

const selectParams = ref<{ [key: string]: any }>({});
const gridData = ref<any[]>([]); // 表格数据
const hasTableData = ref(false); // 表格是否有数据，用于控制收货仓库禁用状态

const userCode = ref('');
const lastUserCode = ref(''); // 存储上次的员工号

// 生成表格组件和api
const gridColumns: VxeTableGridOptions['columns'] = [
  { type: 'checkbox', title: '', width: 40, align: 'center' },
  {
    title: '序号',
    type: 'seq',
    width: 40,
    align: 'center',
    sortable: true,
  },
  {
    field: 'productCode',
    title: '药品编码',
    width: 100,
  },
  { field: 'productName', title: '药品', width: 100 },
  { field: 'productSpec', title: '规格', width: 70 },
  { field: 'manufacturer', title: '厂家', width: 100 },
  { field: 'uomName', title: '单位', width: 70 },
  {
    field: 'qtyAvailable',
    title: '可用数量',
    align: 'right',
    width: 90,
  },
  {
    field: 'qtyApply',
    title: '发放数量',
    align: 'right',
    width: 90,
    editRender: {
      name: 'VxeNumberInput',
      props: {
        type: 'integer',
        min: 0,
        onChange() {
          if (
            ChcGridApi.grid.getEditCell() &&
            ChcGridApi.grid.getEditCell()!.row
          ) {
            const currentRow = ChcGridApi.grid.getEditCell()!.row;
            if (!currentRow) return null;
            // 校验发放数量不能超过可用数量
            if (currentRow.qtyApply > currentRow.qtyAvailable) {
              message.warning('发放数量不能超过可用数量!');
              currentRow.qtyApply = currentRow.qtyAvailable;
            }
          }
        },
      },
    },
  },
  { field: 'packageNo', title: '包装号', width: 100 },
  { field: 'price', title: '进价', align: 'right', width: 100 },
  { field: 'lot', title: '批号', width: 100 },
  { field: 'guaranteeDate', title: '效期', width: 100 },
  { field: 'vendorName', title: '供应商', width: 100 },
  { field: 'locatorName', title: '货位', width: 100 },
  { field: 'storageStatusName', title: '库存状态', width: 100 },
  { field: 'qtyOnHand', title: '在库数量', align: 'right', width: 100 },
  { field: 'qtyAllocated', title: '分配数量', align: 'right', width: 100 },
  { field: 'qtyMoving', title: '在途数量', align: 'right', width: 100 },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    width: 100,
    showOverflow: false,
    title: '操作',
  },
];

const [ChcGrid, ChcGridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    showCollapseButton: false,
    showDefaultActions: false,
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
    compact: true,
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'departmentId',
        formItemClass: 'col-span-1',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do',
            // showSearch: true,
            placeholder: '请选择发货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: true,
            onChange(val: any) {
              selectParams.value.warehouseId = val;
              if (
                selectParams.value.replenishWarehouseId &&
                chcSelectRef.value &&
                chcSelectRef.value.fetchApi &&
                typeof chcSelectRef.value.fetchApi === 'function'
              ) {
                chcSelectRef.value.fetchApi();
              }
            },
            labelField: 'name',
            valueField: 'id',
            disabled: hasTableData.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        fieldName: 'warehouseId',
        formItemClass: 'col-span-1',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: 'baseHandleAction/warehouse.do?accessAll=Y&level3=Y',
            // dictUrl: `/baseHandleAction/warehouse.do?accessAll=Y&level3=Y&userCode=${
            //   userCode.value || ''
            // }`,
            triggerFields: ['userCode'],
            placeholder: '输入员工号后回车显示仓库',
            onChange(val: any) {
              selectParams.value.replenishWarehouseId = val;

              if (
                chcSelectRef.value &&
                chcSelectRef.value.fetchApi &&
                typeof chcSelectRef.value.fetchApi === 'function'
              ) {
                chcSelectRef.value.fetchApi();
              }
            },
            paginate: false,
            immediate: false,
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows && res.rows.length === 0) {
                return message.error('员工没有所属仓库!');
              }
              return {
                ...res,
                rows: undefined,
                records: userCode.value ? res.rows : [],
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['userCode'],

          trigger() {
            //   if (
            //     ChcGridApi.formApi?.getFieldComponentRef &&
            //     typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
            //     ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId') &&
            //     ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId').params
            //   ) {
            //     ChcGridApi.formApi.getFieldComponentRef(
            //       'toWarehouseId',
            //     ).params.dependencies = {
            //       userCode: values.userCode,
            //     };
            //     ChcGridApi.formApi
            //       ?.getFieldComponentRef('toWarehouseId')
            //       ?.fetchApi();
            //     ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
            //   }
          },
        },
        fieldName: 'toWarehouseId',
        label: '收货仓库',
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '备注',
        componentProps: {
          placeholder: '请输入备注',
          onPressEnter: async (e) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
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
              getPackageData();
            },
          };
        },
      },
      // {
      //   component: 'Switch',
      //   componentProps: {
      //     disabled: false,
      //     allowClear: true,
      //     options: [
      //       {
      //         label: '是',
      //         value: 'true',
      //       },
      //       {
      //         label: '否',
      //         value: 'false',
      //       },
      //     ],
      //     placeholder: '请选择',
      //     style: {
      //       width: '40px',
      //     },
      //   },
      //   defaultValue: false,
      //   fieldName: 'isActive',
      //   label: '反扫',
      // },
    ],
  },
  gridOptions: {
    keyboardConfig: {
      isEdit: true,
    },
    size: 'small',
    editConfig: {
      enabled: true,
      mode: 'row',
      trigger: 'dblclick',
      showStatus: false,
      showIcon: false,
      autoClear: true,
    },
    checkboxConfig: {
      trigger: 'default',
      checkMethod: ({ row }: any) => {
        return row.orderPlanLineId;
      },
    },
    keepSource: true,
    height: 'auto',
    pagerConfig: {
      enabled: false,
    },
    showOverflow: true,
    proxyConfig: {
      autoLoad: false,
    },
    border: true,
    cellConfig: {
      height: 32,
    },
    data: gridData.value,
    rowConfig: {
      isCurrent: false,
    },
    columns: gridColumns,
    cellStyle(scope: any) {
      if (scope.column.field === 'qtyApply') {
        return {
          backgroundColor: '#D7FFF5',
        };
      }
    },
  },
  gridEvents: {
    editActivated: (scope: any) => {
      // 用于获取当前正在操作行和列的赋值
      currentEditRow.value = scope.row;
      currentField.value = scope.column.field;
    },
    editClosed: async ({ row }: any) => {
      console.warn('editClosed', row);
    },
  },
});

// 选择一个药品  新增行
const handleChoose = async (val: any, row: any) => {
  if (submitLoading.value) {
    return;
  }
  // 检查收货仓库是否已选择
  const formValue = await ChcGridApi.formApi.getValues();
  if (!formValue.toWarehouseId) {
    message.warning('请选择收货仓库!');
    // 清空当前选中的药品
    chcSelectRef.value.modelValue = undefined;
    return;
  }

  console.warn('handleChoose val', val);
  console.warn('handleChoose option', row);
  // const existingRows = ChcGridApi.grid.getInsertRecords();
  const existingRows =
    deepClone(ChcGridApi.grid.getTableData().tableData) || [];
  const productIdIds = toRaw(existingRows).map((item) => item.productId);
  if (productIdIds.includes(row.productId)) {
    message.error('选择的药品有重复!');
    return;
  }

  // 保存当前表格中用户编辑的qtyApply值
  const currentTableData = ChcGridApi.grid.getTableData().tableData || [];
  const editedValues = new Map();
  currentTableData.forEach((tableRow: any) => {
    if (tableRow.qtyApply !== undefined && tableRow.qtyApply !== null) {
      const key = `${tableRow.productCode}_${tableRow.packageNo}`;
      editedValues.set(key, tableRow.qtyApply);
    }
  });

  // 先往黑名单里加数据，放后面会造成表格新增数据异常
  blackList.value.push(val);
  await nextTick();
  chcSelectRef.value.modelValue = undefined; // 清空下拉组件
  console.warn('handleChoose: formValue', formValue);
  const p: Record<string, any> = {};
  gridColumns.forEach((item: any) => {
    if (
      item.field !== 'checkbox' &&
      item.field !== 'action' &&
      item.field !== 'seq'
    ) {
      p[item.field] = undefined;
    }
  });

  const record = {
    ...p,
    ...row,
  };
  console.warn('handleChoose p', p);
  // 将新数据添加到 gridData 数组
  gridData.value.push(record);

  // 恢复用户编辑的qtyApply值
  gridData.value.forEach((dataRow: any) => {
    const key = `${dataRow.productCode}_${dataRow.packageNo}`;
    if (editedValues.has(key)) {
      dataRow.qtyApply = editedValues.get(key);
    }
  });

  // 重新加载表格数据
  await ChcGridApi.grid.reloadData(gridData.value);
  console.warn('handleChoose record', record);

  // 更新表格数据状态
  const existingTableData = ChcGridApi.grid.getTableData().tableData || [];
  hasTableData.value = existingTableData.length > 0;
};

// 点击删除按钮  删除行
const handleDeleteRow = async (scope: any) => {
  // 保存当前表格中用户编辑的qtyApply值（除了要删除的行）
  const currentTableData = ChcGridApi.grid.getTableData().tableData || [];
  const editedValues = new Map();
  currentTableData.forEach((row: any) => {
    // 跳过要删除的行
    if (
      (row.productCode !== scope.row.productCode ||
        row.productName !== scope.row.productName) &&
      row.qtyApply !== undefined &&
      row.qtyApply !== null
    ) {
      const key = `${row.productCode}_${row.packageNo}`;
      editedValues.set(key, row.qtyApply);
    }
  });

  // 从 gridData 数组中移除对应的行
  const rowIndex = gridData.value.findIndex((item) => {
    // 通过多个字段来匹配行数据
    return (
      item.productCode === scope.row.productCode &&
      item.productName === scope.row.productName
    );
  });
  if (rowIndex !== -1) {
    gridData.value.splice(rowIndex, 1);

    // 恢复其他行用户编辑的qtyApply值
    gridData.value.forEach((row: any) => {
      const key = `${row.productCode}_${row.packageNo}`;
      if (editedValues.has(key)) {
        row.qtyApply = editedValues.get(key);
      }
    });

    // 重新加载表格数据
    await ChcGridApi.grid.reloadData(gridData.value);
  }

  // 从黑名单中移除对应的药品编码，使其可以重新选择
  const blackListIndex = blackList.value.indexOf(scope.row.productCode);
  if (blackListIndex !== -1) {
    blackList.value.splice(blackListIndex, 1);
  }

  // 更新表格数据状态
  await nextTick(); // 等待DOM更新
  const existingTableData = ChcGridApi.grid.getTableData().tableData || [];
  hasTableData.value = existingTableData.length > 0;
};

const submitLoading = ref(false); // 整体操作loading控制

// 提交
const handleSubmit = async () => {
  if (submitLoading.value) {
    return;
  }
  // const submitRows = ChcGridApi.grid.getInsertRecords();
  const submitRows = ChcGridApi.grid.getTableData().tableData || [];
  console.warn('handleSubmit submitRows', submitRows);
  const temData = {
    data: submitRows,
  };
  const res = await ChcGridApi.formApi.getValues();
  console.warn('handleSubmit res', res);
  const warehouseId = res.warehouseId;
  if (!warehouseId) {
    message.warning('请选择发货仓库！');
    return false;
  }
  const params = {
    ...res,
    lineData: JSON.stringify(temData),
    orderType: 'MO',
    returnDoc: 'N',
    isOutNeedPick: 'N',
    isPackaged: 'N',
    storageStatus: 'S',
    orderId: 0,
  };
  console.warn('lineData222222', JSON.stringify(params));
  submitLoading.value = true;
  requestFormClient
    .post('/orderAction/saveCompleteOrderOut.do', params)
    .then((res) => {
      if (res.success) {
        message.success('成功！');
        // 清空表格数据
        gridData.value = []; // 清空 gridData 数组
        ChcGridApi.grid.reloadData(gridData.value); // 重新加载空数据
        blackList.value = [];
        // 更新表格数据状态
        hasTableData.value = false;
      } else {
        message.error(`失败：${res.msg}`);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      submitLoading.value = false;
    });
};

const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field

// 控制添加药品以及黑名单逻辑
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelectRef = ref(); // 药品选择下拉组件
// 员工号
const handleDept = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  const currentUserCode = formValues.userCode || '';

  // 如果员工号和上次一样，直接返回
  if (currentUserCode === lastUserCode.value) {
    return;
  }

  try {
    userCode.value = currentUserCode;
    lastUserCode.value = currentUserCode; // 更新上次的员工号

    if (
      ChcGridApi.formApi?.getFieldComponentRef &&
      typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
      ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId') &&
      ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId').params
    ) {
      ChcGridApi.formApi.getFieldComponentRef(
        'toWarehouseId',
      ).params.dependencies = {
        userCode: currentUserCode,
      };
      ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')?.fetchApi();
      ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
    }
  } catch {
    ChcGridApi.formApi.setValues({
      userCode: '',
    });
    lastUserCode.value = ''; // 出错时也要重置上次的员工号
    message.error('查询失败');
  }
};

// 处理包装号查询返回的数据
const handlePackageData = async (data: any) => {
  const formValues = await ChcGridApi.formApi.getValues();
  const currentData = structuredClone(data.rows || []);

  // 获取当前表格数据
  // const existingTableData = ChcGridApi.grid.getInsertRecords();
  const existingTableData = ChcGridApi.grid.getTableData().tableData || [];

  if (formValues.isActive) {
    console.warn('反选');
  } else {
    // 添加新行模式：将查询结果的第一条数据插入到表格最上方
    if (currentData && currentData.length > 0) {
      const newRow = currentData[0]; // 取查询结果的第一条数据

      // 检查是否已存在相同包装号
      const existingRow = existingTableData.find(
        (row: any) => row.packageNo === newRow.packageNo,
      );
      if (existingRow) {
        message.warn('该包装号已存在');
        ChcGridApi.formApi.setValues({
          packageNo: '',
        });
        return;
      }

      // 保存当前表格中用户编辑的qtyApply值
      const currentTableData = ChcGridApi.grid.getTableData().tableData || [];
      const editedValues = new Map();
      currentTableData.forEach((row: any, index: number) => {
        console.warn('index', index);
        if (row.qtyApply !== undefined && row.qtyApply !== null) {
          // 使用唯一标识符作为key，这里使用productCode + packageNo的组合
          const key = `${row.productCode}_${row.packageNo}`;
          editedValues.set(key, row.qtyApply);
        }
      });

      // 将新数据插入到表格最上方
      const record = {
        ...newRow,
        qtyAvailable: newRow.qty || newRow.qtyOnHand,
      };
      // 将药品编码添加到黑名单中
      blackList.value.push(record.productCode);
      // 将新数据添加到 gridData 数组的开头
      gridData.value.unshift(record);

      // 恢复用户编辑的qtyApply值
      gridData.value.forEach((row: any) => {
        const key = `${row.productCode}_${row.packageNo}`;
        if (editedValues.has(key)) {
          row.qtyApply = editedValues.get(key);
        }
      });

      // 重新加载表格数据
      await ChcGridApi.grid.reloadData(gridData.value);

      // 清空包装号输入框
      ChcGridApi.formApi.setValues({
        packageNo: '',
      });

      // 更新表格数据状态
      const existingTableDataTwo =
        ChcGridApi.grid.getTableData().tableData || [];
      hasTableData.value = existingTableDataTwo.length > 0;
    } else {
      message.error('未查询到包装号对应的数据');
    }
  }
};

// 处理包装号输入和查询逻辑
const getPackageData = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.packageNo) {
    return message.warning('请先输入包装号');
  }

  // 检查仓库是否已选择
  if (!formValues.warehouseId) {
    message.warning('请选择发货仓库!');
    return;
  }

  if (formValues.isActive) {
    // 反扫模式：直接从当前表格删除数据，不调用接口
    await handlePackageData({
      rows: [], // 反扫模式不需要接口数据
      success: true,
    });
    return;
  }

  // 正常添加模式：调用接口查询数据
  try {
    const res = await getDataApi({
      warehouseId: formValues.warehouseId,
      packageNo: formValues.packageNo,
      isAccurate: 'Y',
    });

    if (res && res.success && res.rows && res.rows.length > 0) {
      await handlePackageData({
        ...res,
        records: res.rows,
      });
    } else {
      message.error(res.msg || '查询失败');
      ChcGridApi.formApi.setValues({
        packageNo: '',
      });
    }
  } catch (error) {
    ChcGridApi.formApi.setValues({
      packageNo: '',
    });
    console.error('查询失败', error);
    message.error('查询失败');
  }
};

// 页面初始化加载行数据以及黑名单数据
onMounted(() => {});

// 用于标记产品下拉是否打开，用来自定义下拉开启时的键盘左右箭头操作
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;
  // if (
  //   ChcSelect.value &&
  //   ChcSelect.value.fetchApi &&
  //   typeof ChcSelect.value.fetchApi === 'function'
  // ) {
  //   ChcGridApi.formApi.getValues().then((res) => {
  //     ChcSelect.value.params.warehouseId = res.warehouseId;
  //     selectParams.value.replenishWarehouseId = res.replenishWarehouseId;

  //     ChcSelect.value.fetchApi();
  //   });
  // }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <span
          style="
            padding-right: 10px;
            padding-left: 10px;
            font-size: 15px;
            font-weight: 550;
          "
        >
          新增药品:
        </span>
        <ChcSelect
          :autofocus="false"
          :paginate="true"
          :allow-clear="false"
          ref="chcSelectRef"
          placeholder="请输入药品编码、药品名称、规格"
          data-testid="select_productCode"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/storageAction/queryStorageDetail.do?storageStatus=S&isScatter=Y"
          popup-class-name="productSelection"
          @dropdown-visible-change="handleDropdownVisibleChange"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
          :page-size="25"
          :immediate="false"
          :extra-params="selectParams"
          :black-list="blackList"
          :filter-by-front-end="false"
          :show-search="true"
          @change="handleChoose"
          filter-field="productName"
          :handle-params="
            (params: any) => {
              return {
                ...params,
                limit: 0,
                isReplenish: 'Y',
              };
            }
          "
          label-field="productName"
          value-field="productCode"
          :after-fetch="
            (res: any) => {
              return {
                ...res,
                rows: undefined,
                records: selectParams.replenishWarehouseId ? res.rows : [],
              };
            }
          "
          :option-columns="[
            {
              header: '药品编码',
              name: 'productCode',
              width: 80,
            },
            {
              header: '药品名称',
              name: 'productName',
              width: 160,
            },
            {
              header: '规格',
              name: 'productSpec',
              width: 80,
            },
            {
              header: '型号',
              name: 'modelNo',
              width: 100,
              visible: false,
            },
            {
              header: '厂家',
              name: 'manufacturer',
              width: 100,
            },
            {
              header: '单位',
              name: 'uomName',
              align: 'center',
              width: 50,
            },
            {
              header: '可用数量',
              name: 'qtyAvailable',
              align: 'center',
              width: 80,
            },
            {
              header: '进价',
              name: 'price',
              align: 'center',
              width: 80,
            },
            {
              header: '批号',
              name: 'lot',
              width: 80,
            },
          ]"
        />
      </template>
      <template #action="scope">
        <Button
          type="primary"
          ghost
          danger
          @click="handleDeleteRow(scope)"
          :data-testid="`button_delete_${scope.rowIndex}`"
          :loading="scope.row.loading"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
        >
          删行
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-center pt-[10px]">
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              @click="handleSubmit(false)"
              :loading="submitLoading"
              data-testid="button_commit"
            >
              提交
              <template #icon>
                <UploadCloudIcon />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}

::v-deep(.vxe-tools--wrapper .ant-input) {
  padding: 2px 7px;
}
</style>
