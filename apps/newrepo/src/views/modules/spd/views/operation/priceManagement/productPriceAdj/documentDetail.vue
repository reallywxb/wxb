<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import { ChcSelect } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, Input, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
// import { productColOptions } from './productColOptions';
import { handlePriceToFixedTwo } from '#/utils/util';

import { queryOrderPlanLineInfo, saveDo, saveLine } from './api';
import batchAddModal from './modals/batchAddModal.vue';

const userStore: any = useUserStore();

const ROWKEYFIELD = 'productCode';
const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');

const selectParams = ref<{ [key: string]: any }>({});
const gridData = ref<any[]>([]);

const [ChcGrid, chcGridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    showCollapseButton: true,
    collapsed: true,
    showDefaultActions: true,
    submitButtonOptions: { show: false },
    resetButtonOptions: { show: false },
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
    compact: false,
    schema: [
      {
        component: 'Input',
        fieldName: 'sitePriceListAdjId',
        label: '调价单号',
        formItemClass: 'pb-2',
        componentProps: () => {
          return {
            placeholder: ' ',
            disabled: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000544',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择调价类型',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        rules: 'required',
        fieldName: 'adjType',
        label: '调价类型',
        formItemClass: 'pb-2',
      },
      {
        component: 'DatePicker',
        fieldName: 'effectiveTime',

        dependencies: {
          triggerFields: ['adjType'],
          trigger(values) {
            if (values.adjType !== '1') {
              chcGridApi.formApi.setFieldValue('effectiveTime', undefined);
            }
          },
          componentProps: async () => {
            const formdata = await chcGridApi.formApi?.getValues?.();
            return {
              disabled: formdata?.adjType !== '1' || !formdata?.adjType,
              valueFormat: 'YYYY-MM-DD 00:00:00',
              format: 'YYYY-MM-DD 00:00:00',
            };
          },
        },
        label: '生效时间',
        formItemClass: 'pb-2',
      },
      {
        component: 'Input',
        fieldName: 'adjReason',
        label: '调价原因',
        formItemClass: 'pb-2',
        componentProps: () => {
          return {
            placeholder: '请输入调价原因',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'adjNo',
        label: '调价文号',
        formItemClass: 'pb-2',
        componentProps: () => {
          return {
            placeholder: '请输入调价文号',
          };
        },
      },
      // {
      //   component: 'ChcSelect',

      //   componentProps: () => {
      //     return {
      //       autoChooseFirstOption: true,
      //       dictUrl: '/productAction/productControlLevelList.do',
      //       placeholder: '请选择商品组',
      //       paginate: false,
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   dependencies: {
      //     triggerFields: ['departmentId', 'regionId'],
      //     show: () => {
      //       return userStore.userInfo.isProductControlLevel;
      //     },
      //   },
      //   fieldName: 'productControlLevel',
      //   label: '商品组',
      // },

      {
        component: 'Input',
        fieldName: 'description',
        label: '备注',
        formItemClass: 'pb-2',
        componentProps: () => {
          return {
            defaultValue: parentData.value!.description || undefined,
            placeholder: '请输入备注',
          };
        },
      },
    ],
  },
  gridOptions: {
    id: 'detailTable',
    keyboardConfig: {
      // isTab: true,
      // isEdit: true,
      // isArrow: true,
      // isEnter: true,
    },
    size: 'small',
    editConfig: {
      enabled: detailInfo.value?.type === 'edit',
      mode: 'row',
      trigger: 'click',
      showStatus: false,
      showIcon: false,
      autoClear: true,
    },

    checkboxConfig: {
      trigger: 'default',
    },
    keepSource: true,
    height: 'auto',
    pagerConfig: {
      // enabled: false,
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
    columns: [
      {
        type: 'radio',
        width: 60,
        visible: false,
        title: '单选',
      },
      {
        title: '序号',
        width: 40,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 120,
        sortable: true,
      },

      {
        field: 'modelNo',
        title: '型号',
        minWidth: 100,
        sortable: true,
        visible: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 120,
        sortable: true,
        visible: false,
      },
      {
        field: 'isPurchasePriceUnify',
        title: '统一定价',
        width: '90',
        sortable: true,
        formatter({ isPurchasePriceUnify }: any) {
          return isPurchasePriceUnify === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'priceList',
        title: '零售价',
        sortable: true,
        width: 90,
        align: 'right',
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'priceListNew',
        title: '新零售价',
        width: 100,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'float',
            min: 0,
            step: 0.001,
            digits: 3,
          },
        },
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePONew',
        title: '新采购价',
        width: 100,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'float',
            min: 0,
            step: 0.001,
            digits: 3,
          },
        },
      },
      {
        field: 'manufacturer',
        title: '厂家',
        sortable: true,
        minWidth: 120,
      },
      {
        field: 'uomName',
        title: '单位',
        sortable: true,
        width: 90,
      },
      {
        field: 'description',
        title: '备注',
        width: 150,
        sortable: true,
        editRender: {
          name: 'VxeInput',
        },
      },
      {
        align: 'center',
        field: 'action',
        visible: detailInfo.value?.type === 'edit',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 70,
      },
    ],
  },
  gridEvents: {
    editActivated: (scope: any) => {
      currentEditRow.value = scope.row;
      currentField.value = scope.column.field;
    },
    editClosed: ({ row }: any) => {
      // currentEditRow.value = undefined;
      // currentField.value = '';
      currentInsertRows.value = chcGridApi.grid.getInsertRecords();
      currentUpdateRows.value = chcGridApi.grid.getUpdateRecords();

      if (autoSaveController.value === 'onSaving') {
        currentEditRow.value = undefined;
        currentField.value = '';
      } else {
        autoSaveController.value = 'onSaving';
        if (
          chcGridApi.grid.isInsertByRow(row) ||
          chcGridApi.grid.isUpdateByRow(row)
        ) {
          currentEditRow.value = undefined;
          currentField.value = '';

          // 对该行数据进行保存
          handleSave({
            $grid: chcGridApi.grid,
            row,
          })
            .then(() => {
              autoSaveController.value = 'wait';
              currentInsertRows.value = [];
              currentUpdateRows.value = [];
            })
            .catch(() => {
              autoSaveController.value = 'error';
              currentInsertRows.value = [];
              currentUpdateRows.value = [];
            });
        } else {
          autoSaveController.value = 'wait';
        }
      }
    },
  },
  // separator: false,
});
const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存保存了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
const currentEditRow = ref<any>();
const currentField = ref('');
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});
const handleClose = () => {
  currentTab.value = 0;
};
// 获取保存 删除 提交的基础params数据
const queryparams = (
  type: 'delete' | 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  // 深度过滤每个行对象中的null和undefined属性
  const filteredRows = rows.map((row) => {
    if (!row) return row;
    return Object.fromEntries(
      Object.entries(row).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );
  });
  console.warn('paramsNewData', filteredRows);
  lineData = JSON.stringify({
    created: type === 'saveLine' ? filteredRows : [],
    updated: type === 'saveDo' ? filteredRows : [],
    removed: type === 'delete' ? filteredRows : [],
  });
  //   lineData = JSON.stringify({
  //   created: type === 'saveLine' ? [...rows] : [],
  //   updated: type === 'saveDo' ? [...rows] : [],
  //   removed: type === 'delete' ? [...rows] : [],
  // });
  // lineData =
  //   type === 'saveDo'
  //     ? JSON.stringify({ created: [], updated: [], removed: [...rows] })
  //     : JSON.stringify(rows[0]);
  return {
    priceListAdjId: parentData.value.priceListAdjId || 0,
    asnId: parentData.value.asnId || 0,
    adjType: formValues.adjType || parentData.value.adjType,
    effectiveTime: formValues.effectiveTime || parentData.value.effectiveTime,
    adjReason: formValues.adjReason || parentData.value.adjReason,
    adjNo: formValues.departmentId || parentData.value.adjNo,
    productControlLevel: userStore.userInfo.isProductControlLevel
      ? formValues.productControlLevel || parentData.value.productControlLevel
      : '',
    description: formValues.description || parentData.value.description,
    lineData,
  };
};
const deleteRow = (row: any) => {
  return new Promise((resolve) => {
    chcGridApi.formApi.getValues().then(async (res) => {
      const params = queryparams('delete', res, [row]);

      // 过滤掉paramsNew中的null和undefined值
      const paramsNewFiltered = Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== null && value !== undefined,
        ),
      );
      saveDo(paramsNewFiltered)
        .then((res) => {
          // 如果原先的 parentData.value.orderPlanId 没值，说明是新增进来的
          // 此时需要更新 parentData.value.orderPlanId
          resolve(res);
        })
        .catch(() => {
          row.loading = false;
        });
    });
  });
};
const handleDeleteRow = async (scope: any) => {
  const insertRows = chcGridApi.grid.getInsertRecords();
  const updateRows = chcGridApi.grid.getUpdateRecords();
  // 由于删行会造成编辑信息丢失，因此未保存行编辑信息的情况下，不允许删行
  if (updateRows.length > 1) {
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }
  // 删除的就是当前操作行 或者 在非编辑状态点击删除，直接删
  autoSaveController.value = 'onSaving';
  if (scope.row.productPriceListAdjId) {
    // if (scope.row.orderPlanLineId) {
    scope.row.loading = true;
    // 先调接口删行
    await deleteRow(scope.row);
    scope.row.loading = false;
  } else {
    // 此时还没与任何保存数据
  }
  await scope.$grid.clearEdit();

  function handleInsertRows() {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
      );
      if (midRows.length > 0) {
        for (const [i, midRow_] of midRows.entries()) {
          const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
          if (i === 0) {
            newRow = midRow.row;
          }
        }
        // 聚焦到新插入的数据继续编辑
        chcGridApi.grid.setEditRow(newRow, true);
      } else {
        continuEdit(scope.row);
      }
    }, 0);
  }

  if (scope.$grid.isInsertByRow(scope.row)) {
    // 当前删除的是插入的临时行
    scope.$grid.remove(scope.row);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  } else {
    // 当前删除的不是临时行
    gridData.value.splice(scope.$rowIndex, 1);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  }
  autoSaveController.value = 'wait';
};

