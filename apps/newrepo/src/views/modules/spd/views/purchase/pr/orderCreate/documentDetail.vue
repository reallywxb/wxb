<script lang="ts" setup>
import { h, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { isEmpty } from '@vben/utils';

import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';

import { useGlobalPrintStore } from '@vben/stores';
import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { detailCommit, deleteLine, modifyLine, addLine } from './api';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);

const route = useRoute();
const globalPrintStore = useGlobalPrintStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const receiptType = urlParams?.receiptType || '';
const invoiceMethod = urlParams?.invoiceMethod || '';
const isAllowPRTaxInvoiceNo = urlParams?.isAllowPRTaxInvoiceNo || 'Y';
const isAllowPRUpdatePrice = urlParams?.isAllowPRUpdatePrice || 'N';

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', { required: true });

const submitLoading = ref(false);
const departmentId = ref<number | string>('');
const isFirstLoaded = ref(false);
// 子表总条数
const childTableTotal = ref(0);
// 新建页：根据子表数据动态禁用表单字段
const toggleFormDisabledStatus = ({ disabled }: { disabled: boolean }) => {
  if (detailInfo.value?.type === 'add') {
    ChcGridApi.formApi?.updateSchema([
      {
        fieldName: 'departmentId',
        componentProps: { disabled },
      },
      {
        fieldName: 'warehouseId',
        componentProps: { disabled },
      },
      {
        fieldName: 'vendorId',
        componentProps: { disabled },
      },
    ]);
  }
};

// 退货类型、退货原因、统计信息
const summarizeData = reactive({
  productCount: 0,
  totalQty: 0,
  totalPrice: 0,
});
const submitForm = reactive({
  returnType: '',
  returnReason: '',
});

// 更新统计信息（从后端返回的数据中获取）
const updateSummarize = (data: any) => {
  summarizeData.productCount = data.productCount || 0;
  summarizeData.totalQty = data.totalQty || 0;
  summarizeData.totalPrice = data.totalPrice || 0;
};

// 重置表单数据
const resetSubmitForm = () => {
  submitForm.returnType = '';
  submitForm.returnReason = '';
};

// 重置统计信息
const resetSummarize = () => {
  summarizeData.productCount = 0;
  summarizeData.totalQty = 0;
  summarizeData.totalPrice = 0;
};

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 使用LazySearch等待仓库和供应商都有值后再自动查询
// @description 定义查询控制器，等待仓库和供应商两个组件加载完成后再触发查询
const searchController = new LazySearch(2, async () => {
  await nextTick();
  const formValues = await ChcGridApi.formApi.getValues();
  if (
    !isEmpty(formValues.warehouseId) &&
    !isEmpty(formValues.vendorId) &&
    !isFirstLoaded.value
  ) {
    // 仓库和供应商都有值时才查询（要退货的商品仓库和供应商必须一致）
    isFirstLoaded.value = true;
    ChcGridApi.query(formValues);
  }
});

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 生成采退订单编辑页改为父表+子表结构
// @description 父表使用原来的查询表格字段和接口，子表暂时用假数据（TODO）
const EDITABLE_FIELDS = new Set(['qtyReturn', 'taxInvoiceNo', 'invoiceDate']);