const handleSave = async (scope: any) => {
  return new Promise((resolve, reject) => {
    scope.row.loading = true;
    validateRow(scope.row)
      .then(async (res: any) => {
        scope.row.loading = false;
        for (const key in res) {
          scope.row[key] = res[key];
        }
        const insertRows = chcGridApi.grid.getInsertRecords();
        await scope.$grid.clearEdit();
        if (insertRows.length === 0) {
          // 当前表格没有插入的临时数据
          const index = gridData.value.findIndex(
            (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
          );
          gridData.value[index] = scope.row;
          chcSelect.value.focus();
        } else if (insertRows.length === 1) {
          // 当前表格新插入的临时数据只有一条
          if (scope.$grid.isInsertByRow(scope.row)) {
            // 操作的正是这条临时数据
            const newRow = await scope.$grid.createRow(scope.row);
            gridData.value.push(newRow);
          } else {
            // 操作的不是这条临时数据
            const index = gridData.value.findIndex(
              (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
            );
            gridData.value[index] = scope.row;
            // 再将临时数据插回去
            const insertRow = await handleInsertRowsPromise(scope.row);
            scope.$grid.setEditRow(insertRow, true);
          }
        } else {
          // 当前表格有多条插入的临时数据
          if (scope.$grid.isInsertByRow(scope.row)) {
            // 操作的正是这些临时数据中的一条
            const newRow = await scope.$grid.createRow(scope.row);
            gridData.value.push(newRow);
            // 再将其余临时数据插回去
            const insertRow = await handleInsertRowsPromise(scope.row);
            scope.$grid.setEditRow(insertRow, true);
          } else {
            // 操作的不是临时数据
            const index = gridData.value.findIndex(
              (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
            );
            gridData.value[index] = scope.row;
            // 再将其余临时数据插回去
            const insertRow = await handleInsertRowsPromise(scope.row);
            scope.$grid.setEditRow(insertRow, true);
          }
        }
        resolve(res);
      })
      .catch(async (error: any) => {
        scope.row.loading = false;
        // 继续编辑当前行
        reject(error);
        await scope.$grid.setEditRow(scope.row, true);
      });
  });
};
// 通过promise控制临时数据行重新插入
const handleInsertRowsPromise = (row: any) => {
  return new Promise((resolve) => {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    const insertRows = chcGridApi.grid.getInsertRecords();
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD],
      );

      for (const [i, midRow_] of midRows.entries()) {
        const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
        if (i === 0) {
          newRow = midRow.row;
        }
      }
      resolve(newRow);
    }, 0);
  });
};
const validateRow = (row: any) => {
  return new Promise((resolve, reject) => {
    chcGridApi.formApi
      .getValues()
      .then(async (res) => {
        if (row.productPriceListAdjId) {
          const params = queryparams('saveDo', res, [row]);

          console.warn('params', params);
          saveLine(params)
            .then((res) => {
              if (res && res.success) {
                // 如果原先的 parentData.value.orderPlanId/asnId没值，说明是新增进来的
                // 此时需要更新 parentData.value.priceListAdjId
                if (!parentData.value.priceListAdjId) {
                  parentData.value = { priceListAdjId: res.id };
                  chcGridApi.formApi.setFieldValue('priceListAdjId', res.id);
                }

                queryOrderPlanLineInfo({ priceListAdjId: res.id }).then(
                  async (resIn) => {
                    const newRow = resIn.rows.find(
                      (item: any) => item.orderLineId === res.orderLineId,
                      // (item: any) => item.orderPlanLineId === res.lineId,
                    );

                    resolve(newRow);
                  },
                );
              }
            })
            .catch((error) => {
              reject(error);
              row.loading = false;
            });
        } else {
          const params = queryparams('saveLine', res, [row]);

          console.warn('params', params);

          saveLine(params)
            .then((res) => {
              // 如果原先的 parentData.value.orderPlanId/asnId没值，说明是新增进来的
              // 此时需要更新 parentData.value.priceListAdjId
              if (!parentData.value.priceListAdjId) {
                parentData.value = { priceListAdjId: res.id };
                chcGridApi.formApi.setFieldValue('priceListAdjId', res.id);
              }

              queryOrderPlanLineInfo({ priceListAdjId: res.id }).then(
                async (resIn) => {
                  const newRow = resIn.rows.find(
                    (item: any) => item.orderLineId === res.orderLineId,
                    // (item: any) => item.orderPlanLineId === res.lineId,
                  );

                  resolve(newRow);
                },
              );
            })
            .catch((error) => {
              reject(error);
              row.loading = false;
            });
        }
      })
      .catch((error) => {
        reject(error);
        row.loading = false;
      });
  });
};

const handleBatchAdd = async () => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    chcGridApi.formApi.getValues().then((res: any) => {
      batchAddModalApi!
        .setData({
          productControlLevel: res.productControlLevel,
          handleBatchChoose,
          blackList: blackList.value,
        })
        .open();
    });
  }
};
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelect = ref();
const handleChoose = async (val: any, option: any) => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    // 验证必填字段
    const temFormData = await chcGridApi.formApi.getValues();
    const formValues: any = {
      productControlLevel:
        temFormData.productControlLevel || parentData.value.productControlLevel,
      adjType: temFormData.adjType || parentData.value.adjType,
    };
    console.warn('验证必填字段:', formValues);
    const requiredFields = [
      // { field: 'productControlLevel', label: '商品组' },
      { field: 'adjType', label: '调价类型' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formValues[field]) {
        await nextTick();
        chcSelect.value.modelValue = undefined;
        message.warning(`请先选择${label}`);
        return;
      }
    }

    // 验证通过后执行添加逻辑
    // 先往黑名单里加数据，放后面会造成表格新增数据异常
    blackList.value.push(val);
    await nextTick();
    chcSelect.value.modelValue = undefined; // 清空下拉组件

    const record = {
      ...option,
    };
    const { row: newRow } = await chcGridApi.grid.insertAt(record, -1);
    chcGridApi.grid.setEditRow(newRow, true);
  }
};