// 父表配置

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      collapsed: false,
      submitButtonOptions: {
        content: '查询',
      },
      resetButtonOptions: {
        content: '重置',
      },
      handleReset: async (values: Record<string, any>) => {
        console.log('handleReset values', values);
        // 编辑页不允许重置
        if (parentData.value?.orderId) {
          return;
        }
        // 新建页子表有数据时不执行重置
        if (childTableTotal.value > 0) {
          return;
        }
        await ChcGridApi.formApi?.resetForm();
      },
      handleSubmit: async (values: any) => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      checkboxConfig: {
        highlight: true,
        trigger: 'row',
        reserve: true,
      },
      editConfig: {
        enabled:
          detailInfo.value?.type === 'edit' || detailInfo.value?.type === 'add',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (
          EDITABLE_FIELDS.has(column.field) &&
          (detailInfo.value?.type === 'edit' ||
            detailInfo.value?.type === 'add')
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/orderReturnAction/queryStorage.do?isScatter=Y&showLocator=Y',
    gridColumns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'qtyAvailable',
        title: '可用数量',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyReturn',
        title: '退货数量',
        minWidth: '90',
        align: 'right',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
          },
        },
      },
      {
        field: 'pricePo',
        title: '采购价',
        minWidth: '80',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePo);
        },
        align: 'right',
      },
      { field: 'lot', title: '批号', minWidth: '100' },
      { field: 'guaranteeDate', title: '效期', minWidth: '100' },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: '100',
        editRender: {
          name: 'VxeInput',
        },
      },
      {
        field: 'invoiceDate',
        title: '发票日期',
        minWidth: '120',
        editRender: {
          name: 'VxeDatePicker',
        },
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        minWidth: '90',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        rules: parentData.value?.orderId ? '' : 'required',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            disabled: !!parentData.value?.departmentId,
            defaultValue: parentData.value?.departmentId || undefined,
            onChange(val: any) {
              departmentId.value = val;
            },
            afterFetch(res: any) {
              if (res.rows?.length) {
                if (detailInfo.value?.type === 'add') {
                  const firstOption = res.rows[0];
                  departmentId.value = firstOption.id;
                  if (
                    ChcGridApi.formApi?.getFieldComponentRef &&
                    typeof ChcGridApi.formApi?.getFieldComponentRef ===
                      'function' &&
                    ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
                  ) {
                    ChcGridApi.formApi.getFieldComponentRef(
                      'warehouseId',
                    ).params.dependencies = {
                      regionId: firstOption.id,
                      departmentId: firstOption.id,
                    };
                    ChcGridApi.formApi
                      ?.getFieldComponentRef('warehouseId')
                      ?.fetchApi();
                  }
                }
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        rules: parentData.value?.orderId ? '' : 'required',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            disabled: !!parentData.value?.warehouseId,
            defaultValue: parentData.value?.warehouseId || undefined,
            afterFetch(res: any) {
              if (res.rows?.length) {
                if (!parentData.value?.warehouseId) {
                  const firstOption = res.rows[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    firstOption.id,
                  );
                }
              }
              // 延迟sign确保autoChooseFirstOption设置的值已生效
              setTimeout(() => {
                searchController.sign();
              }, 100);
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              // 编辑页有默认值时不清空
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                detailInfo.value?.type === 'add'
                  ? undefined
                  : parentData.value?.warehouseId,
              );
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        rules: parentData.value?.orderId ? '' : 'required',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            // autoChooseFirstOption: true,
            disabled: !!parentData.value?.bpartnerId,
            defaultValue: parentData.value?.bpartnerId || undefined,
            afterFetch(res: any) {
              // 新建页面且无默认值时自动选择第一个
              if (res?.rows?.length && isEmpty(parentData.value?.bpartnerId)) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue('vendorId', firstOption.id);
              }
              // 延迟sign确保值已生效（编辑页由defaultValue处理）
              setTimeout(() => {
                searchController.sign();
              }, 100);
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            showChooseAll: false,
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: '请选择存货状态',
            paginate: false,
            immediate: true,
            disabled: !!parentData.value?.storageStatus,
            labelField: 'name',
            valueField: 'id',
            afterFetch: (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: parentData.value?.storageStatus || 'R',
        fieldName:  'storageStatus',
        label: '存货状态',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          allowClear: true,
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: {
          allowClear: true,
        },
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '备注',
        componentProps: {
          allowClear: true,
        },
      },
    ],
    beforeFetchFn: (params) => {
      if (receiptType) {
        params.receiptType = receiptType;
      }
      if (invoiceMethod) {
        params.invoiceMethod = invoiceMethod;
      }
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        limit: params.pageSize,
        start: (params.pageNum - 1) * params.pageSize || 0,
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

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 子表暂时用假数据
// @description 子表展示已添加的退货明细，暂时没有数据接口，先写假数据标记TODO
const CHILD_EDITABLE_FIELDS = new Set([
  'qtyOrdered',
  'taxInvoiceNo',
  'invoiceDate',
]);

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 子表编辑自动保存
// @description 子表编辑状态控制和自动保存相关变量
const currentInsertRows = ref<any[]>([]);
const currentUpdateRows = ref<any[]>([]);
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait');
const currentEditRow = ref<any>();
const currentField = ref('');

const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      editConfig: {
        enabled:
          detailInfo.value?.type === 'edit' || detailInfo.value?.type === 'add',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (
          CHILD_EDITABLE_FIELDS.has(column.field) &&
          (detailInfo.value?.type === 'edit' ||
            detailInfo.value?.type === 'add')
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      keepSource: true,
    }),
    gridEvents: {
      editActivated: (scope: any) => {
        currentEditRow.value = scope.row;
        currentField.value = scope.column.field;
      },
      editClosed: async ({ row }: any) => {
        currentInsertRows.value = roleGridApi.grid.getInsertRecords();
        currentUpdateRows.value = roleGridApi.grid.getUpdateRecords();

        if (autoSaveController.value === 'onSaving') {
          currentEditRow.value = undefined;
          currentField.value = '';
        } else {
          autoSaveController.value = 'onSaving';

          if (
            roleGridApi.grid.isInsertByRow(row) ||
            roleGridApi.grid.isUpdateByRow(row)
          ) {
            currentEditRow.value = undefined;
            currentField.value = '';
            handleSaveOrder({
              $grid: roleGridApi.grid,
              row,
            })
              .then(() => {
                autoSaveController.value = 'wait';
                currentInsertRows.value = [];
                currentUpdateRows.value = [];

                if (action.value === 'commit') {
                  // 提交保存
                  handleCommit();
                }
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
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'documentNo',
        title: '订单编号',
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 200,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: 130,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: 80,
      },
      {
        field: 'qtyOrdered',
        title: '申请数量',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
          },
        },
        minWidth: 90,
        align: 'right',
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        minWidth: 100,
        editRender: {
          name: 'VxeInput',
        },
      },
      {
        field: 'invoiceDate',
        title: '发票日期',
        minWidth: 120,
        editRender: {
          name: 'VxeDatePicker',
        },
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
        field: 'vendorName',
        title: '供应商',
        minWidth: 110,
      },
      {
        field: 'pricePO',
        title: '采购价',
        minWidth: 80,
        align: 'right',
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        minWidth: 100,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: 150,
      },
      {
        align: 'center',
        field: 'action',
        visible:
          detailInfo.value?.type === 'edit' || detailInfo.value?.type === 'add',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    id: 'child',
    queryUrl: '/orderAction/queryLine.do',
    afterFetchFn: (res) => {
      // 从后端返回的汇总数据中更新统计信息
      updateSummarize({
        productCount: res.productNum,
        totalQty: res.totalNum,
        totalPrice: res.totalPrice,
      });
      childTableTotal.value = res?.total || 0;
      if (detailInfo.value?.type === 'add') {
        toggleFormDisabledStatus({ disabled: res?.total ? true : false });
      }
      return {
        ...res,
        records: res?.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        orderIds: parentData.value?.orderId,
        productName: productName.value,
      };
    },
  },
);

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 子表行编辑自动保存
// @description 保存子表单行编辑数据（新增或修改）
const handleSaveOrder = async (scope: any) => {
  console.log('handleSaveOrder scope', scope);
  return new Promise((resolve) => {
    const params = {
      orderId: scope?.row?.orderId,
      lineData: JSON.stringify({ data: [scope.row] }),
    };
    modifyLine(params).then(async (res) => {
      if (res && res?.success) {
        message.success('修改成功');
        const formValues = await ChcGridApi.grid.getFullData();
        roleGridApi.query();
        ChcGridApi.query({ ...formValues });
        resolve(res);
      }
    });
  });
};

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 添加按钮：将父表选中的数据添加到子表
// @description 验证选中数据后添加到子表（TODO: 实际应该调用接口保存）
const handleAdd = async () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords(true);
  if (selectedRows.length === 0) {
    return message.warning('请选择要添加的数据');
  }

  let error = false;
  const errMsgArr: string[] = [];
  const fullData = ChcGridApi.grid.getFullData();

  for (const item of selectedRows) {
    const rowIndex = fullData.findIndex((row: any) => row === item);
    const displayRow = rowIndex >= 0 ? rowIndex + 1 : '?';

    if (!item.qtyReturn || item.qtyReturn === '' || item.qtyReturn === '0') {
      errMsgArr.push(
        `第${displayRow}行: ${item.productName}(${item.productCode})没有退货数量!`,
      );
      error = true;
    }
    if (item.qtyReturn > item.qtyAvailable) {
      errMsgArr.push(
        `第${displayRow}行: ${item.productName}(${item.productCode})退货数量大于可退数量!`,
      );
      error = true;
    }

    // 后结算批次不能输入发票号，暂取消录发票号功能
    if (
      isAllowPRTaxInvoiceNo === 'Y' &&
      Number(item.invoiceMethod) !== 2 && // 非后结算
      !item.taxInvoiceNo &&
      (Number(item.receiptType) === 1 || Number(item.receiptType) === 4)
    ) {
      // 仅正常采购和急救采购批次需要发票号
      errMsgArr.push(
        `第${displayRow}行: ${item.productName}(${item.productCode})缺少发票号`,
      );
      error = true;
    }

    // 其它采购类型，只提示，不强制拦截
    if (
      isAllowPRTaxInvoiceNo === 'Y' &&
      Number(item.invoiceMethod) !== 2 && // 非后结算
      !item.taxInvoiceNo
    ) {
      // 仅提示，不拦截
      console.warn(
        `第${displayRow}行: ${item.productName}(${item.productCode})缺少发票号！`,
      );
    }
  }

  if (error) {
    return message.warning(errMsgArr.join('\n'));
  }
  // 构建接口参数
  const params: Record<string, any> = {
    lines: JSON.stringify(selectedRows),
    warehouseId: selectedRows[0]?.warehouseId,
    bpartnerId: selectedRows[0]?.vendorId,
    returnType: submitForm.returnType,
    returnReason: submitForm.returnReason,
    orderIds: parentData.value?.orderId,
  };

  try {
    const res = await addLine(params);
    if (!res?.success) {
      throw new Error(res?.message || '添加数据失败');
    }
    // 处理新增的 orderIds：判断是否已包含，未包含则追加
    if (res?.orderIds && res.orderIds.length > 0) {
      const currentIds = parentData.value?.orderId
        ? String(parentData.value.orderId).split(',').filter(Boolean)
        : [];
      for (const id of res.orderIds) {
        if (!currentIds.includes(id)) {
          currentIds.push(id);
        }
      }
      parentData.value.orderId = currentIds.join(',');
    }
    message.success(`已成功添加${selectedRows.length}条数据`);
    // 清空选中状态
    ChcGridApi.grid.clearCheckboxRow();
    // 刷新表格数据
    const formValues = await ChcGridApi?.formApi?.getValues();
    ChcGridApi.query({ ...formValues });
    // 刷新子表数据
    roleGridApi.query();
  } catch (error) {
    console.error('添加失败', error);
  }
};

const handleDeleteRow = (scope: any) => {
  Modal.confirm({
    title: '提示',
    content: '确定要删除该行数据吗？',
    onOk: async () => {
      deleteLine({
        orderId: parentData.value.orderId,
        lineData: JSON.stringify({ data: [scope.row] }),
      }).then((res) => {
        if (res && res.success) {
          message.success('删除成功');
          roleGridApi.query();
          // 父表重新查询
          ChcGridApi.formApi.getValues().then((formValues: any) => {
            ChcGridApi.query(formValues);
          });
        }
      });
    },
  });
};

// AI-GENERATED-BEGIN
// @date 2026-06-22
// @prompt 提交按钮：提交采退订单
// @description 提交保存采退订单
const action = ref('');

const handleTotalSubmit = async () => {
  const tableData = roleGridApi.grid.getData();
  if (tableData.length === 0) {
    return message.error('请添加需退货的商品！');
  }
  if (roleGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (roleGridApi.grid.getUpdateRecords().length > 0) {
    action.value = 'commit';
    return;
  }
  handleCommit();
};

const handleCommit = () => {
  const tableData = roleGridApi.grid.getData();
  if (tableData.length === 0) {
    return message.error('请添加需退货的商品！');
  }

  // AI-GENERATED-BEGIN
  // @date 2026-07-03
  // @prompt 提交时校验子表发票号和发票日期必填
  // @description 提交时检查所有子表数据，若存在发票号或发票日期为空的行，则拦截提交
  const missingInvoiceRows: string[] = [];
  tableData.forEach((item: any, index: number) => {
    if (!item.taxInvoiceNo || String(item.taxInvoiceNo).trim() === '') {
      missingInvoiceRows.push(
        `第${index + 1}行 ${item.productName}(${item.productCode})缺少发票号`,
      );
    }
    if (!item.invoiceDate) {
      missingInvoiceRows.push(
        `第${index + 1}行 ${item.productName}(${item.productCode})缺少发票日期`,
      );
    }
  });
  if (missingInvoiceRows.length > 0) {
    return message.warning(
      `子表以下数据未填写发票信息：\n${missingInvoiceRows.join('\n')}`,
    );
  }
  // AI-GENERATED-END

  const params = {
    orderId: parentData.value?.orderId,
    // returnType: submitForm.returnType,
    // returnReason: submitForm.returnReason,
    // // 供应商
    // bpartnerId: tableData[0]?.vendorId,
    // // 仓库
    // warehouseId: tableData[0]?.warehouseId,
  };
  submitLoading.value = true;
  detailCommit(params)
    .then((res) => {
      if (res && res.success) {
        const count = res.orderNos ? res.orderNos.length : 0;
        const orderNos = res.orderNos ? res.orderNos.join(',') : '';
        message.success(`已成功生成${count}个退货订单，订单号：${orderNos}`);
        action.value = '';
        currentTab.value = 0;

        if (res.success && res.orderIds && res.orderIds.length > 0) {
          const idsStr = Array.isArray(res.orderIds)
            ? res.orderIds.join(',')
            : res.orderIds;
          globalPrintStore.print({
            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/spdPrintReportAction/printPRInOutDocByOrder?orderID=${encodeURIComponent(idsStr)}`,
          });
        }
      }
    })
    .finally(() => {
      submitLoading.value = false;
    });
};

const productName = ref('');
const handleSearch = () => {
  if (!parentData.value?.orderId) {
    return message.error('请先保存单据！');
  }
  roleGridApi.query();
};

onMounted(() => {
  if (parentData.value?.orderId) {
    // 编辑页：设置院区、仓库、供应商默认值后直接查询
    ChcGridApi.formApi.setValues({
      departmentId: parentData.value.departmentId,
      warehouseId: parentData.value.warehouseId,
      vendorId: parentData.value.bpartnerId,
    });
    isFirstLoaded.value = true;
    ChcGridApi.query({
      departmentId: parentData.value.departmentId,
      warehouseId: parentData.value.warehouseId,
      vendorId: parentData.value.bpartnerId,
    });
    // 子表自动查询
    roleGridApi.query();
  }
});

// 监听页面切换，打开页面时重置数据
watch(
  () => currentTab.value,
  (val) => {
    if (val === props.thisTab.value) {
      isFirstLoaded.value = false;
      resetSubmitForm();
      resetSummarize();
    }
  },
);
</script>

<template>
  <div class="box-border h-full w-full">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid class="flex-1 overflow-hidden">
          <template #toolbar-actions>
            <Button
              v-if="detailInfo?.type !== 'view'"
              type="primary"
              @click="handleAdd"
              class="mr-[0.5rem]"
              data-testid="button_add_documentDetail"
            >
              添 加
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
          </template>
          <template #toolbar-tools>
            <div class="jus box-border flex w-full items-center justify-start">
              <div class="flex items-center justify-start">
                <label
                  class="leading-1 mr-2 flex w-[70px] flex-shrink-0 items-center justify-end text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  退货类型
                </label>
                <ChcSelect
                  v-model="submitForm.returnType"
                  class="mr-[10px] w-[140px]"
                  dict-url="/baseHandleAction/refList.do?id=1000444"
                  placeholder="请选择退货类型"
                  allow-clear
                  :paginate="false"
                  :disabled="detailInfo?.type === 'view'"
                  label-field="name"
                  value-field="id"
                  :filter-by-front-end="true"
                  :auto-choose-first-option="true"
                  :after-fetch="
                    (res: any) => {
                      return { ...res, rows: undefined, records: res.rows };
                    }
                  "
                />
              </div>
              <div class="flex items-center justify-start">
                <label
                  class="leading-1 mr-2 flex w-[70px] flex-shrink-0 items-center justify-end text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  退货原因
                </label>
                <Input
                  v-model:value="submitForm.returnReason"
                  class="w-[200px]"
                  placeholder="退货原因"
                  allow-clear
                  :disabled="detailInfo?.type === 'view'"
                />
              </div>
            </div>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <RoleGrid>
          <template #toolbar-tools>
            <div class="jus box-border flex w-full items-center justify-start">
              <span class="mr-[16px]">
                退货笔数：{{ summarizeData.productCount }}
              </span>
              <span class="mr-[16px]">
                合计数量：{{ summarizeData.totalQty }}
              </span>
              <span class="mr-[16px]">
                合计金额(元)：{{ summarizeData.totalPrice.toFixed(2) }}
              </span>
            </div>
          </template>
          <template #toolbar-actions>
            <div class="mt-[10px]">
              <Input
                v-model:value="productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_product_name_documentDetail"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search_documentDetail"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </div>
          </template>
          <template #action="scope">
            <Button
              v-if="detailInfo?.value?.type !== 'view'"
              type="primary"
              ghost
              danger
              @click="handleDeleteRow(scope)"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
            >
              删行
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
          </template>
          <template #bottom>
            <div class="flex items-center justify-center pt-[10px]">
              <Button
                v-if="detailInfo?.value?.type !== 'view'"
                type="primary"
                @click="handleTotalSubmit"
                :loading="submitLoading"
                data-testid="button_submit_documentDetail"
              >
                提交
              </Button>
            </div>
          </template>
        </RoleGrid>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