const handleBatchChoose = async (records: any[]) => {
  const temFormData = await chcGridApi.formApi.getValues();
  const formValues: any = {
    productControlLevel:
      temFormData.productControlLevel || parentData.value.productControlLevel,
    adjType: temFormData.adjType || parentData.value.adjType,
  };
  console.warn('验证必填字段:', formValues);
  const requiredFields = [
    // { field: 'productControlLevel', label: '商品组' },
    { field: 'adjType', label: '调价类型' },
  ];

  for (const { field, label } of requiredFields) {
    if (!formValues[field]) {
      await nextTick();
      chcSelect.value.modelValue = undefined;
      message.warning(`请先选择${label}`);
      return;
    }
  }

  blackList.value = [
    ...blackList.value,
    ...records.map((item) => item[ROWKEYFIELD]),
  ];
  let newRow = null;
  for (const [i, record__] of records.entries()) {
    const record = {
      ...record__,
      currentPricePo: record__.pricePO,
    };
    await nextTick();
    if (i === 0) {
      const midRow = await chcGridApi.grid.insertAt(record, -1);
      newRow = midRow.row;
    } else {
      await chcGridApi.grid.insertAt(record, -1);
    }
  }
  chcGridApi.grid.setEditRow(newRow, true);
};

const disabledNo = ref(false);
onMounted(() => {
  console.warn('parentData.value:', parentData.value);
  disabledNo.value = parentData.value.invoiceMethod === '2';
  if (parentData.value.priceListAdjId) {
    queryOrderPlanLineInfo({
      priceListAdjId: parentData.value.priceListAdjId,
    }).then(async (res) => {
      if (res.success) {
        let newRow = null;
        for (let i = 0; i < res.rows.length; i++) {
          blackList.value.push(res.rows[i]![ROWKEYFIELD]);
          if (i === 0) {
            newRow = await chcGridApi.grid.createRow(res.rows[i]);
            gridData.value.push(newRow);
          } else {
            const midRow = await chcGridApi.grid.createRow(res.rows[i]);
            gridData.value.push(midRow);
          }
        }
      } else {
        message.error(res.msg);
      }
    });
  }
  window.addEventListener('keydown', handleKeyBoard);
});
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  // 在下拉框打开时验证表单字段

  selectOpen.value = !!open;
  if (
    chcSelect.value &&
    chcSelect.value.fetchApi &&
    typeof chcSelect.value.fetchApi === 'function'
  ) {
    chcGridApi.formApi.getValues().then((res) => {
      chcSelect.value.params.productControlLevel =
        res.productControlLevel || parentData.value.productControlLevel;
      selectParams.value.productControlLevel =
        res.productControlLevel || parentData.value.productControlLevel;
      // chcSelect.value.params.productControlLevel = res.productControlLevel || parentData.value.productControlLevel;

      chcSelect.value.fetchApi();
    });
  }
};
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
const EditFields = [
  'qtyArrived',
  'vendorId',
  'isGift',
  'taxInvoiceNo',
  'taxInvoiceDate',
  'lot',
  'guaranteeDate',
  'serNo',
];
const continuEdit = (row: any) => {
  if (
    chcGridApi.grid
      .getInsertRecords()
      .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    chcGridApi.grid.setEditRow(
      chcGridApi.grid
        .getInsertRecords()
        .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else if (
    chcGridApi.grid
      .getUpdateRecords()
      .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    chcGridApi.grid.setEditRow(
      chcGridApi.grid
        .getUpdateRecords()
        .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else {
    return chcSelect.value.focus();
  }
};
const handleKeyBoard = async (e: KeyboardEvent) => {
  if (e.ctrlKey && e.code === 'KeyE') {
    e.preventDefault();
    if (chcGridApi.grid.getInsertRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getInsertRecords()[0], true);
    } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getUpdateRecords()[0], true);
    } else {
      return chcSelect.value.focus();
    }
  }
  if (
    e.code === 'ArrowRight' &&
    currentEditRow.value && // await chcGridApi.grid.clearEdit();
    EditFields.indexOf(currentField.value) + 1 < EditFields.length
  ) {
    e.preventDefault();
    chcGridApi.grid.setEditCell(
      currentEditRow.value,
      EditFields[EditFields.indexOf(currentField.value) + 1] as string,
    );
    currentField.value = EditFields[
      EditFields.indexOf(currentField.value) + 1
    ] as string;
  }
  if (
    e.code === 'ArrowLeft' &&
    currentEditRow.value &&
    EditFields.indexOf(currentField.value) - 1 > -1
  ) {
    e.preventDefault();
    chcGridApi.grid.setEditCell(
      currentEditRow.value,
      EditFields[EditFields.indexOf(currentField.value) - 1] as string,
    );
    currentField.value = EditFields[
      EditFields.indexOf(currentField.value) - 1
    ] as string;
  }
  if (e.code === 'Delete' && currentEditRow.value) {
    e.preventDefault();
    handleDeleteRow({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  if (e.key === 'Enter' && currentEditRow.value) {
    e.preventDefault();
    handleSave({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  if (e.code === 'ArrowRight' && selectOpen.value) {
    e.preventDefault();
    chcSelect.value.pageChange(chcSelect.value.params.current + 1);
  }

  if (e.code === 'ArrowLeft' && selectOpen.value) {
    e.preventDefault();
    chcSelect.value.pageChange(chcSelect.value.params.current - 1);
  }
};
const totalHandleLoading = ref(false);
const handleTotalSave = () => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    return message.error('当前表格存在未保存信息，请保存后再操作！');
  }
  totalHandleLoading.value = true;
  // console.warn('chcGridApi', chcGridApi.grid.getData());

  chcGridApi.formApi.getValues().then(async (res) => {
    const params = queryparams('saveDo', res, []);

    // console.warn('params', paramsNew);
    saveDo(params)
      .then(() => {
        totalHandleLoading.value = false;
        currentTab.value = 0;
        message.success('保存成功');
      })
      .catch(() => {
        totalHandleLoading.value = false;
      });
  });
};
const searchFocus = ref(false);
const serachInputVal = ref(undefined);
const handleSearch = () => {
  if (serachInputVal.value) {
    // 将所有匹配输入值的项check状态改为选中
    for (let i = 0; i < gridData.value.length; i++) {
      const item = gridData.value[i];
      if (
        (item.productCode && item.productCode.includes(serachInputVal.value)) ||
        (item.productName && item.productName.includes(serachInputVal.value)) ||
        (item.productValue && item.productValue.includes(serachInputVal.value))
      ) {
        chcGridApi.grid.setCheckboxRow(item, true);
      }
    }
  }
};
const handleSearchIpt = (e: any) => {
  serachInputVal.value = e.target.value;
};
const toggleSearchFocus = (val: boolean) => {
  searchFocus.value = val;
};
</script>
<template>
  <div class="h-full">
    <BatchAddModal />
    <ChcGrid>
      <template #toolbar-actions v-if="detailInfo?.type === 'edit'">
        <ChcSelect
          :autofocus="true"
          :paginate="true"
          :allow-clear="false"
          ref="chcSelect"
          placeholder="请输入药品编码、药品名称、规格"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/productAction/query.do"
          popup-class-name="productSelection"
          @dropdown-visible-change="handleDropdownVisibleChange"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
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
                current: undefined,
                pageNum: params.current,
                pageSize: params.size,
                size: undefined,
              };
            }
          "
          label-field="productName"
          value-field="productCode"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
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
              header: '单位',
              name: 'uomName',
              width: 80,
            },
            {
              header: '采购价',
              name: 'price',
              width: 80,
            },
            {
              header: '库存',
              name: 'storageQty',
              width: 80,
            },
          ]"
          data-testid="ChcSelectNew_product_documentDetail"
        />
        <Button
          type="primary"
          @click="handleBatchAdd"
          class="mr-[0.5rem]"
          data-testid="button_batchAdd_documentDetail"
        >
          批量添加
        </Button>
        <!-- <Button type="primary" @click="handleDel" class="mr-[0.5rem]">
          删除
        </Button> -->
      </template>
      <template #toolbar-tools>
        <Input
          @input="handleSearchIpt"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入药品关键词"
          @keyup.enter="handleSearch"
          @focus="toggleSearchFocus(true)"
          @blur="toggleSearchFocus(false)"
          data-testid="input_search_documentDetail"
        />
        <Button
          type="primary"
          @click="handleSearch"
          data-testid="button_search_documentDetail"
        >
          搜索
        </Button>
      </template>
      <template #action="scope">
        <Button
          type="primary"
          danger
          ghost
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailInfo?.type === 'edit'"
          :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
        >
          删行
        </Button>
        <!--   v-if="detailInfo?.type === 'edit'" -->
      </template>
      <template #bottom>
        <div class="flex items-center justify-between pt-[10px]">
          <div>汇总信息</div>
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              ghost
              @click="handleTotalSave"
              :loading="totalHandleLoading"
              v-if="detailInfo?.type === 'edit'"
              data-testid="button_save_documentDetail"
            >
              保存
            </Button>

            <Button
              type="primary"
              ghost
              danger
              @click="handleClose"
              :bordered="false"
              :loading="totalHandleLoading"
              data-testid="button_back_documentDetail"
            >
              返回
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}

::v-deep(.vxe-tools--wrapper .ant-input) {
  padding: 2px 7px;
}
</style>
